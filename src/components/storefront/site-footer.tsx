"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-line bg-ink text-fog">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-xl tracking-[0.08em] uppercase">
            Merchende
          </p>
          <p className="mt-3 max-w-xs text-sm text-mist/80">
            Club football kits only. Home, away, third, and special editions —
            no name or number customization.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium text-lime">Shop</p>
          <ul className="space-y-2 text-mist/80">
            <li>
              <Link href="/shop" className="hover:text-fog">
                All kits
              </Link>
            </li>
            <li>
              <Link href="/size-guide" className="hover:text-fog">
                Size guide
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-fog">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium text-lime">Help</p>
          <ul className="space-y-2 text-mist/80">
            <li>
              <Link href="/returns" className="hover:text-fog">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-fog">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-fog">
                About
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-mist/60">
        © {new Date().getFullYear()} Merchende · Prepaid shipping free · COD ₹70
      </div>
    </footer>
  );
}
