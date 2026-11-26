export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl tracking-wide">Contact</h1>
      <p className="mt-3 text-muted">
        Questions about sizes, stock, or an order? Reach out.
      </p>
      <div className="mt-10 space-y-4 text-sm">
        <p>
          <span className="text-muted">Email</span>
          <br />
          <a
            href="mailto:hello@merchende.com"
            className="text-lg text-pitch hover:underline"
          >
            hello@merchende.com
          </a>
        </p>
        <p className="text-muted leading-relaxed">
          Include your order number if you have one. We typically reply within
          one business day. Production email routing will be wired when the
          domain goes live.
        </p>
      </div>
    </div>
  );
}
