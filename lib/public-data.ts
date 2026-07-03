import "server-only";

import { demoItems } from "@/lib/demo-items";
import { getServiceClient, hasSupabaseConfig } from "@/lib/supabase";
import type { RegistryItem } from "@/lib/types";

export async function getPublicItems(): Promise<RegistryItem[]> {
  if (!hasSupabaseConfig()) {
    return demoItems;
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("public_item_availability")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Could not load registry items:", error.message);
    return [];
  }

  return (data ?? []).map((item) => ({
    ...item,
    price_usd: item.price_usd === null ? null : Number(item.price_usd),
    price_vnd: item.price_vnd === null ? null : Number(item.price_vnd),
    fund_target_usd:
      item.fund_target_usd === null ? null : Number(item.fund_target_usd),
    fund_target_vnd:
      item.fund_target_vnd === null ? null : Number(item.fund_target_vnd),
    claimed_quantity: Number(item.claimed_quantity || 0),
    remaining_quantity: Number(item.remaining_quantity || 0),
    funded_usd: Number(item.funded_usd || 0),
    funded_vnd: Number(item.funded_vnd || 0),
    remaining_usd: Number(item.remaining_usd || 0),
    remaining_vnd: Number(item.remaining_vnd || 0),
  })) as RegistryItem[];
}
