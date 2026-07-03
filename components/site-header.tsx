"use client";

import { Baby, Gift, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/components/cart-provider";

export function SiteHeader() {
  const { itemCount, ready } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-peach-100/80 bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-ink"
          aria-label="Eva Vy registry home"
        >
          <span className="grid size-9 place-items-center rounded-full bg-peach-100 text-peach-700">
            <Baby className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="serif block text-lg font-bold leading-none">
              Eva Vy
            </span>
            <span className="mt-0.5 hidden text-[10px] font-bold uppercase tracking-[0.17em] text-stone-500 sm:block">
              Baby shower registry
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/#registry"
            className="hidden min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-stone-600 transition hover:bg-white hover:text-ink sm:inline-flex"
          >
            <Gift className="size-4" aria-hidden="true" />
            Gifts
          </Link>
          <Link
            href="/checkout"
            className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-white transition hover:bg-peach-700"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            <span>Gift bag</span>
            {ready && itemCount > 0 ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-peach-200 px-1.5 py-0.5 text-[11px] text-peach-700">
                {itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
