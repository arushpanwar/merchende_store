"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { KitType, Size } from "@prisma/client";
import { ALL_SIZES } from "@/lib/kit";

type VariantInput = { size: Size; stock: number; sku?: string };

type Props = {
  mode: "create" | "edit";
  productId?: string;
  initial?: {
    name: string;
    slug: string;
    club: string;
    kitType: KitType;
    description: string;
    priceInRupees: string;
    imageUrl: string;
    trackInventory: boolean;
    active: boolean;
    variants: VariantInput[];
  };
};

const emptyVariants: VariantInput[] = ALL_SIZES.map((size) => ({
  size,
  stock: 0,
}));

const PLACEHOLDER_IMAGE = "/products/placeholder.svg";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({ mode, productId, initial }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewBroken, setPreviewBroken] = useState(false);
  const [form, setForm] = useState(
    initial ?? {
      name: "",
      slug: "",
      club: "",
      kitType: "HOME" as KitType,
      description: "",
      priceInRupees: "",
      imageUrl: PLACEHOLDER_IMAGE,
      trackInventory: true,
      active: true,
      variants: emptyVariants,
    },
  );

  function setImageUrl(url: string) {
    setPreviewBroken(false);
    setForm((f) => ({ ...f, imageUrl: url }));
  }

  function updateVariant(size: Size, stock: number) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) =>
        v.size === size ? { ...v, stock } : v,
      ),
    }));
  }

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      setImageUrl(data.url as string);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      name: form.name,
      slug: form.slug,
      club: form.club,
      kitType: form.kitType,
      description: form.description,
      priceInPaise: Math.round(Number(form.priceInRupees) * 100),
      imageUrl: form.imageUrl.trim() || PLACEHOLDER_IMAGE,
      trackInventory: form.trackInventory,
      active: form.active,
      variants: form.variants,
    };

    const res = await fetch(
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${productId}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function onDelete() {
    if (!productId || !confirm("Delete this product?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Delete failed");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  const previewSrc = form.imageUrl.trim();
  const showPreview = Boolean(previewSrc) && !previewBroken;

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      {(
        [
          ["name", "Name"],
          ["slug", "Slug"],
          ["club", "Club"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block text-sm">
          <span className="text-muted">{label}</span>
          <input
            value={form[key]}
            onChange={(e) => {
              const value = e.target.value;
              setForm((f) => {
                const next = { ...f, [key]: value };
                if (
                  key === "name" &&
                  mode === "create" &&
                  (!f.slug || f.slug === slugify(f.name))
                ) {
                  next.slug = slugify(value);
                }
                return next;
              });
            }}
            className="mt-1 w-full border border-line bg-fog px-3 py-2"
            required
          />
        </label>
      ))}

      <fieldset className="space-y-3 border border-line p-4">
        <legend className="px-1 text-sm font-medium text-ink">
          Product image
        </legend>
        <p className="text-xs text-muted">
          Paste an image URL or upload from your device. Either works; uploading
          replaces the URL and vice versa.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="h-36 w-28 shrink-0 overflow-hidden border border-line bg-mist">
            {showPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt="Product preview"
                className="h-full w-full object-cover"
                onError={() => setPreviewBroken(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">
                No preview
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <label className="block text-sm">
              <span className="text-muted">Image URL</span>
              <input
                type="text"
                inputMode="url"
                value={form.imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://… or /products/…"
                className="mt-1 w-full border border-line bg-fog px-3 py-2"
              />
            </label>
            <div>
              <span className="text-sm text-muted">Upload</span>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full max-w-sm text-sm text-muted file:mr-3 file:border file:border-line file:bg-fog file:px-3 file:py-1.5 file:text-sm file:text-ink"
                  disabled={uploading || loading}
                  onChange={(e) => onUpload(e.target.files?.[0])}
                />
                {uploading ? (
                  <span className="text-xs text-muted">Uploading…</span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted">
                JPEG, PNG, or WebP · max 4.5 MB · camera or gallery on mobile
              </p>
            </div>
            {form.imageUrl && form.imageUrl !== PLACEHOLDER_IMAGE ? (
              <button
                type="button"
                onClick={() => setImageUrl(PLACEHOLDER_IMAGE)}
                className="text-xs text-muted underline hover:text-ink"
              >
                Reset to placeholder
              </button>
            ) : null}
          </div>
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="text-muted">Kit type</span>
        <select
          value={form.kitType}
          onChange={(e) =>
            setForm({ ...form, kitType: e.target.value as KitType })
          }
          className="mt-1 w-full border border-line bg-fog px-3 py-2"
        >
          {(["HOME", "AWAY", "THIRD", "SPECIAL"] as KitType[]).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-muted">Price (INR)</span>
        <input
          type="number"
          min={1}
          step={1}
          value={form.priceInRupees}
          onChange={(e) => setForm({ ...form, priceInRupees: e.target.value })}
          className="mt-1 w-full border border-line bg-fog px-3 py-2"
          required
        />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Description</span>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1 w-full border border-line bg-fog px-3 py-2"
          rows={4}
          required
        />
      </label>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.trackInventory}
            onChange={(e) =>
              setForm({ ...form, trackInventory: e.target.checked })
            }
          />
          Track inventory
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Active
        </label>
      </div>
      {form.trackInventory ? (
        <div>
          <p className="mb-2 text-sm text-muted">Stock by size</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {form.variants.map((v) => (
              <label key={v.size} className="text-xs">
                {v.size}
                <input
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) =>
                    updateVariant(v.size, Number(e.target.value) || 0)
                  }
                  className="mt-1 w-full border border-line bg-fog px-2 py-1"
                />
              </label>
            ))}
          </div>
        </div>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || uploading}
          className="bg-pitch px-5 py-2 text-sm font-semibold text-fog disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save product"}
        </button>
        {mode === "edit" ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={loading || uploading}
            className="border border-danger px-5 py-2 text-sm text-danger"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
