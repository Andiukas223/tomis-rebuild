"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { hasCapability } from "@/lib/permissions";

type ReportMetadataFormProps = {
  reportId: string;
  initialStatus: string;
  initialLabel: string | null;
};

export function ReportMetadataForm({
  reportId,
  initialStatus,
  initialLabel,
}: ReportMetadataFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [workflowStatus, setWorkflowStatus] = useState(initialStatus);
  const [label, setLabel] = useState(initialLabel ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!hasCapability(user, "documents.manage")) {
    return null;
  }

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflowStatus,
          label,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update report metadata.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update report metadata.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <h3 className="text-lg font-semibold text-slate-950">Workflow metadata</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <select
          value={workflowStatus}
          onChange={(event) => setWorkflowStatus(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
        >
          <option value="Draft">Draft</option>
          <option value="Shared">Shared</option>
          <option value="Archived">Archived</option>
        </select>
        <input
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Label"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save metadata"}
        </button>
      </div>
      {errorMessage ? (
        <p className="mt-2 text-xs text-rose-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
