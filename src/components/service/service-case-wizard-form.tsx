"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  ServiceCaseFormValues,
  ServiceCaseTaskFormValue,
} from "@/components/service/service-case-form";

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

type ServiceCaseWizardFormProps = {
  systems: SystemOption[];
  equipment: EquipmentOption[];
  assignees: AssigneeOption[];
  initialValues: ServiceCaseFormValues;
};

const steps = [
  {
    id: "job",
    label: "Job Info",
    description: "Core service case identity and priority.",
  },
  {
    id: "asset",
    label: "Asset Context",
    description: "System, equipment, and request summary.",
  },
  {
    id: "assignment",
    label: "Assignment",
    description: "Technician ownership and schedule timing.",
  },
  {
    id: "execution",
    label: "Execution",
    description: "Work performed, completion, and follow-up.",
  },
  {
    id: "tasks",
    label: "Task Plan",
    description: "Break the work into execution steps.",
  },
  {
    id: "review",
    label: "Review",
    description: "Final check before creating the case.",
  },
] as const;

function WizardInfo({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[4px] border border-[#c8d8ea] bg-[#eef5fb] px-4 py-3 text-[#36506b]">
      <p className="text-xs font-bold">{title}</p>
      <div className="mt-1 text-sm leading-6">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
      {children}
    </label>
  );
}

function defaultTask(assignedUserId = ""): ServiceCaseTaskFormValue {
  return {
    title: "",
    notes: "",
    isCompleted: false,
    dueAt: "",
    assignedUserId,
  };
}

export function ServiceCaseWizardForm({
  systems,
  equipment,
  assignees,
  initialValues,
}: ServiceCaseWizardFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
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

  function update<K extends keyof ServiceCaseFormValues>(
    key: K,
    value: ServiceCaseFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateTask(
    taskIndex: number,
    updater: (task: ServiceCaseTaskFormValue) => ServiceCaseTaskFormValue,
  ) {
    setValues((current) => ({
      ...current,
      tasks: current.tasks.map((task, index) =>
        index === taskIndex ? updater(task) : task,
      ),
    }));
  }

  function validateCurrentStep() {
    if (step === 0) {
      if (!values.code.trim()) {
        return "Case code is required.";
      }
      if (!values.title.trim()) {
        return "Title is required.";
      }
    }

    if (step === 1 && !values.systemId) {
      return "System is required.";
    }

    if (step === 3 && values.followUpRequired && !values.followUpActions.trim()) {
      return "Follow-up actions are required when follow-up is marked.";
    }

    if (step === 4 && values.tasks.some((task) => !task.title.trim())) {
      return "Each task needs a title before continuing.";
    }

    return null;
  }

  function nextStep() {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function submit() {
    setError("");

    startTransition(async () => {
      const response = await fetch("/api/service-cases", {
        method: "POST",
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
        setError(data.message ?? "Failed to create service case.");
        return;
      }

      const data = (await response.json()) as { serviceCase: { id: string } };
      router.push(`/service/${data.serviceCase.id}`);
      router.refresh();
    });
  }

  function reviewRows() {
    return [
      ["Code", values.code || "-"],
      ["Title", values.title || "-"],
      ["Status", values.status || "-"],
      ["Priority", values.priority || "-"],
      [
        "Technician",
        assignees.find((item) => item.id === values.assignedUserId)?.fullName ??
          "Unassigned",
      ],
      [
        "System",
        systems.find((item) => item.id === values.systemId)?.code ?? "-",
      ],
      [
        "Equipment",
        filteredEquipment.find((item) => item.id === values.equipmentId)?.code ??
          "-",
      ],
      ["Scheduled", values.scheduledAt || "-"],
      ["Follow-up", values.followUpRequired ? "Required" : "No"],
      ["Tasks", `${values.tasks.filter((task) => task.title.trim()).length}`],
    ];
  }

  const currentStep = steps[step];

  return (
    <section className="overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
      <div className="border-b border-[var(--border)] bg-[var(--dark)] px-5 py-5 text-white">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
              Guided Intake Flow
            </p>
            <h2 className="mt-2 text-2xl font-bold">Create Service Case</h2>
            <p className="mt-2 text-sm text-white/70">
              Step {step + 1} of {steps.length} - {currentStep.label}
            </p>
          </div>
          <div className="rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            {currentStep.description}
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--border)] bg-white px-5 py-4">
        <div className="flex overflow-x-auto pb-1">
          {steps.map((item, index) => {
            const isDone = index < step;
            const isActive = index === step;

            return (
              <div key={item.id} className="flex min-w-[92px] items-start gap-2">
                <div className="flex w-[64px] shrink-0 flex-col items-center">
                  <div
                    className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border text-[11px] font-bold ${
                      isDone
                        ? "border-[#1e8f53] bg-[#1e8f53] text-white"
                        : isActive
                          ? "border-[var(--orange)] bg-[var(--orange)] text-white"
                          : "border-[var(--border-mid)] bg-white text-[var(--text-muted)]"
                    }`}
                  >
                    {isDone ? "✓" : index + 1}
                  </div>
                  <p
                    className={`mt-2 text-center text-[9.5px] leading-4 ${
                      isActive
                        ? "font-bold text-[var(--orange)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
                {index < steps.length - 1 ? (
                  <div
                    className={`mt-3 h-[2px] w-7 shrink-0 ${
                      isDone ? "bg-[#1e8f53]" : "bg-[var(--border-mid)]"
                    }`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 px-5 py-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
          {step === 0 ? (
            <div className="space-y-4">
              <WizardInfo title="Entry point">
                Capture the core service job identity first, just like the prototype flow does.
              </WizardInfo>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Case code</FieldLabel>
                  <input
                    value={values.code}
                    onChange={(event) => update("code", event.target.value)}
                    className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                    placeholder="SRV-4001"
                  />
                </div>
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <select
                    value={values.status}
                    onChange={(event) => update("status", event.target.value)}
                    className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                  >
                    <option value="Open">Open</option>
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
              <div>
                <FieldLabel>Title</FieldLabel>
                <input
                  value={values.title}
                  onChange={(event) => update("title", event.target.value)}
                  className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                  placeholder="Quarterly preventive maintenance"
                />
              </div>
              <div>
                <FieldLabel>Priority</FieldLabel>
                <select
                  value={values.priority}
                  onChange={(event) => update("priority", event.target.value)}
                  className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <WizardInfo title="Asset context">
                Attach the request to the correct system and optional equipment before scheduling work.
              </WizardInfo>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>System</FieldLabel>
                  <select
                    value={values.systemId}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        systemId: event.target.value,
                        equipmentId:
                          equipment.find((item) => item.id === current.equipmentId)
                            ?.systemId === event.target.value
                            ? current.equipmentId
                            : "",
                      }))
                    }
                    className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                  >
                    <option value="">Select system</option>
                    {systems.map((system) => (
                      <option key={system.id} value={system.id}>
                        {system.code} - {system.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Equipment</FieldLabel>
                  <select
                    value={values.equipmentId}
                    onChange={(event) => update("equipmentId", event.target.value)}
                    className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                  >
                    <option value="">No specific equipment</option>
                    {filteredEquipment.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} - {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <FieldLabel>Summary</FieldLabel>
                <textarea
                  value={values.summary}
                  onChange={(event) => update("summary", event.target.value)}
                  rows={5}
                  className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                  placeholder="Describe the service request, visit, or maintenance scope."
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <WizardInfo title="Assignment">
                Define who owns the case and when the work is expected to happen.
              </WizardInfo>
              <div>
                <FieldLabel>Assigned technician</FieldLabel>
                <select
                  value={values.assignedUserId}
                  onChange={(event) => update("assignedUserId", event.target.value)}
                  className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.fullName} - {assignee.role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Scheduled date</FieldLabel>
                <input
                  type="datetime-local"
                  value={values.scheduledAt}
                  onChange={(event) => update("scheduledAt", event.target.value)}
                  className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <WizardInfo title="Execution details">
                Record work performed and decide whether this case already needs completion or follow-up planning.
              </WizardInfo>
              <div>
                <FieldLabel>Work performed</FieldLabel>
                <textarea
                  value={values.workPerformed}
                  onChange={(event) => update("workPerformed", event.target.value)}
                  rows={4}
                  className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <FieldLabel>Resolution</FieldLabel>
                <textarea
                  value={values.resolution}
                  onChange={(event) => update("resolution", event.target.value)}
                  rows={4}
                  className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                />
              </div>
              {values.status === "Done" ? (
                <div>
                  <FieldLabel>Completed date</FieldLabel>
                  <input
                    type="datetime-local"
                    value={values.completedAt}
                    onChange={(event) => update("completedAt", event.target.value)}
                    className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                  />
                </div>
              ) : null}
              <label className="flex items-center gap-3 rounded-[4px] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]">
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
                  className="h-4 w-4"
                />
                Follow-up visit or monitoring is required
              </label>
              {values.followUpRequired ? (
                <div>
                  <FieldLabel>Follow-up actions</FieldLabel>
                  <textarea
                    value={values.followUpActions}
                    onChange={(event) =>
                      update("followUpActions", event.target.value)
                    }
                    rows={3}
                    className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <WizardInfo title="Task plan">
                Define the execution checklist so the case is easier to deliver consistently.
              </WizardInfo>
              <div className="space-y-3">
                {values.tasks.map((task, index) => (
                  <div
                    key={`${index}-${task.title}`}
                    className="rounded-[4px] border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_220px_220px_auto]">
                      <input
                        value={task.title}
                        onChange={(event) =>
                          updateTask(index, (current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                        placeholder={`Task ${index + 1}`}
                      />
                      <select
                        value={task.assignedUserId}
                        onChange={(event) =>
                          updateTask(index, (current) => ({
                            ...current,
                            assignedUserId: event.target.value,
                          }))
                        }
                        className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
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
                          updateTask(index, (current) => ({
                            ...current,
                            dueAt: event.target.value,
                          }))
                        }
                        className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setValues((current) => ({
                            ...current,
                            tasks: current.tasks.filter(
                              (_, taskIndex) => taskIndex !== index,
                            ),
                          }))
                        }
                        className="rounded-[var(--radius-sm)] border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={task.notes}
                      onChange={(event) =>
                        updateTask(index, (current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      rows={3}
                      className="mt-3 w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm"
                      placeholder="Execution notes, technician instructions, or parts."
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    tasks: [...current.tasks, defaultTask(current.assignedUserId)],
                  }))
                }
                className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
              >
                Add task
              </button>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-4">
              <WizardInfo title="Ready to create">
                Review the main service case values before saving the record.
              </WizardInfo>
              <div className="overflow-hidden rounded-[4px] border border-[var(--border)]">
                {reviewRows().map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-[180px_minmax(0,1fr)] border-b border-[var(--border)] px-4 py-3 text-sm last:border-b-0"
                  >
                    <p className="font-semibold text-[var(--text-mid)]">{key}</p>
                    <p className="font-mono text-[var(--foreground)]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[var(--radius-lg)] border border-[#d7e3f0] bg-[#edf4fb] px-5 py-5 shadow-[0_18px_35px_rgba(15,39,66,0.08)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4c6a87]">
              View Process Flow
            </p>
            <p className="mt-2 text-sm font-semibold text-[#0f2742]">
              Service case Guided Intake Flow
            </p>
            <p className="mt-2 text-sm leading-6 text-[#38536d]">
              This wizard follows the same step-by-step pattern as the service job modal, but saves directly into the real service case API.
            </p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white px-5 py-5 shadow-[var(--shadow-soft)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Navigation
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(current - 1, 0))}
                disabled={step === 0}
                className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <span className="text-sm text-[var(--text-muted)]">
                {step + 1} / {steps.length}
              </span>
              {step === steps.length - 1 ? (
                <button
                  type="button"
                  onClick={submit}
                  disabled={isPending}
                  className="rounded-[var(--radius-sm)] bg-[var(--orange)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--orange-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Creating..." : "Create case"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="rounded-[var(--radius-sm)] bg-[var(--orange)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--orange-dark)]"
                >
                  Continue
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-3 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Cancel
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
