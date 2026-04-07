import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";
import { DeleteCompanyButton } from "@/components/registry/delete-company-button";

type CompanyDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  const canManage = hasCapability(user, "registry.manage");

  const { id } = await params;

  const company = await db.company.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Companies"
        title={company.name}
        description="Company detail view for the next registry master-data entity in the rebuild."
        actions={
          <>
            <Link
              href="/registry/companies"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back to companies
            </Link>
            {canManage ? (
              <Link
                href={`/registry/companies/${company.id}/edit`}
                className="rounded-full border border-[#d6dde8] bg-[#eff5fb] px-4 py-2 text-sm font-medium text-[#0f2742] transition-colors hover:bg-[#e2edf8]"
              >
                Edit company flow
              </Link>
            ) : null}
            {canManage ? <DeleteCompanyButton id={company.id} /> : null}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Name
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {company.name}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Code
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {company.code ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            VAT code
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {company.vatCode ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            City
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {company.city ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Country
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {company.country ?? "N/A"}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Guided Intake Snapshot
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">
                Commercial registry details
              </h3>
            </div>
            <span className="rounded-full border border-[#ffe0c2] bg-[#fff5eb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#9c5b1d]">
              Prototype parity
            </span>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Address
              </p>
              <p className="mt-3 text-base font-semibold text-slate-950">
                {company.addressLine1 ?? "No primary address"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {[company.addressLine2, company.city, company.country]
                  .filter(Boolean)
                  .join(", ") || "No extra location details recorded."}
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Contact
              </p>
              <p className="mt-3 text-base font-semibold text-slate-950">
                {company.contactName ?? "No relationship owner"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {[company.contactEmail, company.contactPhone]
                  .filter(Boolean)
                  .join(" • ") || "No direct contact details recorded."}
              </p>
            </div>
          </div>
        </article>

        <aside className="rounded-[1.75rem] border border-[#d7e3f0] bg-[#edf4fb] p-6 shadow-[0_18px_45px_rgba(15,39,66,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4c6a87]">
            Commercial context
          </p>
          <p className="mt-3 text-lg font-semibold text-[#0f2742]">
            {company.website ?? "No website recorded"}
          </p>
          <p className="mt-3 text-sm leading-7 text-[#38536d]">
            Company records now keep legal, address, and relationship-owner
            data together so future documents and order workflows can reuse one
            reviewed source of truth.
          </p>
        </aside>
      </section>
    </div>
  );
}
