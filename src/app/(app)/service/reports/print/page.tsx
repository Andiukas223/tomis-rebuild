import Link from "next/link";
import { getServerSessionUser } from "@/lib/server-session";
import { PrintReportButton } from "@/components/service/print-report-button";
import { SaveServiceReportButton } from "@/components/service/save-service-report-button";
import {
  buildServiceReportQuery,
  formatHours,
  getServiceReportData,
  normalizeServiceReportFilters,
} from "@/lib/service-reporting";

export const dynamic = "force-dynamic";

type ServicePrintPageProps = {
  searchParams: Promise<{
    assigneeId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }>;
};

export default async function ServicePrintPage({
  searchParams,
}: ServicePrintPageProps) {
  const user = await getServerSessionUser();
  const filters = normalizeServiceReportFilters(await searchParams);
  const report = await getServiceReportData(user, filters);
  const reportQuery = buildServiceReportQuery(filters);
  const generatedAt = new Date();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-8 text-slate-900 print:max-w-none print:px-0 print:py-0">
      <section className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Service
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Printable operational summary
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Use this view for weekly reviews, technician handoffs, and stakeholder updates.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={reportQuery ? `/service/reports?${reportQuery}` : "/service/reports"}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Back to reports
          </Link>
          <SaveServiceReportButton filters={filters} />
          <PrintReportButton />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] print:rounded-none print:border-none print:p-0 print:shadow-none">
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Tomis Rebuild
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Service operational summary
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Generated {generatedAt.toLocaleString()}
              </p>
            </div>
            <div className="grid gap-3 text-right text-sm text-slate-600">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Scope
                </p>
                <p className="mt-1 font-medium text-slate-950">
                  {report.reportScopeLabel}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Date window
                </p>
                <p className="mt-1 font-medium text-slate-950">
                  {report.windowLabel}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Total cases
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {report.totalCases}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Cases included in this reporting window.
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Completion rate
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {report.doneRate.toFixed(0)}%
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Share of cases already completed.
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Assignment coverage
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {report.assignmentCoverage.toFixed(0)}%
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Active cases with a technician assigned.
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Scheduled active work
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {report.scheduledRate.toFixed(0)}%
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Active cases with a planned visit date.
            </p>
          </article>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-950">
              Risk and aging
            </h3>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-amber-700">
                  Critical unassigned
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {report.criticalUnassignedCases.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Avg active age
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {formatHours(report.avgActiveAgeHours)}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">
                    Under 24h
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {report.agingBuckets.under24}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-amber-700">
                    24 to 72h
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {report.agingBuckets.under72}
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-rose-700">
                    Over 72h
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {report.agingBuckets.over72}
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-950">
              Throughput and control
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Avg completion time
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {formatHours(report.avgCompletionHours)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Avg assignment changes
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {report.avgAssignmentChangesPerCase.toFixed(1)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Active cases
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {report.activeCases.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Unassigned active
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {report.unassignedActiveCases.length}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Technician summary
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Filter-aware technician view for workload and throughput.
              </p>
            </div>
            <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {report.filteredTechnicianCards.length || report.technicianRows.length} technicians
            </p>
          </div>
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
                {(report.filteredTechnicianCards.length > 0
                  ? report.filteredTechnicianCards
                  : report.technicianRows
                ).map((row) => (
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

        <section className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Highest-risk active cases
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
                {report.highestRiskCases.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {item.code}
                      <p className="mt-1 text-xs text-slate-500">{item.title}</p>
                    </td>
                    <td className="px-4 py-3">{item.system.code}</td>
                    <td className="px-4 py-3">{item.priority}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">
                      {item.assignedUser?.fullName ?? "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  );
}
