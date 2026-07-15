"use client";

import {
  ArrowLeft,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { useCart } from "@/components/cart-provider";
import { formatUsd, formatVnd } from "@/lib/format";

export function CheckoutClient() {
  const {
    cart,
    ready,
    setFixedQuantity,
    setFund,
    removeFund,
    clearCart,
  } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(
    () => ({
      usd:
        cart.fixed.reduce(
          (sum, line) => sum + line.unitUsd * line.quantity,
          0,
        ) +
        cart.funds.reduce((sum, line) => sum + line.contributionUsd, 0),
      vnd:
        cart.fixed.reduce(
          (sum, line) => sum + line.unitVnd * line.quantity,
          0,
        ) + cart.funds.reduce((sum, line) => sum + line.contributionVnd, 0),
    }),
    [cart],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: formData.get("guestName"),
          guestEmail: formData.get("guestEmail"),
          guestNote: formData.get("guestNote"),
          fixed: cart.fixed.map((line) => ({
            itemId: line.itemId,
            quantity: line.quantity,
          })),
          funds: cart.funds.map((line) => ({
            itemId: line.itemId,
            contributionUsd: line.contributionUsd,
          })),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        claimId?: string;
        receipt?: string;
      };
      if (!response.ok || !result.claimId || !result.receipt) {
        throw new Error(result.error || "We couldn’t reserve your gifts.");
      }
      clearCart();
      router.push(
        `/confirmation/${encodeURIComponent(result.claimId)}?receipt=${encodeURIComponent(result.receipt)}`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We couldn’t reserve your gifts.",
      );
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <LoaderCircle className="size-8 animate-spin text-peach-700" />
      </div>
    );
  }

  if (!cart.fixed.length && !cart.funds.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-peach-100 text-peach-700">
          <ShoppingBag className="size-7" />
        </span>
        <h1 className="serif mt-6 text-4xl font-bold">Your gift bag is empty</h1>
        <p className="mt-3 text-stone-600">
          Choose a gift or add to a group fund, then come back here to reserve
          everything together.
        </p>
        <Link href="/#registry" className="button-primary mt-7">
          Browse the registry
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <Link
        href="/#registry"
        className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Keep browsing
      </Link>
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-peach-700">
          Review & reserve
        </p>
        <h1 className="serif mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Your gift bag
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
          No payment happens here. We&apos;ll reserve your selections and show
          the available ways to send money on the next screen.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_24rem]"
      >
        <div className="space-y-8">
          <section className="rounded-4xl border border-white bg-white/80 p-5 shadow-soft sm:p-7">
            <h2 className="serif text-2xl font-bold">Your selections</h2>
            <div className="mt-5 divide-y divide-peach-100">
              {cart.fixed.map((line) => (
                <div
                  key={line.itemId}
                  className="flex gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-peach-50">
                    <Image
                      src={line.imagePath}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-ink">{line.title}</h3>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatUsd(line.unitUsd)} · {formatVnd(line.unitVnd)} each
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold">
                        {formatUsd(line.unitUsd * line.quantity)}
                      </p>
                    </div>
                    <div className="mt-3 inline-flex items-center rounded-full border border-peach-200 p-1">
                      <button
                        type="button"
                        onClick={() =>
                          setFixedQuantity(line.itemId, line.quantity - 1)
                        }
                        className="grid size-8 place-items-center rounded-full hover:bg-peach-50"
                        aria-label={`Remove one ${line.title}`}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-20 text-center text-xs font-bold">
                        Qty {line.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={line.quantity >= line.maxQuantity}
                        onClick={() =>
                          setFixedQuantity(line.itemId, line.quantity + 1)
                        }
                        className="grid size-8 place-items-center rounded-full hover:bg-peach-50 disabled:opacity-30"
                        aria-label={`Add one ${line.title}`}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cart.funds.map((line) => {
                const rate =
                  line.contributionUsd > 0
                    ? line.contributionVnd / line.contributionUsd
                    : Number(
                        process.env.NEXT_PUBLIC_USD_TO_VND_RATE || 26000,
                      );
                return (
                  <div
                    key={line.itemId}
                    className="flex gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-peach-50">
                      <Image
                        src={line.imagePath}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-ink">{line.title}</h3>
                          <p className="mt-1 text-xs text-stone-500">
                            Group fund contribution
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFund(line.itemId)}
                          className="grid size-8 shrink-0 place-items-center rounded-full text-stone-500 hover:bg-peach-50 hover:text-peach-700"
                          aria-label={`Remove ${line.title}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[25, 50, 100, 200].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() =>
                              setFund({
                                ...line,
                                contributionUsd: Math.min(amount, line.maxUsd),
                                contributionVnd: Math.round(
                                  Math.min(amount, line.maxUsd) * rate,
                                ),
                              })
                            }
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                              line.contributionUsd ===
                              Math.min(amount, line.maxUsd)
                                ? "border-sage-300 bg-sage-50 text-sage-700"
                                : "border-peach-200 bg-white hover:bg-peach-50"
                            }`}
                          >
                            ${Math.min(amount, line.maxUsd)}
                          </button>
                        ))}
                      </div>
                      <label className="mt-3 block max-w-48">
                        <span className="sr-only">
                          Custom contribution for {line.title}
                        </span>
                        <span className="relative block">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500">
                            $
                          </span>
                          <input
                            type="number"
                            min="1"
                            max={line.maxUsd}
                            step="1"
                            value={line.contributionUsd}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              if (Number.isFinite(value)) {
                                setFund({
                                  ...line,
                                  contributionUsd: Math.min(
                                    Math.max(0, value),
                                    line.maxUsd,
                                  ),
                                  contributionVnd: Math.round(value * rate),
                                });
                              }
                            }}
                            className="field py-2 pl-7"
                          />
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-4xl border border-white bg-white/80 p-5 shadow-soft sm:p-7">
            <h2 className="serif text-2xl font-bold">About you</h2>
            <p className="mt-1 text-sm text-stone-500">
              We use this only to match your gift and contact you if needed.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label>
                <span className="label">
                  Your name <span className="text-peach-700">*</span>
                </span>
                <input
                  name="guestName"
                  required
                  maxLength={120}
                  autoComplete="name"
                  className="field"
                  placeholder="Full name"
                />
              </label>
              <label>
                <span className="label">Email (optional)</span>
                <input
                  name="guestEmail"
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  className="field"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <label className="mt-6 block">
              <span className="label">Note for Daniel & Ngân (optional)</span>
              <textarea
                name="guestNote"
                rows={4}
                maxLength={2000}
                className="field resize-y"
                placeholder="A message for the family…"
              />
            </label>
          </section>
        </div>

        <aside className="sticky top-24 rounded-4xl bg-ink p-6 text-white shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-peach-200">
            Gift total
          </p>
          <div className="mt-4 flex items-end justify-between border-b border-white/15 pb-5">
            <span className="text-sm text-white/70">Total</span>
            <span className="text-right">
              <strong className="serif block text-3xl">{formatUsd(totals.usd)}</strong>
              <span className="text-xs text-white/60">
                {formatVnd(totals.vnd)}
              </span>
            </span>
          </div>
          <p className="mt-5 text-xs leading-5 text-white/65">
            Clicking below reserves your selections. It does not charge you.
            Payment QR codes and handles appear after confirmation.
          </p>
          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-2xl bg-peach-700/40 p-3 text-sm leading-5 text-white"
            >
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={submitting || totals.usd <= 0}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-peach-200 px-5 py-3 text-sm font-bold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Reserving…
              </>
            ) : (
              "Reserve these gifts"
            )}
          </button>
        </aside>
      </form>
    </main>
  );
}
