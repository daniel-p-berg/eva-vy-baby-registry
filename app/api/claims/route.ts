import { NextResponse } from "next/server";
import { z } from "zod";

import {
  claimActivityDetails,
  claimActivityMetadata,
  claimCreatedMessage,
} from "@/lib/activity";
import { signReceipt } from "@/lib/security";
import { getServiceClient, hasSupabaseConfig } from "@/lib/supabase";

const payloadSchema = z
  .object({
    guestName: z.string().trim().min(1).max(120),
    guestEmail: z
      .string()
      .trim()
      .max(254)
      .refine(
        (value) => value === "" || z.string().email().safeParse(value).success,
        "Enter a valid email address.",
      ),
    guestNote: z.string().trim().max(2000),
    intendedPaymentMethod: z.enum([
      "Venmo",
      "PayPal",
      "Cash App",
      "Not sure yet",
    ]),
    fixed: z
      .array(
        z.object({
          itemId: z.string().uuid(),
          quantity: z.number().int().min(1).max(100),
        }),
      )
      .max(100),
    funds: z
      .array(
        z.object({
          itemId: z.string().uuid(),
          contributionUsd: z.number().positive().max(100000),
        }),
      )
      .max(100),
  })
  .superRefine((value, context) => {
    if (value.fixed.length + value.funds.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Your gift bag is empty.",
      });
    }
    const ids = [
      ...value.fixed.map((line) => line.itemId),
      ...value.funds.map((line) => line.itemId),
    ];
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Each registry item can only appear once.",
      });
    }
  });

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      {
        error:
          "The registry database is not connected yet. Please try again later.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = payloadSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message || "Check the form and try again." },
      { status: 400 },
    );
  }

  const payload = result.data;
  const supabase = getServiceClient();
  const { data, error } = await supabase.rpc("create_registry_claim", {
    p_guest_name: payload.guestName,
    p_guest_email: payload.guestEmail || null,
    p_guest_note: payload.guestNote || null,
    p_intended_payment_method: payload.intendedPaymentMethod,
    p_fixed_items: payload.fixed.map((line) => ({
      item_id: line.itemId,
      quantity: line.quantity,
    })),
    p_fund_items: payload.funds.map((line) => ({
      item_id: line.itemId,
      contribution_usd: line.contributionUsd,
    })),
  });

  if (error || !data) {
    console.error("Claim creation failed:", error?.message);
    const message = error?.message || "";
    const availabilityError =
      message.includes("AVAILABLE") ||
      message.includes("INACTIVE") ||
      message.includes("ITEM_TYPE");
    return NextResponse.json(
      {
        error: availabilityError
          ? "One of these gifts is no longer available in that amount. Please refresh the registry and choose again."
          : "We couldn’t reserve your gifts. Please try again.",
      },
      { status: availabilityError ? 409 : 500 },
    );
  }

  const claimId = String(data);
  const { data: claim, error: claimError } = await supabase
    .from("claims")
    .select(
      "guest_name, guest_email, guest_note, intended_payment_method, total_usd, total_vnd, claim_items(item_id, quantity, contribution_usd, contribution_vnd, unit_price_usd, unit_price_vnd, items(title))",
    )
    .eq("id", claimId)
    .single();

  if (claimError || !claim) {
    console.error("Could not load the new claim activity:", claimError?.message);
  } else {
    const details = claimActivityDetails(claim);
    const message = claimCreatedMessage(details);
    const metadata = claimActivityMetadata(details);
    const { data: updatedEvents, error: activityError } = await supabase
      .from("activity_events")
      .update({
        message,
        metadata,
      })
      .eq("claim_id", claimId)
      .eq("event_type", "claim_created")
      .select("id");

    if (activityError) {
      console.error("Could not enrich the new claim activity:", activityError.message);
    } else if (!updatedEvents.length) {
      const { error: insertError } = await supabase
        .from("activity_events")
        .insert({
          event_type: "claim_created",
          claim_id: claimId,
          message,
          metadata,
        });
      if (insertError) {
        console.error("Could not create the new claim activity:", insertError.message);
      }
    }
  }

  return NextResponse.json({
    claimId,
    receipt: signReceipt(claimId),
  });
}
