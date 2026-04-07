"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ServiceTaskHistoryList } from "@/components/service/service-task-history-list";

type AssigneeOption = {
  id: string;
  fullName: string;
};

type ServiceTaskExecutionCardProps = {
  task: {
    id: string;
    title: string;
    notes: string;
    isCompleted: boolean;
    dueAt: string;
    assignedUserId: string;
    assignedUserName: string | null;
    completedAtLabel: string | null;
    events: Array<{
      id: string;
      eventType: string;
      createdAtLabel: string;
      changedByName: string | null;
      previousAssigneeName: string | null;
      newAssigneeName: string | null;
      previousCompleted: boolean | null;
      newCompleted: boolean | null;
    }>;
  };
  assignees: AssigneeOption[];
  canManage: boolean;
};

function formatDateTimeLocal(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function ServiceTaskExecutionCard({
  task,
  assignees,
  canManage,
}: ServiceTaskExecutionCardProps) {
  const router = useRouter();
  const [values, setValues] = useState({
    title: task.title,
    notes: task.notes,
    isCompleted: task.isCompleted,
    dueAt: formatDateTimeLocal(task.dueAt),
    assignedUserId: task.assignedUserId,
  });
  const [error, setError] = useState("");
  const [savedState, setSavedState] = useState("");
  const [isPending, startTransition] = useTransition();

  const isDirty =
    values.title !== task.title ||
    values.notes !== task.notes ||
    values.isCompleted !== task.isCompleted ||
    values.dueAt !== formatDateTimeLocal(task.dueAt) ||
    values.assignedUserId !== task.assignedUserId;

  const save = () => {
    setError("");
    setSavedState("");

    startTransition(async () => {
      const response = await fetch(`/api/service-tasks/${task.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setError(data.message ?? "Failed to update task.");
        return;
      }

      setSavedState("Saved");
      router.refresh();
    });
  };

  const dueDate = task.dueAt ? new Date(task.dueAt) : null;
  const hasDueDate = Boolean(dueDate);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Execution task
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {values.title || "Untitled task"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasDueDate && !values.isCompleted ? (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700">
              Scheduled
            </span>
          ) : null}
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-medium ${
              values.isCompleted
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {values.isCompleted ? "Completed" : "Open"}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.2fr)_220px_220px]">
        <input
          value={values.title}
          disabled={!canManage || isPending}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-100"
          placeholder="Task title"
        />
        <select
          value={values.assignedUserId}
          disabled={!canManage || isPending}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              assignedUserId: event.target.value,
            }))
          }
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="">Unassigned</option>
          {assignees.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.fullName}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={values.dueAt}
          disabled={!canManage || isPending}
          onChange={(event) =>
            setValues((current) => ({ ...current, dueAt: event.target.value }))
          }
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>

      <textarea
        value={values.notes}
        disabled={!canManage || isPending}
        onChange={(event) =>
          setValues((current) => ({ ...current, notes: event.target.value }))
        }
        rows={3}
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-100"
        placeholder="Execution notes, blockers, parts required, or technician guidance."
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>
            Assignee: {task.assignedUserName ?? "Unassigned"}
          </span>
          <span>
            Due: {task.dueAt ? new Date(task.dueAt).toLocaleString() : "Not scheduled"}
          </span>
          <span>
            {task.completedAtLabel ? `Completed ${task.completedAtLabel}` : "Not completed"}
          </span>
        </div>

        {canManage ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={values.isCompleted}
                disabled={isPending}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    isCompleted: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              Mark done
            </label>
            <button
              type="button"
              disabled={!isDirty || isPending}
              onClick={save}
              className="rounded-full bg-slate-950 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isPending ? "Saving..." : "Save task"}
            </button>
          </div>
        ) : null}
      </div>

      {savedState ? <p className="mt-2 text-xs text-emerald-700">{savedState}</p> : null}
      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}

      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Task history
        </p>
        <div className="mt-3">
          <ServiceTaskHistoryList events={task.events} />
        </div>
      </div>
    </div>
  );
}
