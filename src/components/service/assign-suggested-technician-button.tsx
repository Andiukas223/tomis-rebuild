"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type AssignSuggestedTechnicianButtonProps = {
  serviceCaseId: string;
  technicianId: string;
  technicianName: string;
  compact?: boolean;
};

export function AssignSuggestedTechnicianButton({
  serviceCaseId,
  technicianId,
  technicianName,
  compact = false,
}: AssignSuggestedTechnicianButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError("");
          startTransition(async () => {
            const response = await fetch(
              `/api/service-cases/${serviceCaseId}/assignment`,
              {
                method: "PATCH",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  assignedUserId: technicianId,
                }),
              },
            );

            if (!response.ok) {
              const data = (await response.json()) as { message?: string };
              setError(data.message ?? "Failed to assign suggested technician.");
              return;
            }

            router.refresh();
          });
        }}
        className={
          compact
            ? "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            : "rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        }
      >
        {isPending ? "Assigning..." : `Assign ${technicianName}`}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
