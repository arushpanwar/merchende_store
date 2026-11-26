"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useCart } from "@/lib/cart-store";
import { useEffect, useState } from "react";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/size-guide", label: "Size guide" },
  { href: "/about", label: "About" },
  { href: "/returns", label: "Returns" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isAdmin = session?.user?.role === "admin";

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-fog/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-2xl tracking-[0.08em] text-ink uppercase"
        >
          Merchende
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${
                pathname === l.href
                  ? "text-pitch"
                  : "text-muted hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {isAdmin ? (
            <Link href="/admin" className="text-muted hover:text-ink">
              Admin
            </Link>
          ) : null}
          {session?.user && !isAdmin ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="hidden text-muted hover:text-ink sm:inline"
            >
              Sign out
            </button>
          ) : !session && process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true" ? (
            <button
              type="button"
              onClick={() => signIn("google")}
              className="hidden text-muted hover:text-ink sm:inline"
            >
              Sign in
            </button>
          ) : null}
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-sm bg-ink px-3 py-2 text-fog transition hover:bg-pitch"
          >
            Cart
            <span className="min-w-5 text-center font-medium text-lime">
              {mounted ? count : 0}
            </span>
          </Link>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-line/60 px-4 py-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap text-xs ${
              pathname === l.href ? "text-pitch" : "text-muted"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
