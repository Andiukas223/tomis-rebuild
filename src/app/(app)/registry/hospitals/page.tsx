import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";

export const dynamic = "force-dynamic";

export default async function HospitalsPage() {
  const user = await getServerSessionUser();
  const canManage = hasCapability(user, "registry.manage");
  const hospitals = user
    ? await db.hospital.findMany({
        where: {
          organizationId: user.organizationId,
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Hospitals"
        title="Hospitals"
        description="This is the first real Registry screen in the rebuild. It turns hospitals into reusable master data instead of repeating names across systems."
        actions={
          <>
            <Link
              href="/catalog/systems"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Open linked systems
            </Link>
            {canManage ? (
              <Link
                href="/registry/hospitals/new"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                New hospital
              </Link>
            ) : null}
          </>
        }
      />

      <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Hospital registry
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            These records are now referenced directly by catalog systems.
          </p>
        </div>

        <div className="overflow-x-auto">
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
        </div>
      </section>
    </div>
  );
}
