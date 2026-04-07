export type ServiceCaseInput = {
  code: string;
  title: string;
  summary: string | null;
  workPerformed: string | null;
  resolution: string | null;
  followUpRequired: boolean;
  followUpActions: string | null;
  status: string;
  priority: string;
  scheduledAt: string | null;
  completedAt: string | null;
  systemId: string;
  equipmentId: string | null;
  assignedUserId: string | null;
  tasks: {
    title: string;
    notes: string | null;
    isCompleted: boolean;
    sortOrder: number;
    dueAt: string | null;
    assignedUserId: string | null;
  }[];
};

export function normalizeServiceCaseInput(input: {
  code?: string;
  title?: string;
  summary?: string | null;
  workPerformed?: string | null;
  resolution?: string | null;
  followUpRequired?: boolean;
  followUpActions?: string | null;
  status?: string;
  priority?: string;
  scheduledAt?: string | null;
  completedAt?: string | null;
  systemId?: string;
  equipmentId?: string | null;
  assignedUserId?: string | null;
  tasks?: {
    title?: string;
    notes?: string | null;
    isCompleted?: boolean;
    sortOrder?: number;
    dueAt?: string | null;
    assignedUserId?: string | null;
  }[];
}): ServiceCaseInput {
  return {
    code: input.code?.trim().toUpperCase() ?? "",
    title: input.title?.trim() ?? "",
    summary: input.summary?.trim() || null,
    workPerformed: input.workPerformed?.trim() || null,
    resolution: input.resolution?.trim() || null,
    followUpRequired: Boolean(input.followUpRequired),
    followUpActions: input.followUpActions?.trim() || null,
    status: input.status?.trim() || "Open",
    priority: input.priority?.trim() || "Medium",
    scheduledAt: input.scheduledAt?.trim() || null,
    completedAt: input.completedAt?.trim() || null,
    systemId: input.systemId?.trim() ?? "",
    equipmentId: input.equipmentId?.trim() || null,
    assignedUserId: input.assignedUserId?.trim() || null,
    tasks:
      input.tasks
        ?.map((task, index) => ({
          title: task.title?.trim() ?? "",
          notes: task.notes?.trim() || null,
          isCompleted: Boolean(task.isCompleted),
          sortOrder: Number.isFinite(task.sortOrder)
            ? Number(task.sortOrder)
            : index,
          dueAt: task.dueAt?.trim() || null,
          assignedUserId: task.assignedUserId?.trim() || null,
        }))
        .filter((task) => task.title.length > 0) ?? [],
  };
}

const allowedStatuses = new Set(["Open", "Planned", "In Progress", "Done"]);
const allowedPriorities = new Set(["Low", "Medium", "High", "Critical"]);

export function validateServiceCaseInput(input: ServiceCaseInput) {
  if (!input.code) {
    return "Code is required.";
  }

  if (!input.title) {
    return "Title is required.";
  }

  if (!input.systemId) {
    return "System is required.";
  }

  if (!allowedStatuses.has(input.status)) {
    return "Status is invalid.";
  }

  if (!allowedPriorities.has(input.priority)) {
    return "Priority is invalid.";
  }

  if (input.scheduledAt && Number.isNaN(Date.parse(input.scheduledAt))) {
    return "Scheduled date is invalid.";
  }

  if (input.completedAt && Number.isNaN(Date.parse(input.completedAt))) {
    return "Completed date is invalid.";
  }

  if (input.tasks.some((task) => task.dueAt && Number.isNaN(Date.parse(task.dueAt)))) {
    return "One or more task due dates are invalid.";
  }

  if (input.followUpRequired && !input.followUpActions) {
    return "Follow-up actions are required when follow-up is marked as needed.";
  }

  if (input.tasks.some((task) => !task.title)) {
    return "Task titles cannot be empty.";
  }

  return null;
}
