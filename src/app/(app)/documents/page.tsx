import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await getServerSessionUser();

  const reports = user
    ? await db.generatedReport.findMany({
        where: {
          organizationId: user.organizationId,
        },
        include: {
          createdBy: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: 20,
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title="Generated reports"
        description="Stored operational summaries and generated document records available for review and reuse."
        actions={
          <Link
            href="/service/reports"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Create service report
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Stored reports
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {reports.length}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Most recent report records available in this workspace.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Latest type
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {reports[0]?.reportType ?? "No reports yet"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            First generated document flow currently tracks service operational summaries.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Latest author
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {reports[0]?.createdBy?.fullName ?? "No records"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Generated reports keep an author trail for later review.
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Generated document records
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Saved report snapshots preserve the KPI state at the time of generation.
            </p>
          </div>
        </div>

        {reports.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Scope</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Author</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {report.title}
                    </td>
                    <td className="px-4 py-3">{report.reportType}</td>
                    <td className="px-4 py-3">
                      <p>{report.scopeLabel}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {report.dateWindowLabel}
                      </p>
                    </td>
                    <td className="px-4 py-3">{report.createdAt.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {report.createdBy?.fullName ?? "System"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/documents/${report.id}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-sm text-slate-600">
            No report records have been saved yet. Open service reports and use
            <span className="font-medium text-slate-950"> Save report record </span>
            to create the first document snapshot.
          </div>
        )}
      </section>
    </div>
  );
}
