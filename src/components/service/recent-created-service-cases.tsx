import Link from "next/link";

type RecentCreatedServiceCaseItem = {
  id: string;
  code: string;
  title: string;
  status: string;
  priority: string;
  createdAtLabel: string;
  systemCode: string;
  assigneeName: string | null;
  taskCount: number;
  completedTaskCount: number;
};

type RecentCreatedServiceCasesProps = {
  title?: string;
  description?: string;
  items: RecentCreatedServiceCaseItem[];
  showEditAction?: boolean;
  actionHref?: string;
  actionLabel?: string;
};

function statusClasses(status: string) {
  if (status === "Done") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "In Progress") {
    return "bg-sky-100 text-sky-700";
  }

  if (status === "Planned") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-200 text-slate-700";
}

export function RecentCreatedServiceCases({
  title = "Recently created service cases",
  description = "Use these shortcuts to continue filling, review status, or reopen unfinished work.",
  items,
  showEditAction = true,
  actionHref = "/service",
  actionLabel = "Open service queue",
}: RecentCreatedServiceCasesProps) {
  const unfinishedCount = items.filter((item) => item.status !== "Done").length;

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Workflow loop
          </p>
          <h3 className="mt-1 text-base font-bold text-[var(--navy)]">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-[var(--radius-sm)] border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            Resume needed: {unfinishedCount}
          </span>
          <Link
            href={actionHref}
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
          >
            {actionLabel}
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-8 text-sm text-[var(--text-muted)]">
          No service cases have been created yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                <th className="px-5 py-4 font-semibold">Case</th>
                <th className="px-5 py-4 font-semibold">System</th>
                <th className="px-5 py-4 font-semibold">Created</th>
                <th className="px-5 py-4 font-semibold">Owner</th>
                <th className="px-5 py-4 font-semibold">Tasks</th>
                <th className="px-5 py-4 font-semibold">Priority</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Next step</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 text-sm text-slate-700">
                  <td className="px-5 py-4">
                    <Link href={`/service/${item.id}`} className="font-semibold text-slate-950 hover:underline">
                      {item.code}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{item.title}</p>
                  </td>
                  <td className="px-5 py-4">{item.systemCode}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{item.createdAtLabel}</td>
                  <td className="px-5 py-4">{item.assigneeName ?? "Unassigned"}</td>
                  <td className="px-5 py-4">
                    {item.completedTaskCount}/{item.taskCount}
                  </td>
                  <td className="px-5 py-4">{item.priority}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/service/${item.id}`}
                        className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-mid)] hover:bg-[var(--navy-pale)]"
                      >
                        View
                      </Link>
                      {showEditAction && item.status !== "Done" ? (
                        <Link
                          href={`/service/${item.id}/edit`}
                          className="rounded-[var(--radius-sm)] bg-[var(--orange)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--orange-dark)]"
                        >
                          Continue filling
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
