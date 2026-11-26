import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide">New product</h1>
      <div className="mt-8">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
