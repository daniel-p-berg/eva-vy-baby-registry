import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Gift,
  KeyRound,
  LogOut,
  PackageCheck,
  PackageOpen,
  Plus,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { ClaimForm } from "@/components/admin/claim-form";
import { DeleteClaimForm } from "@/components/admin/delete-claim-form";
import { ItemForm } from "@/components/admin/item-form";
import { getAdminData } from "@/lib/admin-data";
import { formatUsd, formatVnd } from "@/lib/format";
import {
  ADMIN_COOKIE,
  isValidAdminSecret,
  isValidAdminSession,
} from "@/lib/security";
import { hasSupabaseConfig } from "@/lib/supabase";
import type { ClaimStatus } from "@/lib/types";
import {
  deleteClaim,
  loginAdmin,
  logoutAdmin,
  saveClaim,
  saveItem,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Registry admin",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ secret: string }>;
  searchParams: Promise<{ login?: string; saved?: string; error?: string }>;
};

const statusStyles: Record<ClaimStatus, string> = {
  claimed: "bg-peach-100 text-peach-700",
  paid: "bg-sage-100 text-sage-700",
  purchased: "bg-ink text-white",
  cancelled: "bg-stone-200 text-stone-600",
};

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminPage({ params, searchParams }: Props) {
  const { secret } = await params;
  const query = await searchParams;
  if (!isValidAdminSecret(secret)) notFound();

  const cookieStore = await cookies();
  const authenticated = isValidAdminSession(
    secret,
    cookieStore.get(ADMIN_COOKIE)?.value,
  );

  if (!authenticated) {
    return (
      <main className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-md place-items-center px-4 py-16">
        <section className="w-full rounded-4xl border border-white bg-white/85 p-7 shadow-soft sm:p-9">
          <span className="grid size-12 place-items-center rounded-full bg-peach-100 text-peach-700">
            <KeyRound className="size-5" />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-peach-700">
            Private dashboard
          </p>
          <h1 className="serif mt-2 text-3xl font-bold">Admin access</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Enter the registry admin password to continue.
          </p>
          {query.login === "invalid" ? (
            <p
              role="alert"
              className="mt-4 rounded-2xl bg-peach-50 p-3 text-sm font-semibold text-peach-700"
            >
              That password was not correct.
            </p>
          ) : null}
          <form action={loginAdmin} className="mt-6">
            <input type="hidden" name="secret" value={secret} />
            <label>
              <span className="label">Password</span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="field"
                autoFocus
              />
            </label>
            <button type="submit" className="button-primary mt-4 w-full">
              Open dashboard
              <ArrowRight className="size-4" />
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (!hasSupabaseConfig()) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="serif text-4xl font-bold">Connect Supabase first</h1>
        <p className="mt-3 text-stone-600">
          Add the Supabase URL and service role key to the server environment,
          then apply the migration and seed files.
        </p>
      </main>
    );
  }

  const { summary, claims, items, events } = await getAdminData();
  const summaryCards = [
    {
      label: "Total claimed",
      usd: summary.claimedUsd,
      vnd: summary.claimedVnd,
      icon: Gift,
    },
    {
      label: "Total paid",
      usd: summary.paidUsd,
      vnd: summary.paidVnd,
      icon: CircleDollarSign,
    },
    {
      label: "Total purchased",
      usd: summary.purchasedUsd,
      vnd: summary.purchasedVnd,
      icon: PackageCheck,
    },
    {
      label: "Unpaid claimed",
      usd: summary.unpaidUsd,
      vnd: summary.unpaidVnd,
      icon: Clock3,
    },
    {
      label: "Unclaimed remaining",
      usd: summary.unclaimedUsd,
      vnd: summary.unclaimedVnd,
      icon: PackageOpen,
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-peach-700">
            <ShieldCheck className="size-4" />
            Private admin
          </p>
          <h1 className="serif mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Registry dashboard
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Claims, payments, purchases, and registry availability.
          </p>
        </div>
        <form action={logoutAdmin}>
          <input type="hidden" name="secret" value={secret} />
          <button type="submit" className="button-secondary">
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>

      {query.saved ? (
        <div className="mt-6 flex items-center gap-2 rounded-2xl bg-sage-100 px-4 py-3 text-sm font-bold text-sage-700">
          <CheckCircle2 className="size-4" />
          {query.saved === "claim"
            ? "Claim saved."
            : query.saved === "deleted"
              ? "Claim deleted permanently."
              : "Item saved."}
        </div>
      ) : null}
      {query.error ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl bg-peach-100 px-4 py-3 text-sm font-bold text-peach-700"
        >
          {query.error}
        </div>
      ) : null}

      <section className="mt-9">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map(({ label, usd, vnd, icon: Icon }) => (
            <div
              key={label}
              className="rounded-3xl border border-white bg-white/80 p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
                  {label}
                </p>
                <Icon className="size-4 text-peach-700" />
              </div>
              <p className="serif mt-4 text-2xl font-bold">{formatUsd(usd)}</p>
              <p className="mt-1 text-xs font-semibold text-stone-500">
                {formatVnd(vnd)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 grid items-start gap-8 xl:grid-cols-[1.6fr_0.8fr]">
        <section id="claims" className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-peach-100 text-peach-700">
              <Users className="size-5" />
            </span>
            <div>
              <h2 className="serif text-3xl font-bold">Claims</h2>
              <p className="text-xs text-stone-500">
                {claims.length} total claim{claims.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {claims.length ? (
              claims.map((claim) => (
                <details
                  key={claim.id}
                  className="group rounded-3xl border border-white bg-white/80 shadow-soft"
                >
                  <summary className="cursor-pointer list-none p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold">{claim.guest_name}</h3>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${statusStyles[claim.status]}`}
                          >
                            {claim.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-stone-500">
                          {dateTime(claim.created_at)} ·{" "}
                          {claim.claim_items.length} line
                          {claim.claim_items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="serif text-xl font-bold">
                          {formatUsd(claim.total_usd)}
                        </p>
                        <p className="text-xs text-stone-500">
                          {formatVnd(claim.total_vnd)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-bold text-peach-700 group-open:hidden">
                      Open to view and edit
                    </p>
                  </summary>
                  <div className="border-t border-peach-100 p-5 sm:p-6">
                    <ClaimForm
                      secret={secret}
                      claim={claim}
                      action={saveClaim}
                    />
                    <div className="mt-5 border-t border-peach-100 pt-5">
                      <p className="mb-3 text-xs leading-5 text-stone-500">
                        Keep Cancel for real guest changes. Permanently delete
                        only test, duplicate, or accidental claims.
                      </p>
                      <DeleteClaimForm
                        secret={secret}
                        claimId={claim.id}
                        action={deleteClaim}
                      />
                    </div>
                  </div>
                </details>
              ))
            ) : (
              <div className="rounded-3xl border border-white bg-white/80 p-8 text-center text-sm text-stone-500">
                No claims yet.
              </div>
            )}
          </div>
        </section>

        <aside className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-sage-100 text-sage-700">
              <Activity className="size-5" />
            </span>
            <div>
              <h2 className="serif text-3xl font-bold">Recent activity</h2>
              <p className="text-xs text-stone-500">Newest first</p>
            </div>
          </div>
          <div className="mt-5 rounded-3xl border border-white bg-white/80 p-5 shadow-soft">
            {events.length ? (
              <ol className="space-y-5">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="relative border-l-2 border-peach-100 pl-4"
                  >
                    <span className="absolute -left-[5px] top-1 size-2 rounded-full bg-peach-500" />
                    <p className="break-words text-sm font-semibold leading-6">
                      {event.message}
                    </p>
                    <p className="mt-1 text-[11px] text-stone-500">
                      {dateTime(event.created_at)}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-stone-500">No activity yet.</p>
            )}
          </div>
        </aside>
      </div>

      <section id="items" className="mt-14">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-peach-100 text-peach-700">
            <Gift className="size-5" />
          </span>
          <div>
            <h2 className="serif text-3xl font-bold">Registry items</h2>
            <p className="text-xs text-stone-500">
              Create, edit, activate, deactivate, and reorder.
            </p>
          </div>
        </div>

        <details className="group mt-5 rounded-3xl border border-dashed border-peach-300 bg-peach-50/60">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-5 text-sm font-bold text-peach-700">
            <Plus className="size-4" />
            Create a registry item
          </summary>
          <div className="border-t border-peach-200 p-5">
            <ItemForm secret={secret} action={saveItem} />
          </div>
        </details>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {items.map((item) => (
            <details
              key={item.id}
              className="group rounded-3xl border border-white bg-white/80 shadow-soft"
            >
              <summary className="cursor-pointer list-none p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{item.title}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                          item.is_active
                            ? "bg-sage-100 text-sage-700"
                            : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-stone-500">
                      #{item.sort_order} · {item.item_type} · {item.category}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-xs text-stone-500">
                    {item.item_type === "fixed"
                      ? `${item.remaining_quantity}/${item.quantity_needed} left`
                      : `${formatUsd(item.funded_usd)} funded`}
                  </p>
                </div>
                <p className="mt-3 text-xs font-bold text-peach-700 group-open:hidden">
                  Open to edit
                </p>
              </summary>
              <div className="border-t border-peach-100 p-5">
                <ItemForm secret={secret} item={item} action={saveItem} />
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-4xl border border-white bg-white/80 p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-sage-100 text-sage-700">
            <Settings className="size-5" />
          </span>
          <div>
            <h2 className="serif text-2xl font-bold">Payment display</h2>
            <p className="text-xs text-stone-500">
              Handles are managed as secure deployment environment variables.
            </p>
          </div>
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Venmo", process.env.VENMO_HANDLE],
            ["PayPal", process.env.PAYPAL_HANDLE],
            ["Cash App", process.env.CASHAPP_HANDLE],
          ].map(([label, handle]) => (
            <div key={label} className="rounded-2xl bg-peach-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
                {label}
              </dt>
              <dd className="mt-1 break-all text-sm font-bold">
                {handle || "Not configured"}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-5 text-stone-500">
          Update <code>VENMO_HANDLE</code>, <code>PAYPAL_HANDLE</code>, and{" "}
          <code>CASHAPP_HANDLE</code> in Vercel, then redeploy. QR PNGs remain in{" "}
          <code>/public/payment/</code>.
        </p>
      </section>
    </main>
  );
}
