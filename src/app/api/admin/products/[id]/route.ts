import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";
import { ALL_SIZES } from "@/lib/kit";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  club: z.string().min(1),
  kitType: z.enum(["HOME", "AWAY", "THIRD", "SPECIAL"]),
  description: z.string().min(1),
  priceInPaise: z.number().int().positive(),
  imageUrl: z.string().min(1),
  trackInventory: z.boolean(),
  active: z.boolean(),
  variants: z.array(
    z.object({
      size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
      stock: z.number().int().min(0),
    }),
  ),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;

  try {
    const data = schema.parse(await req.json());
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          club: data.club,
          kitType: data.kitType,
          description: data.description,
          priceInPaise: data.priceInPaise,
          imageUrl: data.imageUrl,
          trackInventory: data.trackInventory,
          active: data.active,
        },
      });

      for (const size of ALL_SIZES) {
        const stock = data.trackInventory
          ? (data.variants.find((v) => v.size === size)?.stock ?? 0)
          : 0;
        const sku = `${data.slug}-${size}`.toUpperCase();
        const existing = await tx.productVariant.findUnique({
          where: { productId_size: { productId: id, size } },
        });
        if (existing) {
          await tx.productVariant.update({
            where: { id: existing.id },
            data: { stock, sku },
          });
        } else {
          await tx.productVariant.create({
            data: { productId: id, size, stock, sku },
          });
        }
      }
    });
    return NextResponse.json({ id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;

  try {
    const orderItems = await prisma.orderItem.count({
      where: { productId: id },
    });
    if (orderItems > 0) {
      await prisma.product.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({
        id,
        softDeleted: true,
        message: "Product has orders — marked inactive instead of deleting.",
      });
    }
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
