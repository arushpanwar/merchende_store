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

export async function POST(req: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const data = schema.parse(await req.json());
    const product = await prisma.product.create({
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
        variants: {
          create: ALL_SIZES.map((size) => {
            const v = data.variants.find((x) => x.size === size);
            return {
              size,
              stock: data.trackInventory ? (v?.stock ?? 0) : 0,
              sku: `${data.slug}-${size}`.toUpperCase(),
            };
          }),
        },
      },
    });
    return NextResponse.json({ id: product.id });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues[0]?.message ?? "Invalid"
        : err instanceof Error
          ? err.message
          : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
