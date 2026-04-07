"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ServiceAttachmentUploadForm({
  serviceCaseId,
}: {
  serviceCaseId: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        const file = fileInputRef.current?.files?.[0];

        if (!file) {
          setError("Choose a file before uploading.");
          return;
        }

        setError("");
        startTransition(async () => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(
            `/api/service-cases/${serviceCaseId}/attachments`,
            {
              method: "POST",
              body: formData,
              credentials: "include",
            },
          );

          if (!response.ok) {
            const data = (await response.json()) as { message?: string };
            setError(data.message ?? "Failed to upload attachment.");
            return;
          }

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <label
          htmlFor="service-attachment-file"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
        >
          Upload attachment
        </label>
        <input
          id="service-attachment-file"
          ref={fileInputRef}
          type="file"
          className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Supported as a general file upload. Max size 10 MB.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Uploading..." : "Upload file"}
        </button>
      </div>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </form>
  );
}
