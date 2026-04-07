import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { DeleteReportButton } from "@/components/documents/delete-report-button";
import {
  GeneratedReportSnapshot,
  type SavedServiceReportFilters,
  type SavedServiceReportSnapshot,
} from "@/components/documents/generated-report-snapshot";
import { ReportMetadataForm } from "@/components/documents/report-metadata-form";
import { ToggleReportPinButton } from "@/components/documents/toggle-report-pin-button";

type DocumentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const user = await getServerSessionUser();

  if (!hasCapability(user, "documents.view")) {
    return (
      <RestrictedAccess
        eyebrow="Documents"
        title="Report detail"
        description="Your role does not have access to saved document records."
      />
    );
  }

  const canManageDocuments = hasCapability(user, "documents.manage");
  const canViewLiveReports = hasCapability(user, "service.reports");
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

  const snapshot = report.snapshot as unknown as SavedServiceReportSnapshot;
  const filters = report.filters as unknown as SavedServiceReportFilters;
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
            {canManageDocuments ? (
              <ToggleReportPinButton
                reportId={report.id}
                isPinned={report.isPinned}
              />
            ) : null}
            <Link
              href="/documents"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back to documents
            </Link>
            {canViewLiveReports ? (
              <Link
                href={liveReportQuery ? `/service/reports?${liveReportQuery}` : "/service/reports"}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Open live report
              </Link>
            ) : null}
            <Link
              href={`/documents/${report.id}/print`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Printable document
            </Link>
            <Link
              href={`/api/reports/${report.id}/download`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Download HTML
            </Link>
            {canManageDocuments ? (
              <DeleteReportButton reportId={report.id} />
            ) : null}
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
            {report.isPinned
              ? "Pinned generated document record."
              : "Stored as a generated document record."}
          </p>
        </article>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <ReportMetadataForm
          reportId={report.id}
          initialStatus={report.workflowStatus}
          initialLabel={report.label}
        />
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Workflow state
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {report.workflowStatus}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {report.label ? `Label: ${report.label}` : "No label assigned yet."}
          </p>
        </article>
      </section>
      <GeneratedReportSnapshot
        snapshot={snapshot}
        filters={filters}
        notes={report.notes}
      />
    </div>
  );
}
