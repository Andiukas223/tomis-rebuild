"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ServiceNoteForm({ serviceCaseId }: { serviceCaseId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        setError("");
        startTransition(async () => {
          const response = await fetch(`/api/service-cases/${serviceCaseId}/notes`, {
            method: "POST",
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

          setBody("");
          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <label
          htmlFor="service-note-body"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
        >
          Add internal note
        </label>
        <textarea
          id="service-note-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={5}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          placeholder="Add service progress, findings, customer communication, or next actions."
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Use notes for timeline updates that should stay with the case.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Add note"}
        </button>
      </div>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </form>
  );
}
