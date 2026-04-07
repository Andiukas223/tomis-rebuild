import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";
import { MetricStrip } from "@/components/app/metric-strip";
import { CategoryIndexList } from "@/components/app/category-index-list";
import { RestrictedAccess } from "@/components/app/restricted-access";
import {
  ReportHistoryTable,
  type DocumentHistoryReport,
} from "@/components/documents/report-history-table";

export const dynamic = "force-dynamic";

type DocumentsPageProps = {
  searchParams: Promise<{
    q?: string;
    reportType?: string;
    authorId?: string;
    workflowStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
};

function getDateWindowLabel(dateFrom: string, dateTo: string) {
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

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const user = await getServerSessionUser();

  if (!hasCapability(user, "documents.view")) {
    return (
      <RestrictedAccess
        eyebrow="Documents"
        title="Generated reports"
        description="Your role does not have access to saved document records."
      />
    );
  }

  const canOpenServiceReports = hasCapability(user, "service.reports");
  const {
    q = "",
    reportType = "",
    authorId = "",
    workflowStatus = "",
    dateFrom = "",
    dateTo = "",
  } = await searchParams;
  const normalizedQuery = q.trim();
  const normalizedReportType = reportType.trim();
  const normalizedAuthorId = authorId.trim();
  const normalizedWorkflowStatus = workflowStatus.trim();
  const normalizedDateFrom = dateFrom.trim();
  const normalizedDateTo = dateTo.trim();
  const createdAtFilter = {
    ...(normalizedDateFrom
      ? {
          gte: new Date(`${normalizedDateFrom}T00:00:00.000Z`),
        }
      : {}),
    ...(normalizedDateTo
      ? {
          lt: new Date(`${normalizedDateTo}T23:59:59.999Z`),
        }
      : {}),
  };

  const [reports, reportAuthors] = user
    ? await Promise.all([
        db.generatedReport.findMany({
          where: {
            organizationId: user.organizationId,
            ...(normalizedReportType ? { reportType: normalizedReportType } : {}),
            ...(normalizedAuthorId
              ? { createdById: normalizedAuthorId }
              : {}),
            ...(normalizedWorkflowStatus
              ? { workflowStatus: normalizedWorkflowStatus }
              : {}),
            ...(Object.keys(createdAtFilter).length > 0
              ? { createdAt: createdAtFilter }
              : {}),
            ...(normalizedQuery
              ? {
                  OR: [
                    {
                      title: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                    {
                      scopeLabel: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                    {
                      dateWindowLabel: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                    {
                      notes: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                  ],
                }
              : {}),
          },
          include: {
            createdBy: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
          take: 50,
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
    : [[], []];

  const reportsByType = reports.reduce<Record<string, number>>((acc, report) => {
    acc[report.reportType] = (acc[report.reportType] ?? 0) + 1;
    return acc;
  }, {});
  const reportsByStatus = reports.reduce<Record<string, number>>((acc, report) => {
    acc[report.workflowStatus] = (acc[report.workflowStatus] ?? 0) + 1;
    return acc;
  }, {});
  const reportsByDate = reports.reduce<Record<string, number>>((acc, report) => {
    const key = report.createdAt.toISOString().slice(0, 10);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const latestDateGroups = Object.entries(reportsByDate)
    .sort((left, right) => right[0].localeCompare(left[0]))
    .slice(0, 4);
  const latestTypeGroups = Object.entries(reportsByType).sort(
    (left, right) => right[1] - left[1],
  );
  const latestStatusGroups = Object.entries(reportsByStatus).sort(
    (left, right) => right[1] - left[1],
  );
  const windowLabel = getDateWindowLabel(
    normalizedDateFrom,
    normalizedDateTo,
  );
  const reportRows: DocumentHistoryReport[] = reports.map((report) => ({
    id: report.id,
    title: report.title,
    reportType: report.reportType,
    isPinned: report.isPinned,
    workflowStatus: report.workflowStatus,
    label: report.label,
    scopeLabel: report.scopeLabel,
    dateWindowLabel: report.dateWindowLabel,
    createdAt: report.createdAt.toISOString(),
    createdByName: report.createdBy?.fullName ?? null,
    notes: report.notes,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title="Documents"
        description="Compact history and filter view for generated report records."
        actions={
          canOpenServiceReports ? (
            <Link
              href="/service/reports"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Create service report
            </Link>
          ) : null
        }
      />

      <MetricStrip
        items={[
          {
            label: "Stored reports",
            value: reports.length,
            detail: "Records in current scope",
          },
          {
            label: "Window",
            value: windowLabel,
            detail: "Active date filter",
            tone: "accent",
          },
          {
            label: "Latest author",
            value: reports[0]?.createdBy?.fullName ?? "No records",
            detail: "Newest matching record",
          },
          {
            label: "Pinned",
            value: reports.filter((report) => report.isPinned).length,
            detail: "Important saved reports",
            tone: "warning",
          },
        ]}
      />

      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        <form
          action="/documents"
          className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_220px_220px_220px_220px_220px_auto_auto]"
        >
          <input
            type="text"
            name="q"
            defaultValue={normalizedQuery}
            placeholder="Search title, scope, note, or window"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <input
            type="text"
            name="reportType"
            defaultValue={normalizedReportType}
            placeholder="Report type"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <select
            name="authorId"
            defaultValue={normalizedAuthorId}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">All authors</option>
            {reportAuthors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.fullName}
              </option>
            ))}
          </select>
          <select
            name="workflowStatus"
            defaultValue={normalizedWorkflowStatus}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">All states</option>
            <option value="Draft">Draft</option>
            <option value="Shared">Shared</option>
            <option value="Archived">Archived</option>
          </select>
          <input
            type="date"
            name="dateFrom"
            defaultValue={normalizedDateFrom}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <input
            type="date"
            name="dateTo"
            defaultValue={normalizedDateTo}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Apply
          </button>
          <Link
            href="/documents"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Clear
          </Link>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/documents"
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            All reports
          </Link>
          <Link
            href="/documents?workflowStatus=Draft"
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Draft view
          </Link>
          <Link
            href="/documents?workflowStatus=Shared"
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Shared view
          </Link>
          <Link
            href="/documents?workflowStatus=Archived"
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Archived view
          </Link>
          <Link
            href="/documents?q=&workflowStatus=Shared&dateFrom=&dateTo="
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Shared handoff queue
          </Link>
        </div>
      </section>

      <CategoryIndexList
        eyebrow="Documents index"
        title="Saved report views"
        items={[
          {
            title: "All reports",
            href: "/documents",
            description: "Full document history across the current organization.",
            count: reports.length,
            meta: "History",
          },
          {
            title: "Draft view",
            href: "/documents?workflowStatus=Draft",
            description: "Reports still being prepared and reviewed internally.",
            count: reportsByStatus.Draft ?? 0,
            meta: "In progress",
          },
          {
            title: "Shared view",
            href: "/documents?workflowStatus=Shared",
            description: "Reports ready for handoff and broader team visibility.",
            count: reportsByStatus.Shared ?? 0,
            meta: "Published",
          },
          {
            title: "Archived view",
            href: "/documents?workflowStatus=Archived",
            description: "Historical records kept for traceability and review.",
            count: reportsByStatus.Archived ?? 0,
            meta: "Archive",
          },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Grouping
              </p>
              <h3 className="mt-1 text-base font-bold text-[var(--navy)]">
                Report history by type
              </h3>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                Quick grouping of saved report records in the current filtered view.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {latestTypeGroups.length > 0 ? (
              latestTypeGroups.map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-950">{type}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Generated report category
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-slate-950">{count}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-600">
                No grouped report types yet for the current filter set.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Grouping
              </p>
              <h3 className="mt-1 text-base font-bold text-[var(--navy)]">
                Recent generation dates
              </h3>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                Latest saved-report activity grouped by day.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {latestDateGroups.length > 0 ? (
              latestDateGroups.map(([date, count]) => (
                <div
                  key={date}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-950">{date}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Saved report records created on this date
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-slate-950">{count}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-600">
                No grouped report dates yet for the current filter set.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Grouping
              </p>
              <h3 className="mt-1 text-base font-bold text-[var(--navy)]">
                Workflow states
              </h3>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                Draft, shared, and archived distribution for the current filtered view.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {latestStatusGroups.length > 0 ? (
              latestStatusGroups.map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-950">{status}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Report workflow bucket
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-slate-950">{count}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-600">
                No workflow state groups yet for the current filter set.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Main list
            </p>
            <h3 className="mt-1 text-base font-bold text-[var(--navy)]">
              Generated document records
            </h3>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              Saved report snapshots preserve the KPI state at the time of generation.
            </p>
          </div>
          {normalizedQuery || normalizedReportType || normalizedAuthorId || normalizedDateFrom || normalizedDateTo ? (
            <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Filtered view
            </p>
          ) : null}
        </div>

        {reports.length > 0 ? (
          <ReportHistoryTable reports={reportRows} />
        ) : (
          <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-sm text-slate-600">
            No report records match the current filters. Open service reports and use
            <span className="font-medium text-slate-950"> Save report record </span>
            to create the next document snapshot, or clear the filters to review all stored history.
          </div>
        )}
      </section>
    </div>
  );
}
