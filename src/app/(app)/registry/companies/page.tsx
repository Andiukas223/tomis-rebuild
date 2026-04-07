import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";

export const dynamic = "force-dynamic";

type CompaniesPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function CompaniesPage({
  searchParams,
}: CompaniesPageProps) {
  const user = await getServerSessionUser();
  const canManage = hasCapability(user, "registry.manage");
  const { q = "" } = await searchParams;
  const normalizedQuery = q.trim();

  const companies = user
    ? await db.company.findMany({
        where: {
          organizationId: user.organizationId,
          ...(normalizedQuery
            ? {
                OR: [
                  { name: { contains: normalizedQuery, mode: "insensitive" } },
                  { code: { contains: normalizedQuery, mode: "insensitive" } },
                  {
                    vatCode: {
                      contains: normalizedQuery,
                      mode: "insensitive",
                    },
                  },
                  { city: { contains: normalizedQuery, mode: "insensitive" } },
                  {
                    contactName: {
                      contains: normalizedQuery,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ name: "asc" }],
      })
    : [];

  const [totalCompanies, countriesRepresented] = user
    ? await Promise.all([
        db.company.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
        db.company.findMany({
          where: {
            organizationId: user.organizationId,
            country: {
              not: null,
            },
          },
          select: {
            country: true,
          },
          distinct: ["country"],
        }),
      ])
    : [0, []];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Companies"
        title="Companies"
        description="Companies are the next real Registry slice. This module establishes the reusable pattern for customer and partner master data."
        actions={
          <>
            <Link
              href="/registry/companies/new"
              className="rounded-full border border-[#d6dde8] bg-[#eff5fb] px-4 py-2 text-sm font-medium text-[#0f2742] transition-colors hover:bg-[#e2edf8]"
            >
              View process flow
            </Link>
            {canManage ? (
              <Link
                href="/registry/companies/new"
                className="rounded-full bg-[#ff8b2b] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,139,43,0.24)] transition-colors hover:bg-[#f27c1c]"
              >
                + New company
              </Link>
            ) : null}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Companies
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {totalCompanies}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Countries represented
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {countriesRepresented.length}
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Company registry
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            These records will support future sales, service, and document
            workflows.
          </p>
        </div>

        <form
          action="/registry/companies"
          className="grid gap-4 border-b border-slate-200 px-6 py-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]"
        >
          <input
            aria-label="Search companies"
            name="q"
            defaultValue={normalizedQuery}
            placeholder="Search by name, code, VAT code, city, or contact..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
          />
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Apply
          </button>
          <Link
            href="/registry/companies"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Clear
          </Link>
        </form>

        <div className="overflow-x-auto">
          {companies.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-lg font-semibold text-slate-950">
                No companies match this view
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Try changing the search or add a new company to expand the
                registry.
              </p>
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">City</th>
                  <th className="px-6 py-4 font-semibold">Country</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-950">
                      <Link href={`/registry/companies/${company.id}`}>
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{company.code ?? "N/A"}</td>
                    <td className="px-6 py-4">{company.city ?? "N/A"}</td>
                    <td className="px-6 py-4">{company.country ?? "N/A"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/registry/companies/${company.id}`}
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </Link>
                        {canManage ? (
                          <Link
                            href={`/registry/companies/${company.id}/edit`}
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
