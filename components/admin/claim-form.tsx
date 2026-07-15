import { formatUsd, formatVnd } from "@/lib/format";
import type { ClaimDetail } from "@/lib/types";

type Props = {
  secret: string;
  claim: ClaimDetail;
  action: (formData: FormData) => void | Promise<void>;
};

export function ClaimForm({ secret, claim, action }: Props) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="secret" value={secret} />
      <input type="hidden" name="claimId" value={claim.id} />
      <label>
        <span className="label">Guest name</span>
        <input
          name="guestName"
          required
          maxLength={120}
          defaultValue={claim.guest_name}
          className="field"
        />
      </label>
      <label>
        <span className="label">Guest email</span>
        <input
          name="guestEmail"
          type="email"
          maxLength={254}
          defaultValue={claim.guest_email || ""}
          className="field"
        />
      </label>
      <label>
        <span className="label">Payment method</span>
        <select
          name="intendedPaymentMethod"
          defaultValue={claim.intended_payment_method || ""}
          className="field"
        >
          <option value="">Not collected</option>
          <option>Venmo</option>
          <option>Cash App</option>
        </select>
      </label>
      <label>
        <span className="label">Status</span>
        <select name="status" defaultValue={claim.status} className="field">
          <option value="claimed">Claimed</option>
          <option value="paid">Paid</option>
          <option value="purchased">Purchased</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className="label">Guest note</span>
        <textarea
          name="guestNote"
          rows={3}
          maxLength={2000}
          defaultValue={claim.guest_note || ""}
          className="field"
        />
      </label>

      <div className="rounded-2xl bg-peach-50 p-4 sm:col-span-2">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-peach-700">
          Claimed gifts & contributions
        </p>
        <div className="mt-3 grid gap-3">
          {claim.claim_items.map((line) => (
            <label
              key={line.id}
              className="flex items-center justify-between gap-4 rounded-xl bg-white p-3"
            >
              <span className="min-w-0">
                <strong className="block truncate text-sm">
                  {line.items?.title || "Registry item"}
                </strong>
                <span className="text-xs text-stone-500">
                  {line.quantity
                    ? `${formatUsd(line.unit_price_usd || 0)} each · ${formatVnd(line.unit_price_vnd || 0)}`
                    : `Group fund · ${formatVnd(line.contribution_vnd || 0)}`}
                </span>
              </span>
              <span className="relative w-28 shrink-0">
                {line.contribution_usd ? (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500">
                    $
                  </span>
                ) : null}
                <input
                  name={`line:${line.id}`}
                  type="number"
                  min={line.quantity ? 1 : 0.01}
                  step={line.quantity ? 1 : 0.01}
                  required
                  defaultValue={line.quantity ?? line.contribution_usd ?? ""}
                  className={`field py-2 ${line.contribution_usd ? "pl-7" : ""}`}
                  aria-label={`${line.items?.title || "Item"} ${line.quantity ? "quantity" : "contribution"}`}
                />
              </span>
            </label>
          ))}
        </div>
      </div>

      <label className="sm:col-span-2">
        <span className="label">Private admin note</span>
        <textarea
          name="adminNote"
          rows={3}
          maxLength={5000}
          defaultValue={claim.admin_note || ""}
          className="field"
          placeholder="Never shown publicly"
        />
      </label>
      <button type="submit" className="button-primary sm:col-span-2">
        Save claim
      </button>
    </form>
  );
}
