import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const user = await getServerSessionUser();

  const companies = user
    ? await db.company.findMany({
        where: {
          organizationId: user.organizationId,
        },
        orderBy: [{ name: "asc" }],
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Companies"
        title="Companies"
        description="Companies are the next real Registry slice. This module establishes the reusable pattern for customer and partner master data."
        actions={
          <Link
            href="/registry/companies/new"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            New company
          </Link>
        }
      />

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

        <div className="overflow-x-auto">
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
                      <Link
                        href={`/registry/companies/${company.id}/edit`}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                    </div>
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
