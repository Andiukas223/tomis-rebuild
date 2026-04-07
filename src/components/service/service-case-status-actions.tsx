"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ServiceCaseStatusActionsProps = {
  id: string;
  currentStatus: string;
};

export function ServiceCaseStatusActions({
  id,
  currentStatus,
}: ServiceCaseStatusActionsProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const actions =
    currentStatus === "Open"
      ? [{ label: "Start work", status: "In Progress" }]
      : currentStatus === "Planned"
        ? [{ label: "Start work", status: "In Progress" }]
        : currentStatus === "In Progress"
          ? [{ label: "Mark done", status: "Done" }]
          : [{ label: "Reopen", status: "Open" }];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            disabled={isPending}
            onClick={() => {
              setError("");
              startTransition(async () => {
                const response = await fetch(`/api/service-cases/${id}/status`, {
                  method: "PATCH",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ status: action.status }),
                });

                if (!response.ok) {
                  const data = (await response.json()) as { message?: string };
                  setError(data.message ?? "Failed to update service case status.");
                  return;
                }

                router.refresh();
              });
            }}
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {isPending ? "Updating..." : action.label}
          </button>
        ))}
      </div>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
