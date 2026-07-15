import "server-only";

import { getServiceClient } from "@/lib/supabase";
import type {
  ActivityEvent,
  ClaimDetail,
  ClaimStatus,
  RegistryItem,
  SiteContent,
} from "@/lib/types";
import { defaultSiteContent } from "@/lib/public-data";

export type AdminSummary = {
  claimedUsd: number;
  paidUsd: number;
  purchasedUsd: number;
  unpaidUsd: number;
  unclaimedUsd: number;
  claimedVnd: number;
  paidVnd: number;
  purchasedVnd: number;
  unpaidVnd: number;
  unclaimedVnd: number;
};

export type AdminData = {
  summary: AdminSummary;
  claims: ClaimDetail[];
  items: RegistryItem[];
  events: ActivityEvent[];
  siteContent: SiteContent;
};

const numberOrZero = (value: unknown) => Number(value || 0);

export async function getAdminData(): Promise<AdminData> {
  const supabase = getServiceClient();
  const [claimsResult, itemsResult, eventsResult, siteContentResult] = await Promise.all([
    supabase
      .from("claims")
      .select(
        "id, guest_name, guest_email, guest_note, intended_payment_method, status, admin_note, total_usd, total_vnd, created_at, updated_at, claim_items(id, item_id, quantity, contribution_usd, contribution_vnd, unit_price_usd, unit_price_vnd, items(title, item_type))",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("public_item_availability")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("activity_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("site_content")
      .select("id, story_title, story_body, updated_at")
      .eq("id", "home")
      .maybeSingle(),
  ]);

  if (claimsResult.error) throw new Error(claimsResult.error.message);
  if (itemsResult.error) throw new Error(itemsResult.error.message);
  if (eventsResult.error) throw new Error(eventsResult.error.message);
  if (siteContentResult.error) {
    console.error("Could not load site content:", siteContentResult.error.message);
  }

  const claims = (claimsResult.data || []).map((claim) => ({
    ...claim,
    total_usd: Number(claim.total_usd),
    total_vnd: Number(claim.total_vnd),
    claim_items: (claim.claim_items || []).map((line) => ({
      ...line,
      contribution_usd:
        line.contribution_usd === null ? null : Number(line.contribution_usd),
      contribution_vnd:
        line.contribution_vnd === null ? null : Number(line.contribution_vnd),
      unit_price_usd:
        line.unit_price_usd === null ? null : Number(line.unit_price_usd),
      unit_price_vnd:
        line.unit_price_vnd === null ? null : Number(line.unit_price_vnd),
      items: Array.isArray(line.items) ? line.items[0] ?? null : line.items,
    })),
  })) as ClaimDetail[];

  const items = (itemsResult.data || []).map((item) => ({
    ...item,
    price_usd: item.price_usd === null ? null : Number(item.price_usd),
    price_vnd: item.price_vnd === null ? null : Number(item.price_vnd),
    fund_target_usd:
      item.fund_target_usd === null ? null : Number(item.fund_target_usd),
    fund_target_vnd:
      item.fund_target_vnd === null ? null : Number(item.fund_target_vnd),
    claimed_quantity: numberOrZero(item.claimed_quantity),
    remaining_quantity: numberOrZero(item.remaining_quantity),
    funded_usd: numberOrZero(item.funded_usd),
    funded_vnd: numberOrZero(item.funded_vnd),
    remaining_usd: numberOrZero(item.remaining_usd),
    remaining_vnd: numberOrZero(item.remaining_vnd),
  })) as RegistryItem[];

  const byStatuses = (statuses: ClaimStatus[], currency: "usd" | "vnd") =>
    claims
      .filter((claim) => statuses.includes(claim.status))
      .reduce((sum, claim) => sum + claim[`total_${currency}`], 0);

  const unclaimedUsd = items
    .filter((item) => item.is_active)
    .reduce(
      (sum, item) =>
        sum +
        (item.item_type === "fixed"
          ? item.remaining_quantity * (item.price_usd || 0)
          : item.remaining_usd),
      0,
    );
  const unclaimedVnd = items
    .filter((item) => item.is_active)
    .reduce(
      (sum, item) =>
        sum +
        (item.item_type === "fixed"
          ? item.remaining_quantity * (item.price_vnd || 0)
          : item.remaining_vnd),
      0,
    );

  return {
    summary: {
      claimedUsd: byStatuses(["claimed", "paid", "purchased"], "usd"),
      paidUsd: byStatuses(["paid", "purchased"], "usd"),
      purchasedUsd: byStatuses(["purchased"], "usd"),
      unpaidUsd: byStatuses(["claimed"], "usd"),
      unclaimedUsd,
      claimedVnd: byStatuses(["claimed", "paid", "purchased"], "vnd"),
      paidVnd: byStatuses(["paid", "purchased"], "vnd"),
      purchasedVnd: byStatuses(["purchased"], "vnd"),
      unpaidVnd: byStatuses(["claimed"], "vnd"),
      unclaimedVnd,
    },
    claims,
    items,
    events: (eventsResult.data || []) as ActivityEvent[],
    siteContent: siteContentResult.data
      ? (siteContentResult.data as SiteContent)
      : defaultSiteContent,
  };
}
