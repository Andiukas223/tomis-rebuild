export type ServiceCaseInput = {
  code: string;
  title: string;
  summary: string | null;
  status: string;
  priority: string;
  scheduledAt: string | null;
  completedAt: string | null;
  systemId: string;
  equipmentId: string | null;
  assignedUserId: string | null;
  tasks: {
    title: string;
    isCompleted: boolean;
    sortOrder: number;
  }[];
};

export function normalizeServiceCaseInput(input: {
  code?: string;
  title?: string;
  summary?: string | null;
  status?: string;
  priority?: string;
  scheduledAt?: string | null;
  completedAt?: string | null;
  systemId?: string;
  equipmentId?: string | null;
  assignedUserId?: string | null;
  tasks?: {
    title?: string;
    isCompleted?: boolean;
    sortOrder?: number;
  }[];
}): ServiceCaseInput {
  return {
    code: input.code?.trim().toUpperCase() ?? "",
    title: input.title?.trim() ?? "",
    summary: input.summary?.trim() || null,
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
          isCompleted: Boolean(task.isCompleted),
          sortOrder: Number.isFinite(task.sortOrder)
            ? Number(task.sortOrder)
            : index,
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

  if (input.tasks.some((task) => !task.title)) {
    return "Task titles cannot be empty.";
  }

  return null;
}
