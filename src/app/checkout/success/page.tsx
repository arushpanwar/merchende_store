import Link from "next/link";

export const metadata = { title: "Order placed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <p className="text-xs uppercase tracking-wider text-pitch">Merchende</p>
      <h1 className="mt-3 font-display text-5xl tracking-wide">Order placed</h1>
      {order ? (
        <p className="mt-4 text-muted">
          Order number <span className="font-medium text-ink">{order}</span>
        </p>
      ) : null}
      <p className="mt-3 text-sm text-muted">
        We&apos;ll confirm details over email/phone when you&apos;re ready for
        production notifications.
      </p>
      <Link
        href="/shop"
        className="mt-10 inline-block bg-pitch px-6 py-3 text-sm font-semibold text-fog"
      >
        Keep shopping
      </Link>
    </div>
  );
}
