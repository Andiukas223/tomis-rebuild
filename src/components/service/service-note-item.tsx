"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ServiceNoteForm } from "@/components/service/service-note-form";

type ServiceNoteItemProps = {
  serviceCaseId: string;
  note: {
    id: string;
    body: string;
    createdAtLabel: string;
    updatedAtLabel: string;
    authorName: string;
    isEdited: boolean;
  };
};

export function ServiceNoteItem({ serviceCaseId, note }: ServiceNoteItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      {isEditing ? (
        <ServiceNoteForm
          serviceCaseId={serviceCaseId}
          mode="edit"
          noteId={note.id}
          initialBody={note.body}
          onCancel={() => {
            setError("");
            setIsEditing(false);
          }}
        />
      ) : (
        <>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {note.body}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {note.authorName}
              {" · "}
              {note.createdAtLabel}
              {note.isEdited ? ` · Edited ${note.updatedAtLabel}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  const confirmed = window.confirm(
                    "Delete this note from the service history?",
                  );

                  if (!confirmed) {
                    return;
                  }

                  setError("");
                  startTransition(async () => {
                    const response = await fetch(
                      `/api/service-cases/${serviceCaseId}/notes/${note.id}`,
                      {
                        method: "DELETE",
                        credentials: "include",
                      },
                    );

                    if (!response.ok) {
                      const data = (await response.json()) as { message?: string };
                      setError(data.message ?? "Failed to delete note.");
                      return;
                    }

                    router.refresh();
                  });
                }}
                className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
