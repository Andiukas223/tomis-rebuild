import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { PrintReportButton } from "@/components/service/print-report-button";
import {
  GeneratedReportSnapshot,
  type SavedServiceReportFilters,
  type SavedServiceReportSnapshot,
} from "@/components/documents/generated-report-snapshot";

type DocumentPrintPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function DocumentPrintPage({
  params,
}: DocumentPrintPageProps) {
  const user = await getServerSessionUser();

  if (!hasCapability(user, "documents.view")) {
    return (
      <RestrictedAccess
        eyebrow="Documents"
        title="Saved report print view"
        description="Your role does not have access to printable document records."
      />
    );
  }

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

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-8 text-slate-900 print:max-w-none print:px-0 print:py-0">
      <section className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Documents
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Saved report print view
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Printable document version of the saved operational summary snapshot.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/documents/${report.id}`}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Back to record
          </Link>
          <Link
            href={`/api/reports/${report.id}/download`}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Download HTML
          </Link>
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
                {report.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Saved {report.createdAt.toLocaleString()}
              </p>
            </div>
            <div className="grid gap-3 text-right text-sm text-slate-600">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Scope
                </p>
                <p className="mt-1 font-medium text-slate-950">
                  {report.scopeLabel}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Date window
                </p>
                <p className="mt-1 font-medium text-slate-950">
                  {report.dateWindowLabel}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Author
                </p>
                <p className="mt-1 font-medium text-slate-950">
                  {report.createdBy?.fullName ?? "System"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <GeneratedReportSnapshot
            snapshot={snapshot}
            filters={filters}
            notes={report.notes}
          />
        </div>
      </section>
    </div>
  );
}
