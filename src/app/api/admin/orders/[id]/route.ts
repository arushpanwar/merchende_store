import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

const schema = z.object({
  orderStatus: z.enum([
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await params;

  try {
    const data = schema.parse(await req.json());
    const order = await prisma.order.update({
      where: { id },
      data,
    });
    return NextResponse.json({ id: order.id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
