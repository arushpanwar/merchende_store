import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/product-card";
import type { KitType } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

const FILTERS: { label: string; value: KitType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Home", value: "HOME" },
  { label: "Away", value: "AWAY" },
  { label: "Third", value: "THIRD" },
  { label: "Special", value: "SPECIAL" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ kit?: string; club?: string }>;
}) {
  const params = await searchParams;
  const kit = params.kit?.toUpperCase();
  const club = params.club;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(kit && kit !== "ALL" ? { kitType: kit as KitType } : {}),
      ...(club ? { club: { equals: club, mode: "insensitive" } } : {}),
    },
    orderBy: [{ club: "asc" }, { kitType: "asc" }],
  });

  const clubs = await prisma.product.findMany({
    where: { active: true },
    select: { club: true },
    distinct: ["club"],
    orderBy: { club: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl tracking-wide text-ink">Shop</h1>
      <p className="mt-2 text-muted">
        Club football kits — every size, no customization.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active =
            (f.value === "ALL" && !kit) || kit === f.value;
          const href =
            f.value === "ALL"
              ? club
                ? `/shop?club=${encodeURIComponent(club)}`
                : "/shop"
              : `/shop?kit=${f.value}${club ? `&club=${encodeURIComponent(club)}` : ""}`;
          return (
            <Link
              key={f.value}
              href={href}
              className={`px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-pitch text-fog"
                  : "bg-mist text-ink hover:bg-line"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={kit ? `/shop?kit=${kit}` : "/shop"}
          className={`px-3 py-1.5 text-xs ${
            !club ? "bg-ink text-fog" : "text-muted hover:text-ink"
          }`}
        >
          All clubs
        </Link>
        {clubs.map((c) => (
          <Link
            key={c.club}
            href={`/shop?club=${encodeURIComponent(c.club)}${kit ? `&kit=${kit}` : ""}`}
            className={`px-3 py-1.5 text-xs ${
              club === c.club
                ? "bg-ink text-fog"
                : "text-muted hover:text-ink"
            }`}
          >
            {c.club}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            slug={p.slug}
            name={p.name}
            club={p.club}
            kitType={p.kitType}
            priceInPaise={p.priceInPaise}
            imageUrl={p.imageUrl}
          />
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-muted">No kits match this filter.</p>
      ) : null}
    </div>
  );
}
