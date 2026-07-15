import { Check, ExternalLink, Heart, Mail } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getClaim } from "@/lib/claims";
import { formatUsd, formatVnd } from "@/lib/format";
import { verifyReceipt } from "@/lib/security";
import { hasSupabaseConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Gift confirmed",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ claimId: string }>;
  searchParams: Promise<{ receipt?: string }>;
};

export default async function ConfirmationPage({
  params,
  searchParams,
}: Props) {
  const { claimId } = await params;
  const { receipt } = await searchParams;
  if (!hasSupabaseConfig() || !verifyReceipt(claimId, receipt)) notFound();
  const claim = await getClaim(claimId);
  if (!claim) notFound();

  const fixed = claim.claim_items.filter((line) => line.quantity);
  const funds = claim.claim_items.filter((line) => line.contribution_usd);
  const contactEmail = process.env.CONTACT_EMAIL || "831dberg@gmail.com";
  const paymentNote =
    process.env.PAYMENT_NOTE || "Baby shower gift for Eva Vy";
  const paymentOptions = [
    {
      name: "Venmo",
      handle: process.env.VENMO_HANDLE || "@Daniel-Berg-58",
      image: "/payment/venmo.png",
    },
    {
      name: "Cash App",
      handle: process.env.CASHAPP_HANDLE || "$danielpbergjr",
      image: "/payment/cashapp.png",
    },
    {
      name: "Zelle",
      handle: process.env.ZELLE_HANDLE || "Scan the QR code",
      image: "/payment/zelle.png",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <section className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-sage-100 text-sage-700">
          <Check className="size-8" strokeWidth={2.5} />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-peach-700">
          Your gifts are reserved
        </p>
        <h1 className="serif mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
          Thank you, {claim.guest_name}.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-stone-600">
          Your selections are safely recorded. These are the ways you can send
          money so we can purchase the gifts here in Vietnam—no payment was
          taken by this website.
        </p>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[22rem_1fr]">
        <section className="rounded-4xl border border-white bg-white/80 p-6 shadow-soft">
          <h2 className="serif text-2xl font-bold">Gift summary</h2>
          <div className="mt-5 space-y-5">
            {fixed.map((line) => (
              <div
                key={line.id}
                className="flex items-start justify-between gap-4 border-b border-peach-100 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-bold">{line.items?.title || "Registry gift"}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    Quantity {line.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold">
                  {formatUsd((line.unit_price_usd || 0) * (line.quantity || 0))}
                </p>
              </div>
            ))}
            {funds.map((line) => (
              <div
                key={line.id}
                className="flex items-start justify-between gap-4 border-b border-peach-100 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-bold">{line.items?.title || "Group fund"}</p>
                  <p className="mt-1 text-xs text-stone-500">Contribution</p>
                </div>
                <p className="text-sm font-bold">
                  {formatUsd(line.contribution_usd || 0)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl bg-ink p-5 text-white">
            <div className="flex items-end justify-between">
              <span className="text-sm text-white/70">Total</span>
              <span className="text-right">
                <strong className="serif block text-3xl">
                  {formatUsd(claim.total_usd)}
                </strong>
                <span className="text-xs text-white/60">
                  {formatVnd(claim.total_vnd)}
                </span>
              </span>
            </div>
          </div>
          <dl className="mt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Payment note</dt>
              <dd className="max-w-[13rem] text-right font-bold">{paymentNote}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-4xl border border-white bg-white/80 p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-peach-100 text-peach-700">
              <Heart className="size-5" />
            </span>
            <div>
              <h2 className="serif text-2xl font-bold">Send your gift</h2>
              <p className="text-xs text-stone-500">
                Use whichever option is easiest for you.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {paymentOptions.map((option) => (
              <div
                key={option.name}
                className="rounded-[2rem] border border-peach-100 bg-white p-4 text-center"
              >
                <div className="relative mx-auto aspect-square w-full max-w-64 overflow-hidden rounded-3xl bg-white md:max-w-72">
                  <Image
                    src={option.image}
                    alt={`${option.name} payment QR code`}
                    fill
                    sizes="(min-width: 1280px) 256px, (min-width: 640px) 224px, 80vw"
                    className="object-contain p-2"
                  />
                </div>
                <p className="mt-2 font-bold">{option.name}</p>
                <p className="mt-0.5 break-all text-xs text-stone-500">
                  {option.handle}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-peach-50 p-5 text-sm leading-6 text-stone-700">
            <strong className="block text-ink">Before you send</strong>
            Use “{paymentNote}” as the payment note, and please include your
            name so we can match the payment to your gift.
          </div>

          <div className="mt-6 border-t border-peach-100 pt-5 text-sm text-stone-600">
            <p>Need to change something?</p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-2 inline-flex items-center gap-2 font-bold text-peach-700 hover:underline"
            >
              <Mail className="size-4" />
              Email Daniel and Ngân at {contactEmail}
              <ExternalLink className="size-3" />
            </a>
          </div>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="button-secondary">
          Back to the registry
        </Link>
      </div>
    </main>
  );
}
