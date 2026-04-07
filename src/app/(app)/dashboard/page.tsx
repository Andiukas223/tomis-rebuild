import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { MetricStrip } from "@/components/app/metric-strip";
import { CategoryIndexList } from "@/components/app/category-index-list";
import { AssignSuggestedTechnicianButton } from "@/components/service/assign-suggested-technician-button";
import { navigationGroups } from "@/lib/navigation";
import { getNavigationGroupsForRole, hasCapability } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getServerSessionUser();
  const visibleGroups = getNavigationGroupsForRole(user, navigationGroups);
  const canManageService = hasCapability(user, "service.manage");
  const canDispatchService = hasCapability(user, "service.dispatch");

  const [
    systemsCount,
    equipmentCount,
    openServiceCount,
    criticalServiceCount,
    recentServiceCases,
    activeServiceCases,
    upcomingScheduledCases,
    serviceUsers,
  ] = user
    ? await Promise.all([
        db.system.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
        db.equipment.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
        db.serviceCase.count({
          where: {
            organizationId: user.organizationId,
            status: {
              in: ["Open", "Planned", "In Progress"],
            },
          },
        }),
        db.serviceCase.count({
          where: {
            organizationId: user.organizationId,
            priority: "Critical",
            status: {
              in: ["Open", "Planned", "In Progress"],
            },
          },
        }),
        db.serviceCase.findMany({
          where: {
            organizationId: user.organizationId,
          },
          orderBy: [{ updatedAt: "desc" }],
          take: 5,
          include: {
            system: true,
            equipment: true,
            assignedUser: true,
            tasks: true,
          },
        }),
        db.serviceCase.findMany({
          where: {
            organizationId: user.organizationId,
            status: {
              in: ["Open", "Planned", "In Progress"],
            },
          },
          include: {
            assignedUser: true,
            tasks: true,
          },
        }),
        db.serviceCase.findMany({
          where: {
            organizationId: user.organizationId,
            status: {
              in: ["Open", "Planned", "In Progress"],
            },
            scheduledAt: {
              not: null,
            },
          },
          orderBy: [{ scheduledAt: "asc" }],
          take: 5,
          include: {
            system: true,
            assignedUser: true,
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
      ])
    : [0, 0, 0, 0, [], [], [], []];

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const workloadRows = serviceUsers.map((serviceUser) => {
    const assignedCases = activeServiceCases.filter(
      (item) => item.assignedUser?.id === serviceUser.id,
    );

    return {
      id: serviceUser.id,
      fullName: serviceUser.fullName,
      activeCount: assignedCases.filter((item) =>
        ["Open", "Planned", "In Progress"].includes(item.status),
      ).length,
      criticalCount: assignedCases.filter(
        (item) =>
          item.priority === "Critical" &&
          ["Open", "Planned", "In Progress"].includes(item.status),
      ).length,
      taskCompletion: `${assignedCases.reduce(
        (sum, item) => sum + item.tasks.filter((task) => task.isCompleted).length,
        0,
      )}/${assignedCases.reduce((sum, item) => sum + item.tasks.length, 0)}`,
      overdueCount: assignedCases.filter(
        (item) => item.scheduledAt && item.scheduledAt < startOfToday,
      ).length,
    };
  });

  const unassignedRecentCount = recentServiceCases.filter(
    (item) => !item.assignedUserId,
  ).length;
  const unassignedActiveCases = activeServiceCases.filter(
    (item) => !item.assignedUserId,
  );
  const criticalUnassignedCount = unassignedActiveCases.filter(
    (item) => item.priority === "Critical",
  ).length;
  const overdueScheduledCount = activeServiceCases.filter(
    (item) => item.scheduledAt && item.scheduledAt < startOfToday,
  ).length;
  const todayScheduledCount = activeServiceCases.filter(
    (item) =>
      item.scheduledAt &&
      item.scheduledAt >= startOfToday &&
      item.scheduledAt < endOfToday,
  ).length;
  const overloadedTechnicians = workloadRows
    .filter((row) => row.activeCount >= 3 || row.overdueCount > 0)
    .sort((left, right) => {
      if (right.overdueCount !== left.overdueCount) {
        return right.overdueCount - left.overdueCount;
      }

      return right.activeCount - left.activeCount;
    });
  const balancedTechnicians = workloadRows
    .filter((row) => row.activeCount < 3 && row.overdueCount === 0)
    .sort((left, right) => left.activeCount - right.activeCount);
  const nextDispatchCandidate = balancedTechnicians[0] ?? workloadRows[0] ?? null;
  const dispatchPriorityCase = [...unassignedActiveCases].sort((left, right) => {
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

    const leftTime = left.scheduledAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const rightTime = right.scheduledAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime;
  })[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Protected area"
        title="Dashboard"
        description="Compact launch point for current workload, service pressure, and module indexes."
        actions={
          <>
            <Link
              href="/service"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Open service
            </Link>
            <Link
              href="/service/tasks"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Open task queue
            </Link>
            {canManageService ? (
              <Link
                href="/service/new"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                New service case
              </Link>
            ) : null}
          </>
        }
      />

      <MetricStrip
        items={[
          {
            label: "Systems",
            value: systemsCount,
            detail: "Tracked installed systems",
          },
          {
            label: "Equipment",
            value: equipmentCount,
            detail: "Technical asset records",
          },
          {
            label: "Active service",
            value: openServiceCount,
            detail: "Open, planned, in progress",
            tone: "accent",
          },
          {
            label: "Critical",
            value: criticalServiceCount,
            detail: "Need front-page visibility",
            tone: "danger",
          },
        ]}
      />

      <CategoryIndexList
        eyebrow="Dashboard index"
        title="Main operating views"
        items={[
          {
            title: "Service queue",
            href: "/service",
            description: "Primary indexed list of active service cases and filters.",
            count: openServiceCount,
            meta: "Operations",
          },
          {
            title: "Task queue",
            href: "/service/tasks",
            description: "Technician execution queue with due dates and task history.",
            count: activeServiceCases.reduce(
              (sum, item) => sum + item.tasks.length,
              0,
            ),
            meta: "Execution",
          },
          {
            title: "Reports",
            href: "/service/reports",
            description: "Operational metrics, dispatch review, and exports.",
            count: "-",
            meta: "Review",
          },
          {
            title: "Documents",
            href: "/documents",
            description: "Saved report records and generated document history.",
            count: "-",
            meta: "History",
          },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Service index
              </p>
              <h3 className="mt-1 text-base font-bold text-[var(--navy)]">
                Recent service activity
              </h3>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                The latest operational work linked to systems and equipment.
              </p>
            </div>
            <Link
              href="/service"
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Open service
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentServiceCases.length === 0 ? (
              <div className="px-6 py-10 text-sm text-slate-600">
                No service activity yet.
              </div>
            ) : (
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-6 py-4 font-semibold">Case</th>
                    <th className="px-6 py-4 font-semibold">System</th>
                    <th className="px-6 py-4 font-semibold">Equipment</th>
                    <th className="px-6 py-4 font-semibold">Technician</th>
                    <th className="px-6 py-4 font-semibold">Tasks</th>
                    <th className="px-6 py-4 font-semibold">Priority</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentServiceCases.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 text-sm text-slate-700"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-950">
                        <Link href={`/service/${item.id}`}>{item.code}</Link>
                        <p className="mt-1 font-normal text-slate-600">
                          {item.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/catalog/systems/${item.system.id}`}>
                          {item.system.code}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {item.equipment ? (
                          <Link href={`/catalog/equipment/${item.equipment.id}`}>
                            {item.equipment.code}
                          </Link>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.assignedUser?.fullName ?? "Unassigned"}
                      </td>
                      <td className="px-6 py-4">
                        {item.tasks.filter((task) => task.isCompleted).length}/
                        {item.tasks.length}
                      </td>
                      <td className="px-6 py-4">{item.priority}</td>
                      <td className="px-6 py-4">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="grid gap-4">
          <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Workload
                </p>
                <h3 className="mt-1 text-base font-bold text-[var(--navy)]">
                  Technician planning
                </h3>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                  A quick view of who owns active service work right now and where unassigned cases still need attention.
                </p>
              </div>
              <Link
                href="/service"
                className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
              >
                Open queue
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/service?scheduleWindow=overdue"
                  className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm transition hover:bg-rose-100"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-rose-700">
                    Overdue
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {overdueScheduledCount}
                  </p>
                </Link>
                <Link
                  href="/service?scheduleWindow=today"
                  className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm transition hover:bg-sky-100"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-sky-700">
                    Today
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {todayScheduledCount}
                  </p>
                </Link>
              </div>
              <Link
                href="/service?assigneeId=unassigned"
                className="block rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
              >
                Unassigned recent cases: {unassignedRecentCount}
              </Link>
              <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Dispatch
                    </p>
                    <h4 className="mt-2 text-base font-semibold text-slate-950">
                      Next assignment focus
                    </h4>
                  </div>
                  <Link
                    href="/service?assigneeId=unassigned"
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Open queue
                  </Link>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-amber-700">
                      Critical unassigned
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {criticalUnassignedCount}
                    </p>
                    <p className="mt-2 text-xs text-slate-600">
                      Active cases still waiting for an owner.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-rose-700">
                      Overloaded techs
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {overloadedTechnicians.length}
                    </p>
                    <p className="mt-2 text-xs text-slate-600">
                      Team members above the current planning threshold.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Suggested next technician
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {nextDispatchCandidate
                        ? nextDispatchCandidate.fullName
                        : "No technician available"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {nextDispatchCandidate
                        ? `Active ${nextDispatchCandidate.activeCount} - Overdue ${nextDispatchCandidate.overdueCount}`
                        : "Add service users to begin balancing assignments."}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Top unassigned case
                    </p>
                    {dispatchPriorityCase ? (
                      <>
                        <Link
                          href={`/service/${dispatchPriorityCase.id}`}
                          className="mt-2 block text-sm font-semibold text-slate-950 hover:underline"
                        >
                          {dispatchPriorityCase.code}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">
                          {dispatchPriorityCase.priority} priority
                          {dispatchPriorityCase.scheduledAt
                            ? ` - ${dispatchPriorityCase.scheduledAt.toLocaleString()}`
                            : " - unscheduled"}
                        </p>
                        {nextDispatchCandidate && canDispatchService ? (
                          <div className="mt-3">
                            <AssignSuggestedTechnicianButton
                              serviceCaseId={dispatchPriorityCase.id}
                              technicianId={nextDispatchCandidate.id}
                              technicianName={nextDispatchCandidate.fullName}
                              compact
                            />
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">
                        No active unassigned cases right now.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {workloadRows.map((row) => (
                <div key={row.id} className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {row.fullName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Active {row.activeCount} - Critical {row.criticalCount}
                      </p>
                    </div>
                    <Link
                      href={`/service?assigneeId=${row.id}`}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      View
                    </Link>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Active task completion: {row.taskCompletion}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Overdue assigned: {row.overdueCount}
                  </p>
                  <Link
                    href={`/service/tasks?assigneeId=${row.id}`}
                    className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Open task queue
                  </Link>
                  {row.activeCount >= 3 || row.overdueCount > 0 ? (
                    <p className="mt-3 inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-700">
                      Dispatch attention needed
                    </p>
                  ) : (
                    <p className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                      Capacity available
                    </p>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Schedule
                </p>
                <h3 className="mt-1 text-base font-bold text-[var(--navy)]">
                  Upcoming visits
                </h3>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                  The next scheduled service work, ordered by due date.
                </p>
              </div>
              <Link
                href="/service?scheduleWindow=next7"
                className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
              >
                View week
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {upcomingScheduledCases.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                  No scheduled visits in the active queue yet.
                </p>
              ) : (
                upcomingScheduledCases.map((item) => (
                  <div key={item.id} className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Link
                          href={`/service/${item.id}`}
                          className="text-sm font-semibold text-slate-950 hover:underline"
                        >
                          {item.code}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.system.code}
                          {" - "}
                          {item.assignedUser?.fullName ?? "Unassigned"}
                        </p>
                      </div>
                      <p className="text-xs font-medium text-slate-600">
                        {item.scheduledAt?.toLocaleString() ?? "N/A"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          {visibleGroups.map((group) => (
            <article key={group.label} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Module
                  </p>
                  <h3 className="mt-1 text-base font-bold text-[var(--navy)]">
                    {group.label}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                    {group.description}
                  </p>
                </div>
                <Link
                  href={group.href}
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
                >
                  Open
                </Link>
              </div>

              {group.children?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-semibold text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </section>
    </div>
  );
}
