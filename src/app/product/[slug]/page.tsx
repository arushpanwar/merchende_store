import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { kitLabel } from "@/lib/kit";
import { AddToCart } from "@/components/storefront/add-to-cart";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: { orderBy: { size: "asc" } } },
  });

  if (!product || !product.active) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 sm:px-6">
      <div className="aspect-[4/5] overflow-hidden bg-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <Link href="/shop" className="text-sm text-muted hover:text-pitch">
          ← Shop
        </Link>
        <p className="mt-4 text-xs uppercase tracking-wider text-muted">
          {product.club} · {kitLabel(product.kitType)}
        </p>
        <h1 className="mt-2 font-display text-5xl tracking-wide text-ink">
          {product.name}
        </h1>
        <p className="mt-4 text-2xl text-ink">
          {formatINR(product.priceInPaise)}
        </p>
        <p className="mt-6 max-w-prose text-muted leading-relaxed">
          {product.description}
        </p>
        <AddToCart
          productId={product.id}
          slug={product.slug}
          name={product.name}
          club={product.club}
          kitType={product.kitType}
          priceInPaise={product.priceInPaise}
          imageUrl={product.imageUrl}
          trackInventory={product.trackInventory}
          variants={product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            stock: v.stock,
          }))}
        />
        <ul className="mt-10 space-y-2 border-t border-line pt-6 text-sm text-muted">
          <li>No name or number customization</li>
          <li>Free shipping on prepaid orders · ₹70 COD</li>
          <li>English-only storefront</li>
        </ul>
      </div>
    </div>
  );
}
