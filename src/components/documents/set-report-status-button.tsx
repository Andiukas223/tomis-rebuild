"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SetReportStatusButtonProps = {
  reportId: string;
  targetStatus: "Draft" | "Shared" | "Archived";
  label: string;
};

export function SetReportStatusButton({
  reportId,
  targetStatus,
  label,
}: SetReportStatusButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflowStatus: targetStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Status update failed.");
      }

      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? "Saving..." : label}
    </button>
  );
}
