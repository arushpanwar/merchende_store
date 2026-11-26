import Link from "next/link";
import { formatINR } from "@/lib/money";
import { kitLabel } from "@/lib/kit";
import type { KitType } from "@prisma/client";

type Props = {
  slug: string;
  name: string;
  club: string;
  kitType: KitType;
  priceInPaise: number;
  imageUrl: string;
};

export function ProductCard({
  slug,
  name,
  club,
  kitType,
  priceInPaise,
  imageUrl,
}: Props) {
  return (
    <Link
      href={`/product/${slug}`}
      className="group block transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[4/5] overflow-hidden bg-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted">
          {club} · {kitLabel(kitType)}
        </p>
        <h3 className="font-medium text-ink group-hover:text-pitch">{name}</h3>
        <p className="text-sm text-ink">{formatINR(priceInPaise)}</p>
      </div>
    </Link>
  );
}
