"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { DeleteReportButton } from "@/components/documents/delete-report-button";
import { SetReportStatusButton } from "@/components/documents/set-report-status-button";
import { ToggleReportPinButton } from "@/components/documents/toggle-report-pin-button";
import { hasCapability } from "@/lib/permissions";

export type DocumentHistoryReport = {
  id: string;
  title: string;
  reportType: string;
  isPinned: boolean;
  workflowStatus: string;
  label: string | null;
  scopeLabel: string;
  dateWindowLabel: string;
  createdAt: string;
  createdByName: string | null;
  notes: string | null;
};

type ReportHistoryTableProps = {
  reports: DocumentHistoryReport[];
};

export function ReportHistoryTable({ reports }: ReportHistoryTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = reports.length > 0 && selectedIds.length === reports.length;
  const canManageDocuments = hasCapability(user, "documents.manage");

  function toggleSelection(reportId: string) {
    setSelectedIds((current) =>
      current.includes(reportId)
        ? current.filter((id) => id !== reportId)
        : [...current, reportId],
    );
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : reports.map((report) => report.id));
  }

  async function runBulkUpdate(payload: {
    workflowStatus?: "Draft" | "Shared" | "Archived";
    isPinned?: boolean;
  }) {
    if (selectedIds.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports/bulk", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: selectedIds,
          ...payload,
        }),
      });

      if (!response.ok) {
        throw new Error("Bulk update failed.");
      }

      setSelectedIds([]);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function runBulkDelete() {
    if (selectedIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} saved report record(s)? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports/bulk", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: selectedIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Bulk delete failed.");
      }

      setSelectedIds([]);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-5 overflow-x-auto">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-950">
            {selectedIds.length > 0
              ? `${selectedIds.length} report${selectedIds.length === 1 ? "" : "s"} selected`
              : "Select reports for bulk actions"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Quickly share, archive, pin, or delete multiple saved report records.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runBulkUpdate({ workflowStatus: "Shared" })}
            disabled={isSubmitting || selectedIds.length === 0}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Share selected
          </button>
          <button
            type="button"
            onClick={() => runBulkUpdate({ workflowStatus: "Archived" })}
            disabled={isSubmitting || selectedIds.length === 0}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Archive selected
          </button>
          <button
            type="button"
            onClick={() => runBulkUpdate({ workflowStatus: "Draft" })}
            disabled={isSubmitting || selectedIds.length === 0}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Restore draft
          </button>
          <button
            type="button"
            onClick={() => runBulkUpdate({ isPinned: true })}
            disabled={isSubmitting || selectedIds.length === 0}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Pin selected
          </button>
          <button
            type="button"
            onClick={() => runBulkUpdate({ isPinned: false })}
            disabled={isSubmitting || selectedIds.length === 0}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Unpin selected
          </button>
          <button
            type="button"
            onClick={runBulkDelete}
            disabled={isSubmitting || selectedIds.length === 0}
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete selected
          </button>
        </div>
      </div>

      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
            <th className="px-4 py-3 font-semibold">
              {canManageDocuments ? (
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all reports"
                  className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400"
                />
              ) : null}
            </th>
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Pinned</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Label</th>
            <th className="px-4 py-3 font-semibold">Scope</th>
            <th className="px-4 py-3 font-semibold">Created</th>
            <th className="px-4 py-3 font-semibold">Author</th>
            <th className="px-4 py-3 font-semibold">Notes</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr
              key={report.id}
              className="border-b border-slate-100 text-sm text-slate-700"
            >
              <td className="px-4 py-3 align-top">
                {canManageDocuments ? (
                  <input
                    type="checkbox"
                    checked={selectedSet.has(report.id)}
                    onChange={() => toggleSelection(report.id)}
                    aria-label={`Select report ${report.title}`}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400"
                  />
                ) : null}
              </td>
              <td className="px-4 py-3 font-medium text-slate-950">
                <div className="flex items-center gap-2">
                  {report.isPinned ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                      Pinned
                    </span>
                  ) : null}
                  <span>{report.title}</span>
                </div>
              </td>
              <td className="px-4 py-3">{report.reportType}</td>
              <td className="px-4 py-3">{report.isPinned ? "Yes" : "No"}</td>
              <td className="px-4 py-3">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                  {report.workflowStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {report.label ?? "No label"}
              </td>
              <td className="px-4 py-3">
                <p>{report.scopeLabel}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {report.dateWindowLabel}
                </p>
              </td>
              <td className="px-4 py-3">
                {new Date(report.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">{report.createdByName ?? "System"}</td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {report.notes ? (
                  report.notes.length > 72
                    ? `${report.notes.slice(0, 72)}...`
                    : report.notes
                ) : (
                  "No note"
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/documents/${report.id}`}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Open
                  </Link>
                  {canManageDocuments ? (
                    <>
                      <ToggleReportPinButton
                        reportId={report.id}
                        isPinned={report.isPinned}
                      />
                      {report.workflowStatus !== "Shared" ? (
                        <SetReportStatusButton
                          reportId={report.id}
                          targetStatus="Shared"
                          label="Share"
                        />
                      ) : null}
                      {report.workflowStatus !== "Archived" ? (
                        <SetReportStatusButton
                          reportId={report.id}
                          targetStatus="Archived"
                          label="Archive"
                        />
                      ) : (
                        <SetReportStatusButton
                          reportId={report.id}
                          targetStatus="Draft"
                          label="Restore draft"
                        />
                      )}
                      <DeleteReportButton reportId={report.id} />
                    </>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
