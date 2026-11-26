"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export function OrderStatusForm({
  orderId,
  orderStatus,
  paymentStatus,
}: {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(orderStatus);
  const [payment, setPayment] = useState(paymentStatus);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus: status, paymentStatus: payment }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setMsg(data.error || "Update failed");
      return;
    }
    setMsg("Saved");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="flex flex-wrap items-end gap-3">
      <label className="text-sm">
        <span className="text-muted">Order status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block border border-line bg-fog px-3 py-2"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="text-muted">Payment status</span>
        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          className="mt-1 block border border-line bg-fog px-3 py-2"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="bg-pitch px-4 py-2 text-sm font-semibold text-fog disabled:opacity-50"
      >
        {loading ? "Saving…" : "Update"}
      </button>
      {msg ? <span className="text-sm text-muted">{msg}</span> : null}
    </form>
  );
}
