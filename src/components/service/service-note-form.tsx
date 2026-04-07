"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ServiceNoteFormProps = {
  serviceCaseId: string;
  mode?: "create" | "edit";
  noteId?: string;
  initialBody?: string;
  onCancel?: () => void;
};

export function ServiceNoteForm({
  serviceCaseId,
  mode = "create",
  noteId,
  initialBody = "",
  onCancel,
}: ServiceNoteFormProps) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const endpoint =
    mode === "create"
      ? `/api/service-cases/${serviceCaseId}/notes`
      : `/api/service-cases/${serviceCaseId}/notes/${noteId}`;

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        setError("");
        startTransition(async () => {
          const response = await fetch(endpoint, {
            method: mode === "create" ? "POST" : "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ body }),
          });

          if (!response.ok) {
            const data = (await response.json()) as { message?: string };
            setError(data.message ?? "Failed to save note.");
            return;
          }

          if (mode === "create") {
            setBody("");
          } else if (onCancel) {
            onCancel();
          }

          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <label
          htmlFor={
            mode === "create"
              ? "service-note-body"
              : `service-note-body-${noteId ?? "edit"}`
          }
          className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
        >
          {mode === "create" ? "Add internal note" : "Edit note"}
        </label>
        <textarea
          id={
            mode === "create"
              ? "service-note-body"
              : `service-note-body-${noteId ?? "edit"}`
          }
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={mode === "create" ? 5 : 4}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          placeholder="Add service progress, findings, customer communication, or next actions."
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Use notes for timeline updates that should stay with the case.
        </p>
        <div className="flex flex-wrap gap-2">
          {mode === "edit" && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending
              ? mode === "create"
                ? "Saving..."
                : "Updating..."
              : mode === "create"
                ? "Add note"
                : "Save note"}
          </button>
        </div>
      </div>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </form>
  );
}
