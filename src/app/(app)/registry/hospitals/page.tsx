import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";

export const dynamic = "force-dynamic";

type HospitalsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function HospitalsPage({
  searchParams,
}: HospitalsPageProps) {
  const user = await getServerSessionUser();
  const canManage = hasCapability(user, "registry.manage");
  const { q = "" } = await searchParams;
  const normalizedQuery = q.trim();
  const hospitals = user
    ? await db.hospital.findMany({
        where: {
          organizationId: user.organizationId,
          ...(normalizedQuery
            ? {
                OR: [
                  { name: { contains: normalizedQuery, mode: "insensitive" } },
                  { code: { contains: normalizedQuery, mode: "insensitive" } },
                  { city: { contains: normalizedQuery, mode: "insensitive" } },
                  {
                    serviceRegion: {
                      contains: normalizedQuery,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ name: "asc" }],
        include: {
          _count: {
            select: {
              systems: true,
            },
          },
        },
      })
    : [];

  const [totalHospitals, linkedSystems] = user
    ? await Promise.all([
        db.hospital.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
        db.system.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
      ])
    : [0, 0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Hospitals"
        title="Hospitals"
        description="This is the first real Registry screen in the rebuild. It turns hospitals into reusable master data instead of repeating names across systems."
        actions={
          <>
            <Link
              href="/registry/hospitals/new"
              className="rounded-full border border-[#d6dde8] bg-[#eff5fb] px-4 py-2 text-sm font-medium text-[#0f2742] transition-colors hover:bg-[#e2edf8]"
            >
              View process flow
            </Link>
            <Link
              href="/catalog/systems"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Open linked systems
            </Link>
            {canManage ? (
              <Link
                href="/registry/hospitals/new"
                className="rounded-full bg-[#ff8b2b] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,139,43,0.24)] transition-colors hover:bg-[#f27c1c]"
              >
                + New hospital
              </Link>
            ) : null}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Hospitals
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {totalHospitals}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Linked systems
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {linkedSystems}
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Hospital registry
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            These records are now referenced directly by catalog systems.
          </p>
        </div>

        <form
          action="/registry/hospitals"
          className="grid gap-4 border-b border-slate-200 px-6 py-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]"
        >
          <input
            aria-label="Search hospitals"
            name="q"
            defaultValue={normalizedQuery}
            placeholder="Search by name, code, city, or service region..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
          />
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Apply
          </button>
          <Link
            href="/registry/hospitals"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Clear
          </Link>
        </form>

        <div className="overflow-x-auto">
          {hospitals.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-lg font-semibold text-slate-950">
                No hospitals match this view
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Try changing the search or add a new hospital to expand the
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
                  <th className="px-6 py-4 font-semibold">Linked systems</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map((hospital) => (
                  <tr
                    key={hospital.id}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-950">
                      <Link href={`/registry/hospitals/${hospital.id}`}>
                        {hospital.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{hospital.code ?? "N/A"}</td>
                    <td className="px-6 py-4">{hospital.city ?? "N/A"}</td>
                    <td className="px-6 py-4">{hospital._count.systems}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/registry/hospitals/${hospital.id}`}
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </Link>
                        {canManage ? (
                          <Link
                            href={`/registry/hospitals/${hospital.id}/edit`}
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
