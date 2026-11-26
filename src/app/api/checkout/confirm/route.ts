import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay is not configured." },
        { status: 400 },
      );
    }

    const expected = createHmac("sha256", secret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");

    if (expected !== data.razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature." },
        { status: 400 },
      );
    }

    const order = await prisma.order.update({
      where: { id: data.orderId },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        razorpayPaymentId: data.razorpay_payment_id,
        razorpayOrderId: data.razorpay_order_id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Confirmation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
