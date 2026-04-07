import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
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
            <Link
              href={`/registry/companies/${company.id}/edit`}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Edit company
            </Link>
            <DeleteCompanyButton id={company.id} />
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
    </div>
  );
}
