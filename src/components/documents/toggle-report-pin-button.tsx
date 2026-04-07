"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ToggleReportPinButtonProps = {
  reportId: string;
  isPinned: boolean;
};

export function ToggleReportPinButton({
  reportId,
  isPinned,
}: ToggleReportPinButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);

    try {
      await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPinned: !isPinned }),
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? "Saving..." : isPinned ? "Unpin" : "Pin"}
    </button>
  );
}
