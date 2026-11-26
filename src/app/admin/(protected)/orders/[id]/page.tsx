import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { kitLabel } from "@/lib/kit";
import { OrderStatusForm } from "@/components/admin/order-status-form";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true },
  });
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-muted hover:text-pitch">
        ← Orders
      </Link>
      <h1 className="mt-3 font-display text-4xl tracking-wide">
        {order.orderNumber}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {order.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}{" "}
        IST
      </p>

      <div className="mt-8">
        <OrderStatusForm
          orderId={order.id}
          orderStatus={order.orderStatus}
          paymentStatus={order.paymentStatus}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="border border-line bg-fog p-5 text-sm">
          <h2 className="font-medium">Customer</h2>
          <p className="mt-3">{order.guestName}</p>
          <p className="text-muted">{order.guestEmail}</p>
          <p className="text-muted">{order.guestPhone}</p>
          {order.userId ? (
            <p className="mt-2 text-xs text-muted">
              Linked user id: {order.userId}
            </p>
          ) : null}
        </div>
        <div className="border border-line bg-fog p-5 text-sm">
          <h2 className="font-medium">Shipping</h2>
          <p className="mt-3">{order.shippingName}</p>
          <p className="text-muted">{order.shippingPhone}</p>
          <p className="mt-2 text-muted">
            {order.shippingLine1}
            {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
            <br />
            {order.shippingCity}, {order.shippingState} {order.shippingPincode}
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto border border-line bg-fog">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Line</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-line/70">
                <td className="px-4 py-3">
                  {item.productName}
                  <p className="text-xs text-muted">
                    {item.club} · {kitLabel(item.kitType)}
                  </p>
                </td>
                <td className="px-4 py-3">{item.size}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">
                  {formatINR(item.unitPriceInPaise)}
                </td>
                <td className="px-4 py-3">
                  {formatINR(item.unitPriceInPaise * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 max-w-sm space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Subtotal</span>
          <span>{formatINR(order.subtotalInPaise)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Shipping ({order.paymentMethod})</span>
          <span>
            {order.shippingInPaise === 0
              ? "Free"
              : formatINR(order.shippingInPaise)}
          </span>
        </div>
        <div className="flex justify-between border-t border-line pt-2 font-medium">
          <span>Total</span>
          <span>{formatINR(order.totalInPaise)}</span>
        </div>
      </div>
    </div>
  );
}
