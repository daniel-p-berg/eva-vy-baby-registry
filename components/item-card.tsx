"use client";

import { Check, Minus, Plus, Sparkles } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { useCart } from "@/components/cart-provider";
import { formatUsd, formatVnd } from "@/lib/format";
import type { RegistryItem } from "@/lib/types";

function statusFor(item: RegistryItem) {
  if (item.item_type === "fixed") {
    if (item.remaining_quantity <= 0) return "Claimed";
    if (item.remaining_quantity === 1) return "1 left";
    return "Available";
  }
  if (item.remaining_usd <= 0) return "Fully funded";
  if (item.funded_usd > 0) return "Partially funded";
  return "Available";
}

export function ItemCard({ item }: { item: RegistryItem }) {
  const {
    cart,
    addFixed,
    setFixedQuantity,
    setFund,
    removeFund,
  } = useCart();
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");

  const fixedLine = cart.fixed.find((line) => line.itemId === item.id);
  const fundLine = cart.funds.find((line) => line.itemId === item.id);
  const status = statusFor(item);
  const unavailable =
    item.item_type === "fixed"
      ? item.remaining_quantity <= 0
      : item.remaining_usd <= 0;
  const ratio =
    item.item_type === "fund" &&
    item.fund_target_usd &&
    item.fund_target_vnd
      ? item.fund_target_vnd / item.fund_target_usd
      : Number(process.env.NEXT_PUBLIC_USD_TO_VND_RATE || 26000);
  const progress =
    item.item_type === "fund" && item.fund_target_usd
      ? Math.min(100, (item.funded_usd / item.fund_target_usd) * 100)
      : 0;

  const statusClass = useMemo(() => {
    if (status === "Claimed" || status === "Fully funded") {
      return "border-sage-300 bg-sage-50 text-sage-700";
    }
    if (status === "1 left") {
      return "border-peach-300 bg-peach-50 text-peach-700";
    }
    return "border-white/80 bg-white/80 text-stone-600";
  }, [status]);

  function chooseContribution(amount: number) {
    const safeAmount = Math.min(amount, item.remaining_usd);
    if (safeAmount <= 0) return;
    setFund({
      itemId: item.id,
      title: item.title,
      imagePath: item.image_path,
      contributionUsd: safeAmount,
      contributionVnd: Math.round(safeAmount * ratio),
      maxUsd: item.remaining_usd,
    });
    setMessage(`${formatUsd(safeAmount)} added`);
  }

  function addCustomContribution() {
    const amount = Number(customAmount);
    if (!Number.isFinite(amount) || amount < 1) {
      setMessage("Enter at least $1.");
      return;
    }
    chooseContribution(amount);
    setCustomAmount("");
  }

  return (
    <article className="group overflow-hidden rounded-4xl border border-white/90 bg-white/80 shadow-soft backdrop-blur-sm transition duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-peach-50">
        <Image
          src={item.image_path}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition duration-500 group-hover:scale-[1.025] ${
            unavailable ? "opacity-65 grayscale-[15%]" : ""
          }`}
        />
        <span
          className={`absolute left-4 top-4 inline-flex rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur ${statusClass}`}
        >
          {status}
        </span>
      </div>

      <div className="flex min-h-[22rem] flex-col p-5 sm:p-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-peach-700">
          {item.category}
        </p>
        <h2 className="serif text-2xl font-bold tracking-tight text-ink">
          {item.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {item.description}
        </p>

        {item.item_type === "fixed" ? (
          <>
            <div className="mt-5 rounded-3xl bg-peach-50 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="serif text-2xl font-bold text-ink">
                    {formatUsd(item.price_usd || 0)}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-stone-500">
                    {formatVnd(item.price_vnd || 0)}
                  </p>
                </div>
                <p className="text-right text-xs font-bold text-stone-600">
                  {item.remaining_quantity} of {item.quantity_needed} remaining
                </p>
              </div>
            </div>

            <div className="mt-auto pt-5">
              {fixedLine ? (
                <div className="flex items-center justify-between rounded-full border border-peach-200 bg-white p-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setFixedQuantity(item.id, fixedLine.quantity - 1)
                    }
                    className="grid size-10 place-items-center rounded-full text-ink transition hover:bg-peach-100"
                    aria-label={`Remove one ${item.title}`}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="text-sm font-bold">
                    {fixedLine.quantity} in gift bag
                  </span>
                  <button
                    type="button"
                    disabled={fixedLine.quantity >= item.remaining_quantity}
                    onClick={() =>
                      addFixed({
                        itemId: item.id,
                        title: item.title,
                        imagePath: item.image_path,
                        maxQuantity: item.remaining_quantity,
                        unitUsd: item.price_usd || 0,
                        unitVnd: item.price_vnd || 0,
                      })
                    }
                    className="grid size-10 place-items-center rounded-full text-ink transition hover:bg-peach-100 disabled:opacity-30"
                    aria-label={`Add one ${item.title}`}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={unavailable}
                  onClick={() =>
                    addFixed({
                      itemId: item.id,
                      title: item.title,
                      imagePath: item.image_path,
                      maxQuantity: item.remaining_quantity,
                      unitUsd: item.price_usd || 0,
                      unitVnd: item.price_vnd || 0,
                    })
                  }
                  className="button-primary w-full"
                >
                  {unavailable ? (
                    <>
                      <Check className="size-4" /> Already claimed
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" /> Add to gift bag
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mt-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-stone-500">Goal</p>
                  <p className="serif text-xl font-bold text-ink">
                    {formatUsd(item.fund_target_usd || 0)}
                  </p>
                  <p className="text-xs font-semibold text-stone-500">
                    {formatVnd(item.fund_target_vnd || 0)}
                  </p>
                </div>
                <p className="text-right text-xs leading-5 text-stone-600">
                  <strong>{formatUsd(item.funded_usd)}</strong> funded
                  <br />
                  {formatUsd(item.remaining_usd)} remaining
                </p>
              </div>
              <div
                className="mt-3 h-2.5 overflow-hidden rounded-full bg-peach-100"
                role="progressbar"
                aria-label={`${item.title} funding progress`}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-sage-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-auto pt-5">
              {fundLine ? (
                <div className="mb-3 flex items-center justify-between rounded-2xl bg-sage-50 px-4 py-3 text-sm text-sage-700">
                  <span className="flex items-center gap-2 font-bold">
                    <Check className="size-4" />
                    {formatUsd(fundLine.contributionUsd)} in gift bag
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFund(item.id)}
                    className="text-xs font-bold underline underline-offset-4"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 100, 200].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    disabled={unavailable}
                    onClick={() => chooseContribution(amount)}
                    className="rounded-xl border border-peach-200 bg-white py-2.5 text-xs font-bold transition hover:border-peach-300 hover:bg-peach-50 disabled:opacity-40"
                  >
                    ${Math.min(amount, item.remaining_usd)}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={item.remaining_usd}
                    step="1"
                    inputMode="decimal"
                    value={customAmount}
                    disabled={unavailable}
                    onChange={(event) => setCustomAmount(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addCustomContribution();
                    }}
                    placeholder="Custom amount"
                    className="field pl-7"
                    aria-label={`Custom contribution for ${item.title}`}
                  />
                </div>
                <button
                  type="button"
                  disabled={unavailable}
                  onClick={addCustomContribution}
                  className="button-secondary !min-h-0 px-4"
                >
                  Add
                </button>
              </div>
              <p
                aria-live="polite"
                className="mt-2 min-h-4 text-xs font-semibold text-stone-500"
              >
                {unavailable ? (
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="size-3" /> This fund is complete.
                  </span>
                ) : (
                  message
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
