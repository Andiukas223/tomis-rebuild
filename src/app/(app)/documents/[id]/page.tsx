import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { formatHours } from "@/lib/service-reporting";

type DocumentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ServiceReportSnapshot = {
  totalCases?: number;
  activeCaseCount?: number;
  completedCaseCount?: number;
  unassignedActiveCaseCount?: number;
  criticalUnassignedCount?: number;
  doneRate?: number;
  scheduledRate?: number;
  assignmentCoverage?: number;
  avgActiveAgeHours?: number | null;
  avgCompletionHours?: number | null;
  avgAssignmentChangesPerCase?: number;
  agingBuckets?: {
    under24?: number;
    under72?: number;
    over72?: number;
  };
  technicians?: Array<{
    id: string;
    fullName: string;
    activeCount: number;
    overdueCount: number;
    completedCount: number;
    avgDoneHours: number | null;
    taskProgress: string;
  }>;
  highestRiskCases?: Array<{
    id: string;
    code: string;
    title: string;
    systemCode: string;
    priority: string;
    status: string;
    assignedTo: string | null;
  }>;
};

type ServiceReportFilters = {
  assigneeId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
};

export const dynamic = "force-dynamic";

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const user = await getServerSessionUser();
  const { id } = await params;

  const report = user
    ? await db.generatedReport.findFirst({
        where: {
          id,
          organizationId: user.organizationId,
        },
        include: {
          createdBy: {
            select: {
              fullName: true,
            },
          },
        },
      })
    : null;

  if (!report) {
    notFound();
  }

  const snapshot = report.snapshot as unknown as ServiceReportSnapshot;
  const filters = report.filters as unknown as ServiceReportFilters;
  const liveReportQuery = new URLSearchParams({
    ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  }).toString();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title={report.title}
        description="Saved operational report snapshot with the KPI state captured at generation time."
        actions={
          <>
            <Link
              href="/documents"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back to documents
            </Link>
            <Link
              href={liveReportQuery ? `/service/reports?${liveReportQuery}` : "/service/reports"}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Open live report
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Scope
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {report.scopeLabel}
          </p>
          <p className="mt-2 text-sm text-slate-600">{report.dateWindowLabel}</p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Created
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {report.createdAt.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Saved by {report.createdBy?.fullName ?? "System"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Report type
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {report.reportType}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Stored as a generated document record.
          </p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Total cases
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {snapshot.totalCases ?? 0}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Completion rate
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {snapshot.doneRate?.toFixed(0) ?? "0"}%
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Assignment coverage
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {snapshot.assignmentCoverage?.toFixed(0) ?? "0"}%
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Avg completion
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {formatHours(snapshot.avgCompletionHours ?? null)}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-semibold text-slate-950">Saved filters</h3>
          <dl className="mt-4 grid gap-4 text-sm text-slate-700">
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Technician
              </dt>
              <dd className="mt-1">{filters.assigneeId || "All technicians"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Status
              </dt>
              <dd className="mt-1">{filters.status || "All statuses"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Date range
              </dt>
              <dd className="mt-1">
                {filters.dateFrom || "Any start"} to {filters.dateTo || "Any end"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-semibold text-slate-950">Saved aging profile</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">
                Under 24h
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {snapshot.agingBuckets?.under24 ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-amber-700">
                24 to 72h
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {snapshot.agingBuckets?.under72 ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-rose-700">
                Over 72h
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {snapshot.agingBuckets?.over72 ?? 0}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <h3 className="text-lg font-semibold text-slate-950">Technician summary</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-4 py-3 font-semibold">Technician</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 font-semibold">Overdue</th>
                <th className="px-4 py-3 font-semibold">Completed</th>
                <th className="px-4 py-3 font-semibold">Avg done time</th>
                <th className="px-4 py-3 font-semibold">Task progress</th>
              </tr>
            </thead>
            <tbody>
              {(snapshot.technicians ?? []).map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 text-sm text-slate-700"
                >
                  <td className="px-4 py-3 font-medium text-slate-950">
                    {row.fullName}
                  </td>
                  <td className="px-4 py-3">{row.activeCount}</td>
                  <td className="px-4 py-3">{row.overdueCount}</td>
                  <td className="px-4 py-3">{row.completedCount}</td>
                  <td className="px-4 py-3">{formatHours(row.avgDoneHours)}</td>
                  <td className="px-4 py-3">{row.taskProgress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <h3 className="text-lg font-semibold text-slate-950">
          Highest-risk cases in saved snapshot
        </h3>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-4 py-3 font-semibold">Case</th>
                <th className="px-4 py-3 font-semibold">System</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {(snapshot.highestRiskCases ?? []).map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 text-sm text-slate-700"
                >
                  <td className="px-4 py-3 font-medium text-slate-950">
                    {item.code}
                    <p className="mt-1 text-xs text-slate-500">{item.title}</p>
                  </td>
                  <td className="px-4 py-3">{item.systemCode}</td>
                  <td className="px-4 py-3">{item.priority}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">{item.assignedTo ?? "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
