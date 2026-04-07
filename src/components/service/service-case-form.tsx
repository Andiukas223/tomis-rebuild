"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type ServiceCaseTaskFormValue = {
  title: string;
  notes: string;
  isCompleted: boolean;
  dueAt: string;
  assignedUserId: string;
};

export type ServiceCaseFormValues = {
  code: string;
  title: string;
  summary: string;
  workPerformed: string;
  resolution: string;
  followUpRequired: boolean;
  followUpActions: string;
  status: string;
  priority: string;
  scheduledAt: string;
  completedAt: string;
  systemId: string;
  equipmentId: string;
  assignedUserId: string;
  tasks: ServiceCaseTaskFormValue[];
};

type SystemOption = {
  id: string;
  code: string;
  name: string;
};

type EquipmentOption = {
  id: string;
  code: string;
  name: string;
  systemId: string | null;
};

type AssigneeOption = {
  id: string;
  fullName: string;
  role: string;
};

type ServiceCaseFormProps = {
  mode: "create" | "edit";
  serviceCaseId?: string;
  systems: SystemOption[];
  equipment: EquipmentOption[];
  assignees: AssigneeOption[];
  initialValues?: ServiceCaseFormValues;
};

const defaultValues: ServiceCaseFormValues = {
  code: "",
  title: "",
  summary: "",
  workPerformed: "",
  resolution: "",
  followUpRequired: false,
  followUpActions: "",
  status: "Open",
  priority: "Medium",
  scheduledAt: "",
  completedAt: "",
  systemId: "",
  equipmentId: "",
  assignedUserId: "",
  tasks: [
    {
      title: "Review issue and confirm scope",
      notes: "",
      isCompleted: false,
      dueAt: "",
      assignedUserId: "",
    },
    {
      title: "Perform technical work",
      notes: "",
      isCompleted: false,
      dueAt: "",
      assignedUserId: "",
    },
    {
      title: "Update service notes and close case",
      notes: "",
      isCompleted: false,
      dueAt: "",
      assignedUserId: "",
    },
  ],
};

export function ServiceCaseForm({
  mode,
  serviceCaseId,
  systems,
  equipment,
  assignees,
  initialValues = defaultValues,
}: ServiceCaseFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ServiceCaseFormValues>(initialValues);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredEquipment = useMemo(
    () =>
      values.systemId
        ? equipment.filter(
            (item) =>
              item.systemId === values.systemId || item.id === values.equipmentId,
          )
        : equipment,
    [equipment, values.equipmentId, values.systemId],
  );

  const endpoint =
    mode === "create" ? "/api/service-cases" : `/api/service-cases/${serviceCaseId}`;
  const method = mode === "create" ? "POST" : "PATCH";

  return (
    <form
      className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");

        startTransition(async () => {
          const response = await fetch(endpoint, {
            method,
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
              body: JSON.stringify({
                ...values,
                tasks: values.tasks.map((task, index) => ({
                  ...task,
                  sortOrder: index,
              })),
            }),
          });

          if (!response.ok) {
            const data = (await response.json()) as { message?: string };
            setError(data.message ?? "Failed to save service case.");
            return;
          }

          const data = (await response.json()) as { serviceCase: { id: string } };
          router.push(`/service/${data.serviceCase.id}`);
          router.refresh();
        });
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Case code</span>
          <input
            value={values.code}
            onChange={(event) =>
              setValues((current) => ({ ...current, code: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="SRV-4001"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({ ...current, status: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="Open">Open</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            value={values.title}
            onChange={(event) =>
              setValues((current) => ({ ...current, title: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="Quarterly preventive maintenance"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Priority</span>
          <select
            value={values.priority}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                priority: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Assigned technician
          </span>
          <select
            value={values.assignedUserId}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                assignedUserId: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">Unassigned</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.fullName} · {assignee.role}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Scheduled date
          </span>
          <input
            type="datetime-local"
            value={values.scheduledAt}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                scheduledAt: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">System</span>
          <select
            value={values.systemId}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                systemId: event.target.value,
                equipmentId:
                  equipment.find((item) => item.id === current.equipmentId)?.systemId ===
                  event.target.value
                    ? current.equipmentId
                    : "",
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">Select system</option>
            {systems.map((system) => (
              <option key={system.id} value={system.id}>
                {system.code} · {system.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Equipment</span>
          <select
            value={values.equipmentId}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                equipmentId: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">No specific equipment</option>
            {filteredEquipment.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} · {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Completed date
          </span>
          <input
            type="datetime-local"
            value={values.completedAt}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                completedAt: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Summary</span>
          <textarea
            value={values.summary}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                summary: event.target.value,
              }))
            }
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="Describe the service request, visit, or maintenance scope."
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">
            Work performed
          </span>
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
            placeholder="Record the diagnostic, maintenance, or repair steps completed."
          />
        </label>

        <label className="space-y-2 md:col-span-2">
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
            placeholder="Describe the final outcome, root cause, or completion result."
          />
        </label>

        <div className="space-y-3 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">
            Completion follow-up
          </span>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={values.followUpRequired}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  followUpRequired: event.target.checked,
                  followUpActions: event.target.checked
                    ? current.followUpActions
                    : "",
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
      </div>

      <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-950">
              Task checklist
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Break the case into clear execution steps for the assigned technician.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setValues((current) => ({
                ...current,
                tasks: [
                  ...current.tasks,
                  {
                    title: "",
                    notes: "",
                    isCompleted: false,
                    dueAt: "",
                    assignedUserId: current.assignedUserId,
                  },
                ],
              }))
            }
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Add task
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {values.tasks.map((task, index) => (
            <div
              key={`${index}-${task.title}`}
              className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1.4fr)_220px_220px_auto] md:items-start">
                <label className="flex items-center gap-2 pt-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        tasks: current.tasks.map((item, taskIndex) =>
                          taskIndex === index
                            ? { ...item, isCompleted: event.target.checked }
                            : item,
                        ),
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Done
                </label>
                <input
                  value={task.title}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      tasks: current.tasks.map((item, taskIndex) =>
                        taskIndex === index
                          ? { ...item, title: event.target.value }
                          : item,
                      ),
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                  placeholder={`Task ${index + 1}`}
                />
                <select
                  value={task.assignedUserId}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      tasks: current.tasks.map((item, taskIndex) =>
                        taskIndex === index
                          ? { ...item, assignedUserId: event.target.value }
                          : item,
                      ),
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
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
                  value={task.dueAt}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      tasks: current.tasks.map((item, taskIndex) =>
                        taskIndex === index
                          ? { ...item, dueAt: event.target.value }
                          : item,
                      ),
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() =>
                    setValues((current) => ({
                      ...current,
                      tasks: current.tasks.filter((_, taskIndex) => taskIndex !== index),
                    }))
                  }
                  className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
              <textarea
                value={task.notes}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    tasks: current.tasks.map((item, taskIndex) =>
                      taskIndex === index
                        ? { ...item, notes: event.target.value }
                        : item,
                    ),
                  }))
                }
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                placeholder="Execution notes, parts needed, or technician instructions."
              />
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create service case"
              : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
