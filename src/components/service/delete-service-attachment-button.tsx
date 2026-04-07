"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteServiceAttachmentButton({
  serviceCaseId,
  attachmentId,
}: {
  serviceCaseId: string;
  attachmentId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          const confirmed = window.confirm(
            "Delete this attachment from the service history?",
          );

          if (!confirmed) {
            return;
          }

          setError("");
          startTransition(async () => {
            const response = await fetch(
              `/api/service-cases/${serviceCaseId}/attachments/${attachmentId}`,
              {
                method: "DELETE",
                credentials: "include",
              },
            );

            if (!response.ok) {
              const data = (await response.json()) as { message?: string };
              setError(data.message ?? "Failed to delete attachment.");
              return;
            }

            router.refresh();
          });
        }}
        className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Removing..." : "Delete"}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
