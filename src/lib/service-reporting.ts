import { db } from "@/lib/db";

export type ServiceReportFilters = {
  assigneeId: string;
  dateFrom: string;
  dateTo: string;
  status: string;
};

type ServiceReportUser = {
  organizationId: string;
};

export function normalizeServiceReportFilters(input: {
  assigneeId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}): ServiceReportFilters {
  return {
    assigneeId: input.assigneeId?.trim() ?? "",
    dateFrom: input.dateFrom?.trim() ?? "",
    dateTo: input.dateTo?.trim() ?? "",
    status: input.status?.trim() ?? "",
  };
}

export function buildServiceReportQuery(filters: ServiceReportFilters) {
  return new URLSearchParams({
    ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  }).toString();
}

function getHoursBetween(start: Date, end: Date) {
  return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
}

export function formatHours(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return `${value.toFixed(1)} h`;
}

export function getWindowLabel(dateFrom: string, dateTo: string) {
  if (dateFrom && dateTo) {
    return `${dateFrom} to ${dateTo}`;
  }

  if (dateFrom) {
    return `From ${dateFrom}`;
  }

  if (dateTo) {
    return `Until ${dateTo}`;
  }

  return "All time";
}

export async function getServiceReportData(
  user: ServiceReportUser | null,
  filters: ServiceReportFilters,
) {
  if (!user) {
    return {
      serviceCases: [],
      serviceUsers: [],
      technicianRows: [],
      highestRiskCases: [],
      activeCases: [],
      completedCases: [],
      criticalUnassignedCases: [],
      agingBuckets: {
        under24: 0,
        under72: 0,
        over72: 0,
      },
      avgActiveAgeHours: null,
      avgCompletionHours: null,
      assignmentCoverage: 0,
      avgAssignmentChangesPerCase: 0,
      filteredTechnicianCards: [],
      selectedTechnician: null,
      reportScopeLabel: "All technicians",
      windowLabel: getWindowLabel(filters.dateFrom, filters.dateTo),
      totalCases: 0,
      doneRate: 0,
      scheduledRate: 0,
      unassignedActiveCases: [],
    };
  }

  const createdAtFilter = {
    ...(filters.dateFrom
      ? {
          gte: new Date(`${filters.dateFrom}T00:00:00.000Z`),
        }
      : {}),
    ...(filters.dateTo
      ? {
          lt: new Date(`${filters.dateTo}T23:59:59.999Z`),
        }
      : {}),
  };
  const serviceCaseWhere = {
    organizationId: user.organizationId,
    ...(filters.assigneeId === "unassigned"
      ? { assignedUserId: null }
      : filters.assigneeId
        ? { assignedUserId: filters.assigneeId }
        : {}),
    ...(filters.status && filters.status !== "all"
      ? { status: filters.status }
      : {}),
    ...(Object.keys(createdAtFilter).length > 0
      ? { createdAt: createdAtFilter }
      : {}),
  };

  const [serviceCases, assignmentEvents, serviceUsers] = await Promise.all([
    db.serviceCase.findMany({
      where: serviceCaseWhere,
      include: {
        system: true,
        assignedUser: true,
        tasks: true,
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    db.serviceAssignmentEvent.findMany({
      where: {
        serviceCase: serviceCaseWhere,
      },
      select: {
        id: true,
        serviceCaseId: true,
        createdAt: true,
      },
    }),
    db.user.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      orderBy: [{ fullName: "asc" }],
      select: {
        id: true,
        fullName: true,
      },
    }),
  ]);

  const now = new Date();
  const activeCases = serviceCases.filter((item) =>
    ["Open", "Planned", "In Progress"].includes(item.status),
  );
  const completedCases = serviceCases.filter(
    (item) => item.status === "Done" && item.completedAt,
  );
  const assignedActiveCases = activeCases.filter((item) => item.assignedUserId);
  const unassignedActiveCases = activeCases.filter((item) => !item.assignedUserId);
  const criticalUnassignedCases = unassignedActiveCases.filter(
    (item) => item.priority === "Critical",
  );

  const agingBuckets = {
    under24: activeCases.filter(
      (item) => getHoursBetween(item.createdAt, now) < 24,
    ).length,
    under72: activeCases.filter((item) => {
      const hours = getHoursBetween(item.createdAt, now);
      return hours >= 24 && hours < 72;
    }).length,
    over72: activeCases.filter(
      (item) => getHoursBetween(item.createdAt, now) >= 72,
    ).length,
  };

  const avgActiveAgeHours =
    activeCases.length > 0
      ? activeCases.reduce(
          (sum, item) => sum + getHoursBetween(item.createdAt, now),
          0,
        ) / activeCases.length
      : null;

  const avgCompletionHours =
    completedCases.length > 0
      ? completedCases.reduce((sum, item) => {
          return sum + getHoursBetween(item.createdAt, item.completedAt!);
        }, 0) / completedCases.length
      : null;

  const assignmentCoverage =
    activeCases.length > 0
      ? (assignedActiveCases.length / activeCases.length) * 100
      : 0;

  const assignmentEventCountByCase = new Map<string, number>();
  for (const event of assignmentEvents) {
    assignmentEventCountByCase.set(
      event.serviceCaseId,
      (assignmentEventCountByCase.get(event.serviceCaseId) ?? 0) + 1,
    );
  }

  const avgAssignmentChangesPerCase =
    serviceCases.length > 0
      ? serviceCases.reduce(
          (sum, item) => sum + (assignmentEventCountByCase.get(item.id) ?? 0),
          0,
        ) / serviceCases.length
      : 0;

  const technicianRows = serviceUsers.map((serviceUser) => {
    const assignedCases = serviceCases.filter(
      (item) => item.assignedUserId === serviceUser.id,
    );
    const assignedActive = assignedCases.filter((item) =>
      ["Open", "Planned", "In Progress"].includes(item.status),
    );
    const assignedDone = assignedCases.filter(
      (item) => item.status === "Done" && item.completedAt,
    );

    const avgDoneHours =
      assignedDone.length > 0
        ? assignedDone.reduce((sum, item) => {
            return sum + getHoursBetween(item.createdAt, item.completedAt!);
          }, 0) / assignedDone.length
        : null;

    return {
      id: serviceUser.id,
      fullName: serviceUser.fullName,
      activeCount: assignedActive.length,
      overdueCount: assignedActive.filter(
        (item) => item.scheduledAt && item.scheduledAt < now,
      ).length,
      completedCount: assignedDone.length,
      avgDoneHours,
      taskProgress:
        assignedActive.length > 0
          ? `${assignedActive.reduce(
              (sum, item) =>
                sum + item.tasks.filter((task) => task.isCompleted).length,
              0,
            )}/${assignedActive.reduce((sum, item) => sum + item.tasks.length, 0)}`
          : "0/0",
    };
  });

  const highestRiskCases = [...activeCases]
    .sort((left, right) => {
      const priorityRank = {
        Critical: 4,
        High: 3,
        Medium: 2,
        Low: 1,
      } as const;

      const priorityDiff =
        priorityRank[right.priority as keyof typeof priorityRank] -
        priorityRank[left.priority as keyof typeof priorityRank];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return right.createdAt.getTime() - left.createdAt.getTime();
    })
    .slice(0, 8);

  const filteredTechnicianCards = technicianRows
    .filter((row) =>
      filters.assigneeId === "unassigned"
        ? false
        : filters.assigneeId
          ? row.id === filters.assigneeId
          : row.activeCount > 0 || row.completedCount > 0,
    )
    .sort((left, right) => {
      if (right.activeCount !== left.activeCount) {
        return right.activeCount - left.activeCount;
      }

      return right.completedCount - left.completedCount;
    });

  const selectedTechnician =
    filters.assigneeId && filters.assigneeId !== "unassigned"
      ? serviceUsers.find((item) => item.id === filters.assigneeId) ?? null
      : null;

  const reportScopeLabel =
    filters.assigneeId === "unassigned"
      ? "Unassigned cases only"
      : selectedTechnician
        ? selectedTechnician.fullName
        : "All technicians";

  const totalCases = serviceCases.length;
  const doneRate = totalCases > 0 ? (completedCases.length / totalCases) * 100 : 0;
  const scheduledRate =
    activeCases.length > 0
      ? (activeCases.filter((item) => item.scheduledAt).length / activeCases.length) *
        100
      : 0;

  return {
    serviceCases,
    serviceUsers,
    technicianRows,
    highestRiskCases,
    activeCases,
    completedCases,
    criticalUnassignedCases,
    agingBuckets,
    avgActiveAgeHours,
    avgCompletionHours,
    assignmentCoverage,
    avgAssignmentChangesPerCase,
    filteredTechnicianCards,
    selectedTechnician,
    reportScopeLabel,
    windowLabel: getWindowLabel(filters.dateFrom, filters.dateTo),
    totalCases,
    doneRate,
    scheduledRate,
    unassignedActiveCases,
  };
}

export function createServiceReportSnapshot(report: Awaited<ReturnType<typeof getServiceReportData>>) {
  return {
    totalCases: report.totalCases,
    activeCaseCount: report.activeCases.length,
    completedCaseCount: report.completedCases.length,
    unassignedActiveCaseCount: report.unassignedActiveCases.length,
    criticalUnassignedCount: report.criticalUnassignedCases.length,
    doneRate: Number(report.doneRate.toFixed(1)),
    scheduledRate: Number(report.scheduledRate.toFixed(1)),
    assignmentCoverage: Number(report.assignmentCoverage.toFixed(1)),
    avgActiveAgeHours:
      report.avgActiveAgeHours === null
        ? null
        : Number(report.avgActiveAgeHours.toFixed(1)),
    avgCompletionHours:
      report.avgCompletionHours === null
        ? null
        : Number(report.avgCompletionHours.toFixed(1)),
    avgAssignmentChangesPerCase: Number(
      report.avgAssignmentChangesPerCase.toFixed(1),
    ),
    agingBuckets: report.agingBuckets,
    technicians: report.technicianRows.map((row) => ({
      id: row.id,
      fullName: row.fullName,
      activeCount: row.activeCount,
      overdueCount: row.overdueCount,
      completedCount: row.completedCount,
      avgDoneHours:
        row.avgDoneHours === null ? null : Number(row.avgDoneHours.toFixed(1)),
      taskProgress: row.taskProgress,
    })),
    highestRiskCases: report.highestRiskCases.map((item) => ({
      id: item.id,
      code: item.code,
      title: item.title,
      systemCode: item.system.code,
      priority: item.priority,
      status: item.status,
      assignedTo: item.assignedUser?.fullName ?? null,
    })),
  };
}
