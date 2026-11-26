"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/money";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, setQuantity, removeItem, subtotalPaise } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-muted">Loading cart…</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-5xl tracking-wide">Cart</h1>
        <p className="mt-4 text-muted">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-8 inline-block bg-pitch px-6 py-3 text-sm font-semibold text-fog"
        >
          Browse kits
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl tracking-wide">Cart</h1>
      <ul className="mt-10 divide-y divide-line">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 py-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-24 w-20 object-cover bg-mist"
            />
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex justify-between gap-4">
                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-medium text-ink hover:text-pitch"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted">
                    Size {item.size} · {item.club}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatINR(item.priceInPaise * item.quantity)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted">Qty</label>
                <input
                  type="number"
                  min={1}
                  max={item.maxStock ?? undefined}
                  value={item.quantity}
                  onChange={(e) =>
                    setQuantity(item.variantId, Number(e.target.value) || 1)
                  }
                  className="w-16 border border-line bg-fog px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.variantId)}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
        <p className="text-muted">Subtotal</p>
        <p className="text-xl font-medium">{formatINR(subtotalPaise())}</p>
      </div>
      <p className="mt-2 text-xs text-muted">
        Shipping calculated at checkout — free for prepaid, ₹70 for COD.
      </p>
      <Link
        href="/checkout"
        className="mt-6 inline-block w-full bg-ink py-3 text-center text-sm font-semibold text-fog transition hover:bg-pitch sm:w-auto sm:px-10"
      >
        Checkout
      </Link>
    </div>
  );
}
