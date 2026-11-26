import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide">Orders</h1>
      <div className="mt-8 overflow-x-auto border border-line bg-fog">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line/70">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-pitch hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                  <p className="text-xs text-muted">
                    {o.createdAt.toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {o.guestName || "—"}
                  <p className="text-xs text-muted">{o.guestEmail}</p>
                </td>
                <td className="px-4 py-3">{o._count.items}</td>
                <td className="px-4 py-3">{formatINR(o.totalInPaise)}</td>
                <td className="px-4 py-3">
                  {o.paymentMethod}
                  <p className="text-xs text-muted">{o.paymentStatus}</p>
                </td>
                <td className="px-4 py-3">{o.orderStatus}</td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No orders yet — place a COD order from the storefront to test.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
