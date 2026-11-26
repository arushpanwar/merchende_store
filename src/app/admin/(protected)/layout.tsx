import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/customers", label: "Customers" },
  ];

  return (
    <div className="min-h-screen bg-mist/40">
      <div className="border-b border-line bg-fog">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-display text-xl tracking-wide text-ink"
            >
              Merchende Admin
            </Link>
            <nav className="flex flex-wrap gap-3 text-sm">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-muted hover:text-ink"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link href="/" className="text-sm text-pitch hover:underline">
            View store
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
