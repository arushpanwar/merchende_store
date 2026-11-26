import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { kitLabel } from "@/lib/kit";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl tracking-wide">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-pitch px-4 py-2 text-sm font-semibold text-fog"
        >
          Add product
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto border border-line bg-fog">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Inventory</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id} className="border-b border-line/70">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.club} · {kitLabel(p.kitType)}
                    </p>
                  </td>
                  <td className="px-4 py-3">{formatINR(p.priceInPaise)}</td>
                  <td className="px-4 py-3">
                    {p.trackInventory ? `${stock} units` : "Not tracked"}
                  </td>
                  <td className="px-4 py-3">{p.active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-pitch hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
