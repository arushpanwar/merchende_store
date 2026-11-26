import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide">Customers</h1>
      <p className="mt-2 text-sm text-muted">
        Google sign-ins and guest checkouts both land here as customer records.
      </p>
      <div className="mt-8 overflow-x-auto border border-line bg-fog">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-line/70">
                <td className="px-4 py-3">{c.name || "—"}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.phone || "—"}</td>
                <td className="px-4 py-3">{c._count.orders}</td>
                <td className="px-4 py-3 text-muted">
                  {c.createdAt.toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}
                </td>
              </tr>
            ))}
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No customers yet
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
