"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteServiceCaseButton({ id }: { id: string }) {
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
            "Delete this service case? This cannot be undone.",
          );

          if (!confirmed) {
            return;
          }

          setError("");
          startTransition(async () => {
            const response = await fetch(`/api/service-cases/${id}`, {
              method: "DELETE",
              credentials: "include",
            });

            if (!response.ok) {
              const data = (await response.json()) as { message?: string };
              setError(data.message ?? "Failed to delete service case.");
              return;
            }

            router.push("/service");
            router.refresh();
          });
        }}
        className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
