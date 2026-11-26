import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { ALL_SIZES } from "@/lib/kit";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!product) notFound();

  const variants = ALL_SIZES.map((size) => {
    const existing = product.variants.find((v) => v.size === size);
    return { size, stock: existing?.stock ?? 0, sku: existing?.sku };
  });

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide">Edit product</h1>
      <div className="mt-8">
        <ProductForm
          mode="edit"
          productId={product.id}
          initial={{
            name: product.name,
            slug: product.slug,
            club: product.club,
            kitType: product.kitType,
            description: product.description,
            priceInRupees: String(product.priceInPaise / 100),
            imageUrl: product.imageUrl,
            trackInventory: product.trackInventory,
            active: product.active,
            variants,
          }}
        />
      </div>
    </div>
  );
}
