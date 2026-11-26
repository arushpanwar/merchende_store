export const metadata = { title: "Size guide" };

const rows = [
  { size: "XS", chest: "34–36", length: "26" },
  { size: "S", chest: "36–38", length: "27" },
  { size: "M", chest: "38–40", length: "28" },
  { size: "L", chest: "40–42", length: "29" },
  { size: "XL", chest: "42–44", length: "30" },
  { size: "XXL", chest: "44–46", length: "31" },
];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl tracking-wide">Size guide</h1>
      <p className="mt-3 text-muted">
        Approximate measurements in inches. Kits can vary slightly by club cut —
        when in doubt, size up.
      </p>
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="py-3 font-medium">Size</th>
              <th className="py-3 font-medium">Chest</th>
              <th className="py-3 font-medium">Length</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.size} className="border-b border-line/70">
                <td className="py-3 font-medium text-ink">{r.size}</td>
                <td className="py-3 text-muted">{r.chest}&quot;</td>
                <td className="py-3 text-muted">{r.length}&quot;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
