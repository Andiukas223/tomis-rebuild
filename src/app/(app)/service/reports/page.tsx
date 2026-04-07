import Link from "next/link";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";
import { SaveServiceReportButton } from "@/components/service/save-service-report-button";
import {
  buildServiceReportQuery,
  formatHours,
  getServiceReportData,
  normalizeServiceReportFilters,
} from "@/lib/service-reporting";

export const dynamic = "force-dynamic";

type ServiceReportsPageProps = {
  searchParams: Promise<{
    assigneeId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }>;
};

export default async function ServiceReportsPage({
  searchParams,
}: ServiceReportsPageProps) {
  const user = await getServerSessionUser();
  const canViewReports = hasCapability(user, "service.reports");

  if (!canViewReports) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Service"
          title="Reports are not available for your role"
          description="Service reporting is currently limited to coordinator and administrator roles in the rebuild."
          actions={
            <Link
              href="/service"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Back to service
            </Link>
          }
        />
      </div>
    );
  }

  const filters = normalizeServiceReportFilters(await searchParams);
  const {
    serviceUsers,
    technicianRows,
    highestRiskCases,
    criticalUnassignedCases,
    agingBuckets,
    avgActiveAgeHours,
    avgCompletionHours,
    assignmentCoverage,
    avgAssignmentChangesPerCase,
    filteredTechnicianCards,
    reportScopeLabel,
    windowLabel,
  } = await getServiceReportData(user, filters);
  const reportQuery = buildServiceReportQuery(filters);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <form
          action="/service/reports"
          className="grid gap-4 lg:grid-cols-[220px_220px_220px_220px_auto_auto]"
        >
          <select
            name="assigneeId"
            defaultValue={filters.assigneeId}
            aria-label="Filter reports by technician"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">All technicians</option>
            <option value="unassigned">Unassigned</option>
            {serviceUsers.map((serviceUser) => (
              <option key={serviceUser.id} value={serviceUser.id}>
                {serviceUser.fullName}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={filters.status}
            aria-label="Filter reports by status"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">All statuses</option>
            <option value="Open">Open</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <input
            type="date"
            name="dateFrom"
            defaultValue={filters.dateFrom}
            aria-label="Filter reports from date"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <input
            type="date"
            name="dateTo"
            defaultValue={filters.dateTo}
            aria-label="Filter reports to date"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Apply
          </button>
          <Link
            href="/service/reports"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Clear
          </Link>
        </form>
      </section>

      <PageHeader
        eyebrow="Service"
        title="Service reports"
        description="Operational reporting for aging, coverage, throughput, and technician performance."
        actions={
          <>
            <Link
              href="/service"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back to operations
            </Link>
            <Link
              href={reportQuery ? `/service/reports/print?${reportQuery}` : "/service/reports/print"}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Printable summary
            </Link>
            <SaveServiceReportButton filters={filters} />
            <Link
              href={reportQuery ? `/api/service-cases/export?${reportQuery}` : "/api/service-cases/export"}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Export CSV
            </Link>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Report scope
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {reportScopeLabel}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Current technician grouping for this report view.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Date window
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {windowLabel}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Case creation range used for the current KPI grouping.
          </p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Assignment coverage
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {assignmentCoverage.toFixed(0)}%
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Active cases currently owned by a technician.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-amber-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Critical unassigned
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {criticalUnassignedCases.length}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            High-risk cases still waiting for ownership.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Avg active age
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {formatHours(avgActiveAgeHours)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Mean age of open, planned, and in-progress cases.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Avg completion time
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {formatHours(avgCompletionHours)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Mean time from case creation to done state.
          </p>
        </article>
      </section>

      {filteredTechnicianCards.length > 0 ? (
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Technician KPI groups
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Snapshot cards grouped by technician for the current filter window.
              </p>
            </div>
            <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {filteredTechnicianCards.length} technicians in view
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTechnicianCards.map((row) => (
              <article
                key={row.id}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-slate-950">
                      {row.fullName}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Filtered KPI group
                    </p>
                  </div>
                  <Link
                    href={`/service/reports?${new URLSearchParams({
                      assigneeId: row.id,
                      ...(filters.status ? { status: filters.status } : {}),
                      ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
                      ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
                    }).toString()}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Focus
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Active
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">
                      {row.activeCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Completed
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">
                      {row.completedCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Overdue
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">
                      {row.overdueCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Avg done time
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">
                      {formatHours(row.avgDoneHours)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Task progress in active cases: {row.taskProgress}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Aging buckets
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Active workload grouped by time since case creation.
              </p>
            </div>
            <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Avg assignment changes: {avgAssignmentChangesPerCase.toFixed(1)}
            </p>
          </div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">
                Under 24 hours
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {agingBuckets.under24}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-amber-700">
                24 to 72 hours
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {agingBuckets.under72}
              </p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-rose-700">
                Over 72 hours
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {agingBuckets.over72}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Technician performance
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Current load, overdue pressure, completion throughput, and task progress by technician.
              </p>
            </div>
            <Link
              href="/service"
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Open queue
            </Link>
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
                {technicianRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-4 py-3 font-medium text-slate-950">
                      <Link href={`/service?assigneeId=${row.id}`}>
                        {row.fullName}
                      </Link>
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
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Highest risk active cases
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Priority-ranked active work for fast operational review.
            </p>
          </div>
          <Link
            href="/service?priority=Critical"
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Open critical queue
          </Link>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-4 py-3 font-semibold">Case</th>
                <th className="px-4 py-3 font-semibold">System</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Assigned</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {highestRiskCases.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 text-sm text-slate-700"
                >
                  <td className="px-4 py-3 font-medium text-slate-950">
                    <Link href={`/service/${item.id}`}>{item.code}</Link>
                    <p className="mt-1 text-xs text-slate-500">{item.title}</p>
                  </td>
                  <td className="px-4 py-3">{item.system.code}</td>
                  <td className="px-4 py-3">{item.priority}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">{item.createdAt.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {item.assignedUser?.fullName ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/service/${item.id}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
