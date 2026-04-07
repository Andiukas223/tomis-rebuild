"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SaveServiceReportButtonProps = {
  filters: {
    assigneeId: string;
    dateFrom: string;
    dateTo: string;
    status: string;
  };
};

export function SaveServiceReportButton({
  filters,
}: SaveServiceReportButtonProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/reports/service-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;

        throw new Error(payload?.message ?? "Failed to save report.");
      }

      const payload = (await response.json()) as { id: string };
      router.push(`/documents/${payload.id}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save report.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Save report record"}
      </button>
      {errorMessage ? (
        <p className="text-xs text-rose-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
