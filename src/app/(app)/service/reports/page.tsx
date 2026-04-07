import Link from "next/link";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";
import { MetricStrip } from "@/components/app/metric-strip";
import { CategoryIndexList } from "@/components/app/category-index-list";
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
      <PageHeader
        eyebrow="Service / Reports"
        title="Service reports"
        description="Compact operational review for coverage, aging, throughput, and technician performance."
        actions={
          <>
            <Link
              href="/service"
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Back to operations
            </Link>
            <Link
              href={reportQuery ? `/service/reports/print?${reportQuery}` : "/service/reports/print"}
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Printable summary
            </Link>
            <SaveServiceReportButton filters={filters} />
            <Link
              href={reportQuery ? `/api/service-cases/export?${reportQuery}` : "/api/service-cases/export"}
              className="rounded-[var(--radius-sm)] bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--navy-mid)]"
            >
              Export CSV
            </Link>
          </>
        }
      />

      <MetricStrip
        items={[
          {
            label: "Assignment coverage",
            value: `${assignmentCoverage.toFixed(0)}%`,
            detail: "Active cases currently owned by a technician",
          },
          {
            label: "Critical unassigned",
            value: criticalUnassignedCases.length,
            detail: "High-risk cases without ownership",
            tone: "danger",
          },
          {
            label: "Avg active age",
            value: formatHours(avgActiveAgeHours),
            detail: "Mean age of live service work",
            tone: "accent",
          },
          {
            label: "Avg completion",
            value: formatHours(avgCompletionHours),
            detail: "Mean time from creation to done",
            tone: "success",
          },
        ]}
      />

      <CategoryIndexList
        eyebrow="Report views"
        title="Reporting slices"
        items={[
          {
            title: "All technicians",
            href: "/service/reports",
            description: "Full operational overview across all active service ownership.",
            count: technicianRows.length,
            meta: "Main view",
          },
          {
            title: "Unassigned focus",
            href: "/service/reports?assigneeId=unassigned",
            description: "Highlight cases that still need technician ownership.",
            count: criticalUnassignedCases.length,
            meta: "Dispatch",
          },
          {
            title: "Open work",
            href: "/service/reports?status=Open",
            description: "Filter the report to newly opened unresolved service work.",
            count: "-",
            meta: "Status",
          },
          {
            title: "Done work",
            href: "/service/reports?status=Done",
            description: "Review completed cases and completion-time trends.",
            count: "-",
            meta: "Review",
          },
        ]}
      />

      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        <form
          action="/service/reports"
          className="grid gap-3 lg:grid-cols-[220px_220px_220px_220px_auto_auto]"
        >
          <select
            name="assigneeId"
            defaultValue={filters.assigneeId}
            aria-label="Filter reports by technician"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
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
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
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
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <input
            type="date"
            name="dateTo"
            defaultValue={filters.dateTo}
            aria-label="Filter reports to date"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <button
            type="submit"
            className="rounded-[var(--radius-sm)] bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--navy-mid)]"
          >
            Apply
          </button>
          <Link
            href="/service/reports"
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-center text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
          >
            Clear
          </Link>
        </form>
      </section>

      <MetricStrip
        items={[
          {
            label: "Report scope",
            value: reportScopeLabel,
            detail: "Current technician grouping for this view",
          },
          {
            label: "Date window",
            value: windowLabel,
            detail: "Case creation range used in the KPIs",
            tone: "accent",
          },
          {
            label: "Assignment changes",
            value: avgAssignmentChangesPerCase.toFixed(1),
            detail: "Average ownership changes per case",
          },
          {
            label: "Technicians",
            value: filteredTechnicianCards.length,
            detail: "KPI groups in current view",
            tone: "success",
          },
        ]}
      />

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
