import "server-only";

import { getServiceClient } from "@/lib/supabase";
import type { ClaimDetail } from "@/lib/types";

export async function getClaim(claimId: string): Promise<ClaimDetail | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("claims")
    .select(
      "id, guest_name, guest_email, guest_note, intended_payment_method, status, admin_note, total_usd, total_vnd, created_at, updated_at, claim_items(id, item_id, quantity, contribution_usd, contribution_vnd, unit_price_usd, unit_price_vnd, items(title, item_type))",
    )
    .eq("id", claimId)
    .single();

  if (error || !data) return null;
  return {
    ...data,
    total_usd: Number(data.total_usd),
    total_vnd: Number(data.total_vnd),
    claim_items: (data.claim_items || []).map((line) => ({
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
  } as ClaimDetail;
}
