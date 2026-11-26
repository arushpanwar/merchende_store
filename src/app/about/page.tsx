export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl tracking-wide">About Merchende</h1>
      <div className="mt-8 space-y-4 text-muted leading-relaxed">
        <p>
          Merchende is a focused football jersey store for club kits — home,
          away, third, and special editions. No player name or number
          customization in this version.
        </p>
        <p>
          Built for fans who want the club look without the clutter. We ship
          across India with prepaid (free shipping) or cash on delivery (₹70).
        </p>
        <p>Owned and operated by Arush Panwar.</p>
      </div>
    </div>
  );
}
