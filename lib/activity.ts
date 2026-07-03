import "server-only";

import { formatUsd, formatVnd } from "@/lib/format";
import type { PaymentMethod } from "@/lib/types";

export type ActivityFixedItem = {
  item_id: string;
  title: string;
  quantity: number;
  unit_price_usd: number;
  unit_price_vnd: number;
};

export type ActivityFundContribution = {
  item_id: string;
  title: string;
  contribution_usd: number;
  contribution_vnd: number;
};

export type ClaimActivityDetails = {
  guest_name: string;
  guest_email: string | null;
  guest_note: string | null;
  intended_payment_method: PaymentMethod;
  fixed_items: ActivityFixedItem[];
  fund_contributions: ActivityFundContribution[];
  total_usd: number;
  total_vnd: number;
};

type ClaimActivityRow = {
  guest_name: string;
  guest_email: string | null;
  guest_note: string | null;
  intended_payment_method: PaymentMethod;
  total_usd: unknown;
  total_vnd: unknown;
  claim_items: Array<{
    item_id: string;
    quantity: number | null;
    contribution_usd: unknown;
    contribution_vnd: unknown;
    unit_price_usd: unknown;
    unit_price_vnd: unknown;
    items: unknown;
  }>;
};

function activityItemTitle(value: unknown, fallback: string) {
  const item = Array.isArray(value) ? value[0] : value;
  if (!item || typeof item !== "object" || !("title" in item)) return fallback;
  return typeof item.title === "string" && item.title.trim()
    ? item.title
    : fallback;
}

export function claimActivityDetails(claim: ClaimActivityRow) {
  return {
    guest_name: claim.guest_name,
    guest_email: claim.guest_email,
    guest_note: claim.guest_note,
    intended_payment_method: claim.intended_payment_method,
    fixed_items: (claim.claim_items || [])
      .filter((line) => line.quantity !== null)
      .map((line) => ({
        item_id: line.item_id,
        title: activityItemTitle(line.items, "Registry item"),
        quantity: line.quantity || 0,
        unit_price_usd: Number(line.unit_price_usd),
        unit_price_vnd: Number(line.unit_price_vnd),
      })),
    fund_contributions: (claim.claim_items || [])
      .filter((line) => line.contribution_usd !== null)
      .map((line) => ({
        item_id: line.item_id,
        title: activityItemTitle(line.items, "Group fund"),
        contribution_usd: Number(line.contribution_usd),
        contribution_vnd: Number(line.contribution_vnd),
      })),
    total_usd: Number(claim.total_usd),
    total_vnd: Number(claim.total_vnd),
  } satisfies ClaimActivityDetails;
}

function joinList(values: string[]) {
  if (values.length < 2) return values[0] || "";
  if (values.length === 2) return values.join(" and ");
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function fixedSummary(items: ActivityFixedItem[]) {
  return joinList(
    items.map((item) =>
      item.quantity > 1 ? `${item.quantity} × ${item.title}` : item.title,
    ),
  );
}

function fundSummary(contributions: ActivityFundContribution[]) {
  return joinList(
    contributions.map(
      (contribution) =>
        `${formatUsd(contribution.contribution_usd)} to ${contribution.title}`,
    ),
  );
}

function selectionSummary(details: ClaimActivityDetails) {
  return joinList(
    [
      details.fixed_items.length
        ? fixedSummary(details.fixed_items)
        : "",
      details.fund_contributions.length
        ? fundSummary(details.fund_contributions)
        : "",
    ].filter(Boolean),
  );
}

export function claimActivityMetadata(details: ClaimActivityDetails) {
  return {
    guest_name: details.guest_name,
    guest_email: details.guest_email,
    intended_payment_method: details.intended_payment_method,
    guest_note: details.guest_note,
    fixed_items: details.fixed_items,
    fund_contributions: details.fund_contributions,
    total_usd: details.total_usd,
    total_vnd: details.total_vnd,
  };
}

export function claimCreatedMessage(details: ClaimActivityDetails) {
  const actions = [
    details.fixed_items.length
      ? `claimed ${fixedSummary(details.fixed_items)}`
      : "",
    details.fund_contributions.length
      ? `contributed ${fundSummary(details.fund_contributions)}`
      : "",
  ].filter(Boolean);
  const note = details.guest_note
    ? ` Message: “${details.guest_note}”.`
    : "";

  return `${details.guest_name} ${joinList(actions)}. Intended payment: ${details.intended_payment_method}.${note} Total: ${formatUsd(details.total_usd)} (${formatVnd(details.total_vnd)}).`;
}

export function claimDeletedMessage(details: ClaimActivityDetails) {
  return `[Admin] deleted claim from ${details.guest_name} for ${selectionSummary(details)}, total ${formatUsd(details.total_usd)} (${formatVnd(details.total_vnd)}).`;
}
