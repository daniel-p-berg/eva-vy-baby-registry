export type ItemType = "fixed" | "fund";
export type ClaimStatus = "claimed" | "paid" | "purchased" | "cancelled";
export type PaymentMethod = "Venmo" | "Cash App";
export type StoredPaymentMethod = PaymentMethod | null;

export type RegistryItem = {
  id: string;
  title: string;
  description: string;
  image_path: string;
  category: string;
  item_type: ItemType;
  price_usd: number | null;
  price_vnd: number | null;
  quantity_needed: number | null;
  fund_target_usd: number | null;
  fund_target_vnd: number | null;
  is_active: boolean;
  sort_order: number;
  claimed_quantity: number;
  remaining_quantity: number;
  funded_usd: number;
  funded_vnd: number;
  remaining_usd: number;
  remaining_vnd: number;
};

export type CartFixedLine = {
  itemId: string;
  title: string;
  imagePath: string;
  quantity: number;
  maxQuantity: number;
  unitUsd: number;
  unitVnd: number;
};

export type CartFundLine = {
  itemId: string;
  title: string;
  imagePath: string;
  contributionUsd: number;
  contributionVnd: number;
  maxUsd: number;
};

export type CartState = {
  fixed: CartFixedLine[];
  funds: CartFundLine[];
};

export type ClaimItemDetail = {
  id: string;
  item_id: string;
  quantity: number | null;
  contribution_usd: number | null;
  contribution_vnd: number | null;
  unit_price_usd: number | null;
  unit_price_vnd: number | null;
  items: { title: string; item_type: ItemType } | null;
};

export type ClaimDetail = {
  id: string;
  guest_name: string;
  guest_email: string | null;
  guest_note: string | null;
  intended_payment_method: StoredPaymentMethod;
  status: ClaimStatus;
  admin_note: string | null;
  total_usd: number;
  total_vnd: number;
  created_at: string;
  updated_at: string;
  claim_items: ClaimItemDetail[];
};

export type ActivityEvent = {
  id: string;
  event_type: string;
  claim_id: string | null;
  item_id: string | null;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
};
