import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { MetricStrip } from "@/components/app/metric-strip";
import { CategoryIndexList } from "@/components/app/category-index-list";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { RecentCreatedServiceCases } from "@/components/service/recent-created-service-cases";

export const dynamic = "force-dynamic";

type ServiceTasksPageProps = {
  searchParams: Promise<{
    assigneeId?: string;
    window?: string;
    completion?: string;
  }>;
};

export default async function ServiceTasksPage({
  searchParams,
}: ServiceTasksPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  if (!hasCapability(user, "service.view")) {
    return (
      <RestrictedAccess
        eyebrow="Service / Tasks"
        title="Task queue"
        description="Your role does not have access to service task views."
      />
    );
  }

  const { assigneeId = "", window = "", completion = "open" } =
    await searchParams;
  const normalizedAssigneeId = assigneeId.trim();
  const normalizedWindow = window.trim();
  const normalizedCompletion =
    completion === "all" || completion === "done" ? completion : "open";

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const nextSevenDays = new Date(endOfToday);
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);

  const [assignees, tasks, recentlyCreatedCases] = await Promise.all([
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
    db.serviceTask.findMany({
      where: {
        serviceCase: {
          organizationId: user.organizationId,
        },
        ...(normalizedAssigneeId === "unassigned"
          ? { assignedUserId: null }
          : normalizedAssigneeId === "me"
            ? { assignedUserId: user.id }
            : normalizedAssigneeId
              ? { assignedUserId: normalizedAssigneeId }
              : {}),
        ...(normalizedCompletion === "open"
          ? { isCompleted: false }
          : normalizedCompletion === "done"
            ? { isCompleted: true }
            : {}),
        ...(normalizedWindow === "overdue"
          ? {
              dueAt: {
                lt: startOfToday,
              },
              isCompleted: false,
            }
          : normalizedWindow === "today"
            ? {
                dueAt: {
                  gte: startOfToday,
                  lt: endOfToday,
                },
              }
            : normalizedWindow === "next7"
              ? {
                  dueAt: {
                    gte: endOfToday,
                    lt: nextSevenDays,
                  },
                }
              : normalizedWindow === "unscheduled"
                ? { dueAt: null }
                : {}),
      },
      orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
      include: {
        assignedUser: true,
        serviceCase: {
          include: {
            system: true,
            equipment: true,
          },
        },
        events: {
          orderBy: [{ createdAt: "desc" }],
          take: 1,
          include: {
            changedBy: true,
          },
        },
      },
    }),
    db.serviceCase.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: [{ createdAt: "desc" }],
      take: 5,
      include: {
        system: true,
        assignedUser: true,
        tasks: true,
      },
    }),
  ]);

  const overdueCount = tasks.filter(
    (task) => task.dueAt && task.dueAt < startOfToday && !task.isCompleted,
  ).length;
  const todayCount = tasks.filter(
    (task) => task.dueAt && task.dueAt >= startOfToday && task.dueAt < endOfToday,
  ).length;
  const myOpenCount = tasks.filter(
    (task) => task.assignedUserId === user.id && !task.isCompleted,
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service / Tasks"
        title="Task queue"
        description="Compact execution queue for overdue work, today's tasks, and technician-owned actions."
        actions={
          <>
            <Link
              href="/service"
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Service cases
            </Link>
            <Link
              href="/service/tasks?assigneeId=me"
              className="rounded-[var(--radius-sm)] border border-[var(--orange)] bg-[var(--orange)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--orange-dark)]"
            >
              My tasks
            </Link>
          </>
        }
      />

      <MetricStrip
        items={[
          {
            label: "Overdue",
            value: overdueCount,
            detail: "Past due and still open",
            tone: "danger",
          },
          {
            label: "Today",
            value: todayCount,
            detail: "Due in current day",
            tone: "accent",
          },
          {
            label: "My open tasks",
            value: myOpenCount,
            detail: "Assigned to current user",
            tone: "success",
          },
          {
            label: "Listed tasks",
            value: tasks.length,
            detail: "Current filtered queue",
          },
        ]}
      />

      <CategoryIndexList
        eyebrow="Task views"
        title="Queue presets"
        items={[
          {
            title: "All open tasks",
            href: "/service/tasks",
            description: "Main technician queue with the default open-task filters.",
            count: tasks.length,
            meta: "Primary queue",
          },
          {
            title: "My tasks",
            href: "/service/tasks?assigneeId=me",
            description: "Tasks currently assigned to the signed-in user.",
            count: myOpenCount,
            meta: "Personal view",
          },
          {
            title: "Overdue",
            href: "/service/tasks?window=overdue",
            description: "Tasks that should already have been completed.",
            count: overdueCount,
            meta: "Urgent",
          },
          {
            title: "Today",
            href: "/service/tasks?window=today",
            description: "Tasks scheduled for the current day.",
            count: todayCount,
            meta: "Daily plan",
          },
        ]}
      />

      <RecentCreatedServiceCases
        title="Recently created cases"
        description="Jump back into freshly created work from the task area when the case still needs more filling or follow-up changes."
        items={recentlyCreatedCases.map((item) => ({
          id: item.id,
          code: item.code,
          title: item.title,
          status: item.status,
          priority: item.priority,
          createdAtLabel: item.createdAt.toLocaleString(),
          systemCode: item.system.code,
          assigneeName: item.assignedUser?.fullName ?? null,
          taskCount: item.tasks.length,
          completedTaskCount: item.tasks.filter((task) => task.isCompleted).length,
        }))}
        actionHref="/service"
        actionLabel="Open operations"
      />

      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <form
          action="/service/tasks"
          className="grid gap-3 border-b border-[var(--border)] px-4 py-3 lg:grid-cols-[220px_220px_220px_auto_auto]"
        >
          <select
            name="assigneeId"
            defaultValue={normalizedAssigneeId}
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">All assignees</option>
            <option value="me">My tasks</option>
            <option value="unassigned">Unassigned</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.fullName}
              </option>
            ))}
          </select>

          <select
            name="window"
            defaultValue={normalizedWindow}
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">All dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="next7">Next 7 days</option>
            <option value="unscheduled">Unscheduled</option>
          </select>

          <select
            name="completion"
            defaultValue={normalizedCompletion}
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="open">Open only</option>
            <option value="done">Completed only</option>
            <option value="all">All tasks</option>
          </select>

          <button
            type="submit"
            className="rounded-[var(--radius-sm)] bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--navy-mid)]"
          >
            Apply
          </button>

          <Link
            href="/service/tasks"
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-center text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
          >
            Clear
          </Link>
        </form>

        <div className="overflow-x-auto">
          {tasks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-lg font-semibold text-slate-950">
                No tasks match this queue
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Try a different filter or return to service cases to define more work.
              </p>
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  <th className="px-6 py-4 font-semibold">Task</th>
                  <th className="px-6 py-4 font-semibold">Case</th>
                  <th className="px-6 py-4 font-semibold">Assignee</th>
                  <th className="px-6 py-4 font-semibold">Due</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Latest update</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-950">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {task.notes ?? "No execution notes"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/service/${task.serviceCase.id}`}
                        className="font-semibold text-slate-950 hover:underline"
                      >
                        {task.serviceCase.code}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {task.serviceCase.system.code}
                        {task.serviceCase.equipment
                          ? ` | ${task.serviceCase.equipment.code}`
                          : ""}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {task.assignedUser?.fullName ?? "Unassigned"}
                    </td>
                    <td className="px-6 py-4">
                      {task.dueAt ? task.dueAt.toLocaleString() : "Not scheduled"}
                    </td>
                    <td className="px-6 py-4">
                      {task.isCompleted ? "Completed" : "Open"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {task.events[0]
                        ? `${task.events[0].changedBy?.fullName ?? "System"} | ${task.events[0].createdAt.toLocaleString()}`
                        : "No history yet"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
