"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  claimActivityDetails,
  claimActivityMetadata,
  claimDeletedMessage,
} from "@/lib/activity";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  isValidAdminPassword,
  isValidAdminSecret,
  isValidAdminSession,
} from "@/lib/security";
import { getServiceClient } from "@/lib/supabase";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function nullableNumber(formData: FormData, key: string) {
  const raw = value(formData, key);
  if (!raw) return null;
  const number = Number(raw);
  return Number.isFinite(number) ? number : null;
}

function adminUrl(secret: string, query?: string) {
  return `/admin/${encodeURIComponent(secret)}${query ? `?${query}` : ""}`;
}

async function requireAdmin(formData: FormData) {
  const secret = value(formData, "secret");
  const cookieStore = await cookies();
  if (
    !isValidAdminSecret(secret) ||
    !isValidAdminSession(secret, cookieStore.get(ADMIN_COOKIE)?.value)
  ) {
    throw new Error("Unauthorized");
  }
  return secret;
}

export async function loginAdmin(formData: FormData) {
  const secret = value(formData, "secret");
  const password = value(formData, "password");
  if (!isValidAdminSecret(secret)) redirect("/");
  if (!isValidAdminPassword(password)) {
    redirect(adminUrl(secret, "login=invalid"));
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createAdminSessionToken(secret), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: `/admin/${secret}`,
  });
  redirect(adminUrl(secret));
}

export async function logoutAdmin(formData: FormData) {
  const secret = await requireAdmin(formData);
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect(adminUrl(secret));
}

const itemSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(3000),
    imagePath: z
      .string()
      .trim()
      .regex(/^\/products\/[^?#]+\.png$/i, "Use a /products/*.png path."),
    category: z.string().trim().min(1).max(100),
    itemType: z.enum(["fixed", "fund"]),
    priceUsd: z.number().positive().nullable(),
    priceVnd: z.number().positive().nullable(),
    quantityNeeded: z.number().int().positive().nullable(),
    fundTargetUsd: z.number().positive().nullable(),
    fundTargetVnd: z.number().positive().nullable(),
    isActive: z.boolean(),
    sortOrder: z.number().int().min(-100000).max(100000),
  })
  .superRefine((item, context) => {
    const required =
      item.itemType === "fixed"
        ? ["priceUsd", "priceVnd", "quantityNeeded"]
        : ["fundTargetUsd", "fundTargetVnd"];
    required.forEach((field) => {
      if (item[field as keyof typeof item] === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Complete the required ${item.itemType} item fields.`,
        });
      }
    });
  });

function parseItem(formData: FormData) {
  const itemType = value(formData, "itemType");
  return itemSchema.safeParse({
    id: value(formData, "itemId") || undefined,
    title: value(formData, "title"),
    description: value(formData, "description"),
    imagePath: value(formData, "imagePath"),
    category: value(formData, "category"),
    itemType,
    priceUsd: itemType === "fixed" ? nullableNumber(formData, "priceUsd") : null,
    priceVnd: itemType === "fixed" ? nullableNumber(formData, "priceVnd") : null,
    quantityNeeded:
      itemType === "fixed" ? nullableNumber(formData, "quantityNeeded") : null,
    fundTargetUsd:
      itemType === "fund" ? nullableNumber(formData, "fundTargetUsd") : null,
    fundTargetVnd:
      itemType === "fund" ? nullableNumber(formData, "fundTargetVnd") : null,
    isActive: formData.get("isActive") === "on",
    sortOrder: Number(value(formData, "sortOrder") || 0),
  });
}

export async function saveItem(formData: FormData) {
  const secret = await requireAdmin(formData);
  const parsed = parseItem(formData);
  if (!parsed.success) {
    redirect(
      adminUrl(secret, `error=${encodeURIComponent(parsed.error.issues[0].message)}`),
    );
  }

  const item = parsed.data;
  const supabase = getServiceClient();
  const row = {
    title: item.title,
    description: item.description,
    image_path: item.imagePath,
    category: item.category,
    item_type: item.itemType,
    price_usd: item.priceUsd,
    price_vnd: item.priceVnd,
    quantity_needed: item.quantityNeeded,
    fund_target_usd: item.fundTargetUsd,
    fund_target_vnd: item.fundTargetVnd,
    is_active: item.isActive,
    sort_order: item.sortOrder,
  };

  let itemId = item.id;
  let eventType = "item_created";
  let message = `Created item “${item.title}”.`;

  if (item.id) {
    const { data: current } = await supabase
      .from("items")
      .select("is_active")
      .eq("id", item.id)
      .single();
    const { error } = await supabase.from("items").update(row).eq("id", item.id);
    if (error) {
      redirect(adminUrl(secret, "error=Could%20not%20save%20the%20item."));
    }
    if (current && current.is_active !== item.isActive) {
      eventType = item.isActive ? "item_reactivated" : "item_deactivated";
      message = `${item.isActive ? "Reactivated" : "Deactivated"} item “${item.title}”.`;
    } else {
      eventType = "item_edited";
      message = `Edited item “${item.title}”.`;
    }
  } else {
    const { data, error } = await supabase
      .from("items")
      .insert(row)
      .select("id")
      .single();
    if (error || !data) {
      redirect(adminUrl(secret, "error=Could%20not%20create%20the%20item."));
    }
    itemId = data.id;
  }

  await supabase.from("activity_events").insert({
    event_type: eventType,
    item_id: itemId,
    message,
    metadata: { title: item.title, sort_order: item.sortOrder },
  });

  revalidatePath("/");
  revalidatePath(adminUrl(secret));
  redirect(adminUrl(secret, "saved=item"));
}

const claimSchema = z.object({
  claimId: z.string().uuid(),
  guestName: z.string().trim().min(1).max(120),
  guestEmail: z
    .string()
    .trim()
    .max(254)
    .refine(
      (email) => !email || z.string().email().safeParse(email).success,
      "Enter a valid email.",
    ),
  guestNote: z.string().trim().max(2000),
  intendedPaymentMethod: z.enum(["Venmo", "Cash App", "Not sure yet"]),
  status: z.enum(["claimed", "paid", "purchased", "cancelled"]),
  adminNote: z.string().trim().max(5000),
});

export async function saveClaim(formData: FormData) {
  const secret = await requireAdmin(formData);
  const parsed = claimSchema.safeParse({
    claimId: value(formData, "claimId"),
    guestName: value(formData, "guestName"),
    guestEmail: value(formData, "guestEmail"),
    guestNote: value(formData, "guestNote"),
    intendedPaymentMethod: value(formData, "intendedPaymentMethod"),
    status: value(formData, "status"),
    adminNote: value(formData, "adminNote"),
  });
  if (!parsed.success) {
    redirect(
      adminUrl(secret, `error=${encodeURIComponent(parsed.error.issues[0].message)}`),
    );
  }

  const supabase = getServiceClient();
  const { data: claimItems, error: readError } = await supabase
    .from("claim_items")
    .select("id, quantity, contribution_usd")
    .eq("claim_id", parsed.data.claimId);
  if (readError || !claimItems) {
    redirect(adminUrl(secret, "error=Could%20not%20load%20claim%20items."));
  }

  const lines = claimItems.map((line) => {
    const raw = Number(value(formData, `line:${line.id}`));
    return line.quantity !== null
      ? { claim_item_id: line.id, quantity: raw }
      : { claim_item_id: line.id, contribution_usd: raw };
  });
  if (lines.some((line) => !Number.isFinite(
    "quantity" in line ? line.quantity : line.contribution_usd,
  ))) {
    redirect(adminUrl(secret, "error=Enter%20valid%20claim%20amounts."));
  }

  const claim = parsed.data;
  const { error } = await supabase.rpc("admin_update_claim", {
    p_claim_id: claim.claimId,
    p_guest_name: claim.guestName,
    p_guest_email: claim.guestEmail || null,
    p_guest_note: claim.guestNote || null,
    p_intended_payment_method: claim.intendedPaymentMethod,
    p_status: claim.status,
    p_admin_note: claim.adminNote || null,
    p_lines: lines,
  });

  if (error) {
    const availability = error.message.includes("AVAILABLE");
    redirect(
      adminUrl(
        secret,
        `error=${encodeURIComponent(
          availability
            ? "That edit exceeds the currently available quantity or fund balance."
            : "Could not save the claim.",
        )}`,
      ),
    );
  }

  revalidatePath("/");
  revalidatePath(adminUrl(secret));
  redirect(adminUrl(secret, "saved=claim"));
}

const deleteClaimSchema = z.object({
  claimId: z.string().uuid(),
});

export async function deleteClaim(formData: FormData) {
  const secret = await requireAdmin(formData);
  const parsed = deleteClaimSchema.safeParse({
    claimId: value(formData, "claimId"),
  });
  if (!parsed.success) {
    redirect(adminUrl(secret, "error=Could%20not%20identify%20the%20claim."));
  }

  const supabase = getServiceClient();
  const { data: claim, error: readError } = await supabase
    .from("claims")
    .select(
      "id, guest_name, guest_email, guest_note, status, intended_payment_method, total_usd, total_vnd, claim_items(item_id, quantity, contribution_usd, contribution_vnd, unit_price_usd, unit_price_vnd, items(title))",
    )
    .eq("id", parsed.data.claimId)
    .maybeSingle();

  if (readError || !claim) {
    redirect(adminUrl(secret, "error=Could%20not%20load%20the%20claim."));
  }

  const details = claimActivityDetails(claim);
  const { data: event, error: eventError } = await supabase
    .from("activity_events")
    .insert({
      event_type: "claim_deleted",
      claim_id: claim.id,
      message: claimDeletedMessage(details),
      metadata: {
        status: claim.status,
        ...claimActivityMetadata(details),
        claim_id: claim.id,
      },
    })
    .select("id")
    .single();

  if (eventError || !event) {
    redirect(
      adminUrl(secret, "error=Could%20not%20record%20the%20deletion%20event."),
    );
  }

  const { data: deletedClaim, error: deleteError } = await supabase
    .from("claims")
    .delete()
    .eq("id", claim.id)
    .select("id")
    .single();

  if (deleteError || !deletedClaim) {
    await supabase.from("activity_events").delete().eq("id", event.id);
    redirect(adminUrl(secret, "error=Could%20not%20delete%20the%20claim."));
  }

  revalidatePath("/");
  revalidatePath(adminUrl(secret));
  redirect(adminUrl(secret, "saved=deleted"));
}
