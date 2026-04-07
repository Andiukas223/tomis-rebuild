"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ServiceCaseAssigneeSelectProps = {
  serviceCaseId: string;
  assignedUserId: string | null;
  assignees: {
    id: string;
    fullName: string;
  }[];
};

export function ServiceCaseAssigneeSelect({
  serviceCaseId,
  assignedUserId,
  assignees,
}: ServiceCaseAssigneeSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState(assignedUserId ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <select
        aria-label="Assign technician"
        value={value}
        disabled={isPending}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
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
                  assignedUserId: nextValue || null,
                }),
              },
            );

            if (!response.ok) {
              const data = (await response.json()) as { message?: string };
              setError(data.message ?? "Failed to update technician assignment.");
              setValue(assignedUserId ?? "");
              return;
            }

            router.refresh();
          });
        }}
        className="w-full min-w-[160px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <option value="">Unassigned</option>
        {assignees.map((assignee) => (
          <option key={assignee.id} value={assignee.id}>
            {assignee.fullName}
          </option>
        ))}
      </select>
      {error ? <p className="text-[11px] text-rose-700">{error}</p> : null}
    </div>
  );
}
