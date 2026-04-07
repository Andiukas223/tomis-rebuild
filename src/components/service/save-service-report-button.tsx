"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { hasCapability } from "@/lib/permissions";

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
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [label, setLabel] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState("Draft");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!hasCapability(user, "documents.manage")) {
    return null;
  }

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/reports/service-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...filters,
          title,
          notes,
          label,
          workflowStatus,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;

        throw new Error(payload?.message ?? "Failed to save report.");
      }

      const payload = (await response.json()) as { id: string };
      setIsExpanded(false);
      setTitle("");
      setNotes("");
      setLabel("");
      setWorkflowStatus("Draft");
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
    <div className="space-y-2 rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          {isExpanded ? "Hide save options" : "Save report record"}
        </button>
        {!isExpanded ? (
          <p className="text-xs text-slate-500">
            Add a custom title and internal note before saving.
          </p>
        ) : null}
      </div>
      {isExpanded ? (
        <div className="grid gap-3">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Custom report title"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Internal note for this saved report"
            rows={3}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Label, for example Weekly review"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            />
            <select
              value={workflowStatus}
              onChange={(event) => setWorkflowStatus(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="Draft">Draft</option>
              <option value="Shared">Shared</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save now"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setErrorMessage(null);
              }}
              disabled={isSaving}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {errorMessage ? (
        <p className="text-xs text-rose-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
