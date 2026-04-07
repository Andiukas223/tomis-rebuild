"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ServiceCaseCompletionFormProps = {
  serviceCaseId: string;
  initialValues: {
    workPerformed: string;
    resolution: string;
    followUpRequired: boolean;
    followUpActions: string;
  };
};

export function ServiceCaseCompletionForm({
  serviceCaseId,
  initialValues,
}: ServiceCaseCompletionFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");

        startTransition(async () => {
          const response = await fetch(
            `/api/service-cases/${serviceCaseId}/completion`,
            {
              method: "PATCH",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(values),
            },
          );

          if (!response.ok) {
            const data = (await response.json()) as { message?: string };
            setError(data.message ?? "Failed to save service completion details.");
            return;
          }

          router.refresh();
        });
      }}
    >
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Work performed</span>
        <textarea
          value={values.workPerformed}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              workPerformed: event.target.value,
            }))
          }
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          placeholder="Record the technical steps completed during this case."
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Resolution</span>
        <textarea
          value={values.resolution}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              resolution: event.target.value,
            }))
          }
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          placeholder="Describe the outcome, root cause, or closure result."
        />
      </label>

      <div className="space-y-3">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={values.followUpRequired}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                followUpRequired: event.target.checked,
                followUpActions: event.target.checked ? current.followUpActions : "",
              }))
            }
            className="h-4 w-4 rounded border-slate-300"
          />
          Follow-up visit or monitoring is required
        </label>

        <textarea
          value={values.followUpActions}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              followUpActions: event.target.value,
            }))
          }
          rows={3}
          disabled={!values.followUpRequired}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
          placeholder="Describe the next visit, monitoring step, or escalation action."
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "Saving..." : "Save completion record"}
        </button>
      </div>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}
