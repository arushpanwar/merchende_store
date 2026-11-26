"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useCart } from "@/lib/cart-store";
import { formatINR, shippingFor } from "@/lib/money";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, clear, subtotalPaise } = useCart();
  const [mounted, setMounted] = useState(false);
  const [method, setMethod] = useState<"PREPAID" | "COD">("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        name: session.user?.name ?? f.name,
        email: session.user?.email ?? f.email,
      }));
    }
  }, [session]);

  const subtotal = useMemo(
    () => (mounted ? subtotalPaise() : 0),
    [mounted, items, subtotalPaise],
  );
  const shipping = shippingFor(method);
  const total = subtotal + shipping;
  const razorpayReady = Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (method === "PREPAID" && !razorpayReady) {
        throw new Error(
          "Razorpay keys are not configured. Choose COD or add keys to .env.",
        );
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: method,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
          },
          shipping: {
            name: form.name,
            phone: form.phone,
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (method === "COD") {
        clear();
        router.push(`/checkout/success?order=${data.orderNumber}`);
        return;
      }

      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) {
        throw new Error("Could not load Razorpay checkout.");
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "Merchende",
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const confirm = await fetch("/api/checkout/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              ...response,
            }),
          });
          const confirmData = await confirm.json();
          if (!confirm.ok) {
            setError(confirmData.error || "Payment confirmation failed");
            return;
          }
          clear();
          router.push(`/checkout/success?order=${data.orderNumber}`);
        },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return <p className="text-muted">Loading…</p>;
  }

  if (items.length === 0) {
    return (
      <p className="text-muted">
        Your cart is empty.{" "}
        <a href="/shop" className="text-pitch underline">
          Shop kits
        </a>
      </p>
    );
  }

  function field(
    key: keyof typeof form,
    label: string,
    opts?: { type?: string; required?: boolean },
  ) {
    return (
      <label className="block text-sm">
        <span className="text-muted">{label}</span>
        <input
          type={opts?.type ?? "text"}
          required={opts?.required ?? true}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="mt-1 w-full border border-line bg-fog px-3 py-2 text-ink outline-none focus:border-pitch"
        />
      </label>
    );
  }

  return (
    <form onSubmit={placeOrder} className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-wide">Contact</h2>
          {session?.user ? (
            <span className="text-xs text-muted">
              Signed in as {session.user.email}
            </span>
          ) : process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true" ? (
            <button
              type="button"
              onClick={() => signIn("google")}
              className="text-xs text-pitch hover:underline"
            >
              Sign in with Google
            </button>
          ) : (
            <span className="text-xs text-muted">Guest checkout</span>
          )}
        </div>
        {field("name", "Full name")}
        {field("email", "Email", { type: "email" })}
        {field("phone", "Phone", { type: "tel" })}
        <h2 className="pt-4 font-display text-2xl tracking-wide">Shipping</h2>
        {field("line1", "Address line 1")}
        {field("line2", "Address line 2 (optional)", { required: false })}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("city", "City")}
          {field("state", "State")}
        </div>
        {field("pincode", "PIN code")}
      </div>

      <aside className="h-fit space-y-5 border border-line bg-white/60 p-6">
        <h2 className="font-display text-2xl tracking-wide">Payment</h2>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="radio"
              name="method"
              checked={method === "COD"}
              onChange={() => setMethod("COD")}
              className="mt-1"
            />
            <span>
              <span className="font-medium">Cash on delivery</span>
              <span className="block text-muted">Shipping ₹70</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="radio"
              name="method"
              checked={method === "PREPAID"}
              onChange={() => setMethod("PREPAID")}
              className="mt-1"
            />
            <span>
              <span className="font-medium">Prepaid (Razorpay)</span>
              <span className="block text-muted">
                Free shipping
                {!razorpayReady ? " · keys not set (use COD)" : ""}
              </span>
            </span>
          </label>
        </div>
        <div className="space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
          </div>
          <div className="flex justify-between text-base font-medium">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink py-3 text-sm font-semibold text-fog transition hover:bg-pitch disabled:opacity-50"
        >
          {loading
            ? "Placing order…"
            : method === "COD"
              ? "Place COD order"
              : "Pay with Razorpay"}
        </button>
      </aside>
    </form>
  );
}
