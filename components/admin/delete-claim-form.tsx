"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
  secret: string;
  claimId: string;
  action: (formData: FormData) => void | Promise<void>;
};

export function DeleteClaimForm({ secret, claimId, action }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-50"
      >
        <Trash2 className="size-4" />
        Delete claim
      </button>
    );
  }

  return (
    <form
      action={action}
      role="alertdialog"
      aria-label="Confirm permanent claim deletion"
      className="rounded-2xl border border-red-200 bg-red-50 p-4"
    >
      <input type="hidden" name="secret" value={secret} />
      <input type="hidden" name="claimId" value={claimId} />
      <p className="text-sm font-bold text-red-800">
        Delete this claim permanently?
      </p>
      <p className="mt-1 text-xs leading-5 text-red-700">
        This is mainly for test or duplicate claims. For real guest changes,
        use Cancel instead.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="button-secondary"
        >
          Keep claim
        </button>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-bold text-white transition hover:bg-red-800"
        >
          <Trash2 className="size-4" />
          Delete permanently
        </button>
      </div>
    </form>
  );
}
