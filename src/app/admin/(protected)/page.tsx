import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, orderCount, customerCount, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Products", value: productCount, href: "/admin/products" },
          { label: "Orders", value: orderCount, href: "/admin/orders" },
          {
            label: "Customers",
            value: customerCount,
            href: "/admin/customers",
          },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="border border-line bg-fog p-5 transition hover:border-pitch"
          >
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-2 font-display text-4xl">{s.value}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 font-display text-2xl tracking-wide">
        Recent orders
      </h2>
      <div className="mt-4 overflow-x-auto border border-line bg-fog">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-line/70">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-pitch hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{formatINR(o.totalInPaise)}</td>
                <td className="px-4 py-3">
                  {o.paymentMethod} / {o.paymentStatus}
                </td>
                <td className="px-4 py-3">{o.orderStatus}</td>
              </tr>
            ))}
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No orders yet
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
