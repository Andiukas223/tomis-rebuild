import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { ServiceCasesTable } from "@/components/service/service-cases-table";

export const dynamic = "force-dynamic";

type ServicePageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    scheduleWindow?: string;
    systemId?: string;
    equipmentId?: string;
  }>;
};

const allowedStatuses = ["Open", "Planned", "In Progress", "Done"] as const;
const allowedPriorities = ["Low", "Medium", "High", "Critical"] as const;

export default async function ServicePage({ searchParams }: ServicePageProps) {
  const user = await getServerSessionUser();
  const {
    q = "",
    status = "all",
    priority = "all",
    assigneeId = "",
    scheduleWindow = "",
    systemId = "",
    equipmentId = "",
  } = await searchParams;
  const normalizedQuery = q.trim();
  const normalizedStatus = allowedStatuses.includes(
    status as (typeof allowedStatuses)[number],
  )
    ? status
    : "all";
  const normalizedPriority = allowedPriorities.includes(
    priority as (typeof allowedPriorities)[number],
  )
    ? priority
    : "all";
  const normalizedAssigneeId = assigneeId.trim();
  const normalizedScheduleWindow = scheduleWindow.trim();
  const normalizedSystemId = systemId.trim();
  const normalizedEquipmentId = equipmentId.trim();
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const nextSevenDays = new Date(endOfToday);
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);

  const [systemContext, equipmentContext] = user
    ? await Promise.all([
        normalizedSystemId
          ? db.system.findFirst({
              where: {
                id: normalizedSystemId,
                organizationId: user.organizationId,
              },
              select: {
                id: true,
                code: true,
                name: true,
              },
            })
          : null,
        normalizedEquipmentId
          ? db.equipment.findFirst({
              where: {
                id: normalizedEquipmentId,
                organizationId: user.organizationId,
              },
              select: {
                id: true,
                code: true,
                name: true,
                systemId: true,
              },
            })
          : null,
      ])
    : [null, null];

  const effectiveSystemId =
    equipmentContext?.systemId && !systemContext
      ? equipmentContext.systemId
      : normalizedSystemId;

  const assignees = user
    ? await db.user.findMany({
        where: {
          organizationId: user.organizationId,
          isActive: true,
        },
        orderBy: [{ fullName: "asc" }],
        select: {
          id: true,
          fullName: true,
        },
      })
    : [];

  const serviceCases = user
    ? await db.serviceCase.findMany({
        where: {
          organizationId: user.organizationId,
          ...(normalizedStatus !== "all" ? { status: normalizedStatus } : {}),
          ...(normalizedPriority !== "all"
            ? { priority: normalizedPriority }
            : {}),
          ...(normalizedAssigneeId === "unassigned"
            ? { assignedUserId: null }
            : normalizedAssigneeId
              ? { assignedUserId: normalizedAssigneeId }
              : {}),
          ...(normalizedScheduleWindow === "overdue"
            ? {
                scheduledAt: {
                  lt: startOfToday,
                },
                status: {
                  in: ["Open", "Planned", "In Progress"],
                },
              }
            : normalizedScheduleWindow === "today"
              ? {
                  scheduledAt: {
                    gte: startOfToday,
                    lt: endOfToday,
                  },
                }
              : normalizedScheduleWindow === "next7"
                ? {
                    scheduledAt: {
                      gte: endOfToday,
                      lt: nextSevenDays,
                    },
                  }
                : normalizedScheduleWindow === "unscheduled"
                  ? { scheduledAt: null }
                  : {}),
          ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
          ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
          ...(normalizedQuery
            ? {
                OR: [
                  { code: { contains: normalizedQuery, mode: "insensitive" } },
                  {
                    title: { contains: normalizedQuery, mode: "insensitive" },
                  },
                  {
                    summary: { contains: normalizedQuery, mode: "insensitive" },
                  },
                  {
                    system: {
                      code: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    equipment: {
                      code: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ updatedAt: "desc" }],
        include: {
          system: true,
          equipment: true,
          assignedUser: true,
          tasks: true,
        },
      })
    : [];

  const [totalCases, openCases, inProgressCases, criticalCases] = user
    ? await Promise.all([
        db.serviceCase.count({
          where: {
            organizationId: user.organizationId,
            ...(normalizedAssigneeId === "unassigned"
              ? { assignedUserId: null }
              : normalizedAssigneeId
                ? { assignedUserId: normalizedAssigneeId }
                : {}),
            ...(normalizedScheduleWindow === "overdue"
              ? {
                  scheduledAt: {
                    lt: startOfToday,
                  },
                  status: {
                    in: ["Open", "Planned", "In Progress"],
                  },
                }
              : normalizedScheduleWindow === "today"
                ? {
                    scheduledAt: {
                      gte: startOfToday,
                      lt: endOfToday,
                    },
                  }
                : normalizedScheduleWindow === "next7"
                  ? {
                      scheduledAt: {
                        gte: endOfToday,
                        lt: nextSevenDays,
                      },
                    }
                  : normalizedScheduleWindow === "unscheduled"
                    ? { scheduledAt: null }
                    : {}),
            ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
            ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
          },
        }),
        db.serviceCase.count({
          where: {
            organizationId: user.organizationId,
            status: "Open",
            ...(normalizedAssigneeId === "unassigned"
              ? { assignedUserId: null }
              : normalizedAssigneeId
                ? { assignedUserId: normalizedAssigneeId }
                : {}),
            ...(normalizedScheduleWindow === "overdue"
              ? {
                  scheduledAt: {
                    lt: startOfToday,
                  },
                }
              : normalizedScheduleWindow === "today"
                ? {
                    scheduledAt: {
                      gte: startOfToday,
                      lt: endOfToday,
                    },
                  }
                : normalizedScheduleWindow === "next7"
                  ? {
                      scheduledAt: {
                        gte: endOfToday,
                        lt: nextSevenDays,
                      },
                    }
                  : normalizedScheduleWindow === "unscheduled"
                    ? { scheduledAt: null }
                    : {}),
            ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
            ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
          },
        }),
        db.serviceCase.count({
          where: {
            organizationId: user.organizationId,
            status: "In Progress",
            ...(normalizedAssigneeId === "unassigned"
              ? { assignedUserId: null }
              : normalizedAssigneeId
                ? { assignedUserId: normalizedAssigneeId }
                : {}),
            ...(normalizedScheduleWindow === "overdue"
              ? {
                  scheduledAt: {
                    lt: startOfToday,
                  },
                }
              : normalizedScheduleWindow === "today"
                ? {
                    scheduledAt: {
                      gte: startOfToday,
                      lt: endOfToday,
                    },
                  }
                : normalizedScheduleWindow === "next7"
                  ? {
                      scheduledAt: {
                        gte: endOfToday,
                        lt: nextSevenDays,
                      },
                    }
                  : normalizedScheduleWindow === "unscheduled"
                    ? { scheduledAt: null }
                    : {}),
            ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
            ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
          },
        }),
        db.serviceCase.count({
          where: {
            organizationId: user.organizationId,
            priority: "Critical",
            ...(normalizedAssigneeId === "unassigned"
              ? { assignedUserId: null }
              : normalizedAssigneeId
                ? { assignedUserId: normalizedAssigneeId }
                : {}),
            ...(normalizedScheduleWindow === "overdue"
              ? {
                  scheduledAt: {
                    lt: startOfToday,
                  },
                }
              : normalizedScheduleWindow === "today"
                ? {
                    scheduledAt: {
                      gte: startOfToday,
                      lt: endOfToday,
                    },
                  }
                : normalizedScheduleWindow === "next7"
                  ? {
                      scheduledAt: {
                        gte: endOfToday,
                        lt: nextSevenDays,
                      },
                    }
                  : normalizedScheduleWindow === "unscheduled"
                    ? { scheduledAt: null }
                    : {}),
            ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
            ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
          },
        }),
      ])
    : [0, 0, 0, 0];

  const workloadSummary = assignees.map((assignee) => {
    const assignedCases = serviceCases.filter(
      (item) => item.assignedUser?.id === assignee.id,
    );

    return {
      id: assignee.id,
      fullName: assignee.fullName,
      activeCount: assignedCases.filter((item) =>
        ["Open", "Planned", "In Progress"].includes(item.status),
      ).length,
      criticalCount: assignedCases.filter(
        (item) =>
          item.priority === "Critical" &&
          ["Open", "Planned", "In Progress"].includes(item.status),
      ).length,
      completionLabel: `${assignedCases.filter((item) => item.status === "Done").length}/${assignedCases.length}`,
    };
  });

  const unassignedCount = serviceCases.filter(
    (item) => !item.assignedUserId,
  ).length;
  const overdueCount = serviceCases.filter(
    (item) =>
      item.scheduledAt &&
      item.scheduledAt < startOfToday &&
      ["Open", "Planned", "In Progress"].includes(item.status),
  ).length;
  const todayCount = serviceCases.filter(
    (item) =>
      item.scheduledAt &&
      item.scheduledAt >= startOfToday &&
      item.scheduledAt < endOfToday,
  ).length;
  const nextSevenCount = serviceCases.filter(
    (item) =>
      item.scheduledAt &&
      item.scheduledAt >= endOfToday &&
      item.scheduledAt < nextSevenDays,
  ).length;

  const contextDescription = equipmentContext
    ? `Showing service work for equipment ${equipmentContext.code} and its linked system.`
    : systemContext
      ? `Showing service work for system ${systemContext.code}.`
      : "The rebuild now has its first operational workflow: service cases connected to systems and linked equipment, ready for preventive and corrective work tracking.";

  const createHref = `/service/new?${new URLSearchParams({
    ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
    ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
  }).toString()}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service"
        title="Service operations"
        description={contextDescription}
        actions={
          <>
            <Link
              href="/service/reports"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Open reports
            </Link>
            <Link
              href={
                effectiveSystemId || equipmentContext
                  ? "/service"
                  : "/service"
              }
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Refresh
            </Link>
            <a
              href={`/api/service-cases/export?${new URLSearchParams({
                ...(normalizedQuery ? { q: normalizedQuery } : {}),
                ...(normalizedStatus !== "all"
                  ? { status: normalizedStatus }
                  : {}),
                ...(normalizedPriority !== "all"
                  ? { priority: normalizedPriority }
                  : {}),
                ...(normalizedAssigneeId
                  ? { assigneeId: normalizedAssigneeId }
                  : {}),
                ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
                ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
                ...(normalizedScheduleWindow
                  ? { scheduleWindow: normalizedScheduleWindow }
                  : {}),
              }).toString()}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Export CSV
            </a>
            <Link
              href={createHref}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              New service case
            </Link>
          </>
        }
      />

      {systemContext || equipmentContext ? (
        <section className="rounded-[1.5rem] border border-sky-100 bg-sky-50/70 px-6 py-5 text-sm text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center gap-3">
            {systemContext ? (
              <Link
                href={`/catalog/systems/${systemContext.id}`}
                className="rounded-full border border-sky-200 bg-white px-3 py-1.5 font-medium text-sky-700 hover:bg-sky-100"
              >
                System: {systemContext.code}
              </Link>
            ) : null}
            {equipmentContext ? (
              <Link
                href={`/catalog/equipment/${equipmentContext.id}`}
                className="rounded-full border border-sky-200 bg-white px-3 py-1.5 font-medium text-sky-700 hover:bg-sky-100"
              >
                Equipment: {equipmentContext.code}
              </Link>
            ) : null}
            <Link
              href="/service"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
            >
              Clear context
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Total cases
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {totalCases}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Open
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {openCases}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            In progress
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {inProgressCases}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-rose-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Critical
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {criticalCases}
          </p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-rose-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Overdue
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {overdueCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Scheduled before today and still active.
          </p>
          <Link
            href="/service?scheduleWindow=overdue"
            className="mt-4 inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
          >
            Open overdue queue
          </Link>
        </article>
        <article className="rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Today
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {todayCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Cases scheduled for the current day.
          </p>
          <Link
            href="/service?scheduleWindow=today"
            className="mt-4 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
          >
            Open today queue
          </Link>
        </article>
        <article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Next 7 days
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {nextSevenCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Upcoming scheduled visits this week.
          </p>
          <Link
            href="/service?scheduleWindow=next7"
            className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Open next 7 days
          </Link>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Technician workload
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Workload visibility helps keep assignment balanced and prevents critical cases from staying unowned.
            </p>
          </div>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            Unassigned cases: {unassignedCount}
          </span>
        </div>
        <div className="mt-4">
          <Link
            href="/service?assigneeId=unassigned"
            className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
          >
            Open unassigned queue
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workloadSummary.map((assignee) => (
            <article
              key={assignee.id}
              className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-base font-semibold text-slate-950">
                    {assignee.fullName}
                  </h4>
                  <p className="mt-1 text-sm text-slate-600">
                    Active: {assignee.activeCount}
                  </p>
                </div>
                <Link
                  href={`/service?assigneeId=${assignee.id}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  View
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Critical
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {assignee.criticalCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Done ratio
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {assignee.completionLabel}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ServiceCasesTable
        serviceCases={serviceCases.map((item) => ({
          id: item.id,
          code: item.code,
          title: item.title,
          systemId: item.system.id,
          systemCode: item.system.code,
          equipmentId: item.equipment?.id ?? null,
          equipmentCode: item.equipment?.code ?? null,
          assignedUserId: item.assignedUserId ?? null,
          assigneeName: item.assignedUser?.fullName ?? null,
          taskProgressLabel: `${item.tasks.filter((task) => task.isCompleted).length}/${item.tasks.length}`,
          priority: item.priority,
          status: item.status,
          scheduledAt: item.scheduledAt?.toISOString() ?? null,
        }))}
        filters={{
          q: normalizedQuery,
          status: normalizedStatus,
          priority: normalizedPriority,
          assigneeId: normalizedAssigneeId,
          scheduleWindow: normalizedScheduleWindow,
          systemId: effectiveSystemId,
          equipmentId: equipmentContext?.id ?? "",
        }}
        assignees={assignees}
        createHref={createHref}
      />
    </div>
  );
}
