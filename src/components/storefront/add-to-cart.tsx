"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import type { Size } from "@prisma/client";

type Variant = {
  id: string;
  size: Size;
  stock: number;
};

type Props = {
  productId: string;
  slug: string;
  name: string;
  club: string;
  kitType: string;
  priceInPaise: number;
  imageUrl: string;
  trackInventory: boolean;
  variants: Variant[];
};

export function AddToCart({
  productId,
  slug,
  name,
  club,
  kitType,
  priceInPaise,
  imageUrl,
  trackInventory,
  variants,
}: Props) {
  const addItem = useCart((s) => s.addItem);
  const available = variants.filter(
    (v) => !trackInventory || v.stock > 0,
  );
  const [size, setSize] = useState<Size | "">(available[0]?.size ?? "");
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.size === size);

  function onAdd() {
    if (!selected) return;
    addItem({
      productId,
      variantId: selected.id,
      slug,
      name,
      club,
      kitType,
      size: selected.size,
      priceInPaise,
      imageUrl,
      trackInventory,
      maxStock: trackInventory ? selected.stock : null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  if (available.length === 0) {
    return (
      <p className="mt-6 text-sm text-danger">Out of stock in all sizes.</p>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Size</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const disabled = trackInventory && v.stock <= 0;
            return (
              <button
                key={v.id}
                type="button"
                disabled={disabled}
                onClick={() => setSize(v.size)}
                className={`min-w-12 px-3 py-2 text-sm transition ${
                  size === v.size
                    ? "bg-pitch text-fog"
                    : disabled
                      ? "cursor-not-allowed bg-mist text-muted line-through"
                      : "bg-mist text-ink hover:bg-line"
                }`}
              >
                {v.size}
              </button>
            );
          })}
        </div>
        {trackInventory && selected ? (
          <p className="mt-2 text-xs text-muted">{selected.stock} in stock</p>
        ) : (
          <p className="mt-2 text-xs text-muted">Inventory not tracked</p>
        )}
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={!selected}
        className="w-full bg-ink px-6 py-3 text-sm font-semibold text-fog transition hover:bg-pitch disabled:opacity-40 sm:w-auto"
      >
        {added ? "Added to cart" : "Add to cart"}
      </button>
    </div>
  );
}
