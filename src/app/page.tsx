import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/product-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
    take: 4,
  });

  return (
    <div>
      <section className="hero-pitch relative min-h-[88vh] overflow-hidden text-fog">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20">
          <p className="animate-fade font-display text-[clamp(4.5rem,18vw,11rem)] leading-[0.85] tracking-[0.04em] uppercase">
            Merchende
          </p>
          <h1 className="animate-rise mt-4 max-w-xl font-display text-3xl tracking-wide text-lime sm:text-4xl">
            Club kits. Nothing else.
          </h1>
          <p className="animate-rise-delay mt-4 max-w-md text-base text-mist/90 sm:text-lg">
            Home, away, third, and special editions — authentic club look,
            every size, no name or number printing.
          </p>
          <div className="animate-rise-delay mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="bg-lime px-6 py-3 text-sm font-semibold text-ink transition hover:brightness-110"
            >
              Shop kits
            </Link>
            <Link
              href="/size-guide"
              className="border border-fog/40 px-6 py-3 text-sm text-fog transition hover:border-fog hover:bg-white/5"
            >
              Size guide
            </Link>
          </div>
        </div>
      </section>

      <section className="jersey-grid mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl tracking-wide text-ink">
              Featured kits
            </h2>
            <p className="mt-2 text-muted">
              Fresh club colours for the season.
            </p>
          </div>
          <Link href="/shop" className="text-sm text-pitch hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
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
      </section>

      <section className="border-y border-line bg-pitch-deep text-fog">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-3 sm:px-6">
          <div>
            <p className="font-display text-2xl text-lime">Club only</p>
            <p className="mt-2 text-sm text-mist/80">
              Jerseys from the clubs you follow — no shorts, socks, or
              accessories in v1.
            </p>
          </div>
          <div>
            <p className="font-display text-2xl text-lime">Free prepaid ship</p>
            <p className="mt-2 text-sm text-mist/80">
              Pay online with Razorpay and shipping is on us. COD adds ₹70.
            </p>
          </div>
          <div>
            <p className="font-display text-2xl text-lime">Guest friendly</p>
            <p className="mt-2 text-sm text-mist/80">
              Checkout as a guest or sign in with Google — your call.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
