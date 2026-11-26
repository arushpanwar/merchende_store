import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import Razorpay from "razorpay";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shippingFor } from "@/lib/money";
import { generateOrderNumber } from "@/lib/orders";

const bodySchema = z.object({
  paymentMethod: z.enum(["PREPAID", "COD"]),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(8),
  }),
  shipping: z.object({
    name: z.string().min(1),
    phone: z.string().min(8),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(4),
  }),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = bodySchema.parse(json);
    const session = await getServerSession(authOptions);

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: data.items.map((i) => i.variantId) } },
      include: { product: true },
    });

    if (variants.length !== data.items.length) {
      return NextResponse.json(
        { error: "One or more cart items are invalid." },
        { status: 400 },
      );
    }

    const lineItems = data.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      if (!variant.product.active) {
        throw new Error(`${variant.product.name} is unavailable.`);
      }
      if (
        variant.product.trackInventory &&
        variant.stock < item.quantity
      ) {
        throw new Error(
          `Not enough stock for ${variant.product.name} (${variant.size}).`,
        );
      }
      return { item, variant };
    });

    const subtotalInPaise = lineItems.reduce(
      (sum, { item, variant }) =>
        sum + variant.product.priceInPaise * item.quantity,
      0,
    );
    const shippingInPaise = shippingFor(data.paymentMethod);
    const totalInPaise = subtotalInPaise + shippingInPaise;

    let userId: string | undefined;
    if (session?.user?.role !== "admin" && session?.user?.id) {
      userId = session.user.id;
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.customer.name,
          phone: data.customer.phone,
        },
      });
    } else {
      const existing = await prisma.user.findUnique({
        where: { email: data.customer.email.toLowerCase() },
      });
      if (existing) {
        userId = existing.id;
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: data.customer.name,
            phone: data.customer.phone,
          },
        });
      } else {
        const created = await prisma.user.create({
          data: {
            email: data.customer.email.toLowerCase(),
            name: data.customer.name,
            phone: data.customer.phone,
          },
        });
        userId = created.id;
      }
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      for (const { item, variant } of lineItems) {
        if (variant.product.trackInventory) {
          const updated = await tx.productVariant.updateMany({
            where: { id: variant.id, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (updated.count === 0) {
            throw new Error(
              `Not enough stock for ${variant.product.name} (${variant.size}).`,
            );
          }
        }
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId,
          guestEmail: data.customer.email.toLowerCase(),
          guestName: data.customer.name,
          guestPhone: data.customer.phone,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentMethod === "COD" ? "PENDING" : "PENDING",
          orderStatus: data.paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
          subtotalInPaise,
          shippingInPaise,
          totalInPaise,
          shippingName: data.shipping.name,
          shippingPhone: data.shipping.phone,
          shippingLine1: data.shipping.line1,
          shippingLine2: data.shipping.line2,
          shippingCity: data.shipping.city,
          shippingState: data.shipping.state,
          shippingPincode: data.shipping.pincode,
          items: {
            create: lineItems.map(({ item, variant }) => ({
              productId: variant.productId,
              variantId: variant.id,
              productName: variant.product.name,
              club: variant.product.club,
              kitType: variant.product.kitType,
              size: variant.size,
              quantity: item.quantity,
              unitPriceInPaise: variant.product.priceInPaise,
            })),
          },
        },
      });
    });

    if (data.paymentMethod === "COD") {
      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay is not configured on the server." },
        { status: 400 },
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const rpOrder = await razorpay.orders.create({
      amount: totalInPaise,
      currency: "INR",
      receipt: order.orderNumber,
      notes: { orderId: order.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rpOrder.id },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: rpOrder.id,
      amount: totalInPaise,
    });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues[0]?.message ?? "Invalid request"
        : err instanceof Error
          ? err.message
          : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
