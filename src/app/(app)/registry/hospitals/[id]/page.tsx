import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { DeleteHospitalButton } from "@/components/registry/delete-hospital-button";

type HospitalDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function HospitalDetailPage({
  params,
}: HospitalDetailPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  const { id } = await params;

  const hospital = await db.hospital.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      _count: {
        select: {
          systems: true,
        },
      },
      systems: {
        orderBy: [{ code: "asc" }],
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
        },
      },
    },
  });

  if (!hospital) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Hospitals"
        title={hospital.name}
        description="Hospital detail view for the first editable master-data entity in the rebuild."
        actions={
          <>
            <Link
              href="/registry/hospitals"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back to hospitals
            </Link>
            <Link
              href={`/registry/hospitals/${hospital.id}/edit`}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Edit hospital
            </Link>
            {hospital._count.systems === 0 ? (
              <DeleteHospitalButton id={hospital.id} />
            ) : (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                Remove linked systems before deleting
              </span>
            )}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Name
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {hospital.name}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Code
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {hospital.code ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            City
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {hospital.city ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Linked systems
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {hospital._count.systems}
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Linked systems
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            These systems currently reference this hospital.
          </p>
        </div>
        <div className="overflow-x-auto">
          {hospital.systems.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-600">
              This hospital is not linked to any systems yet.
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">System</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {hospital.systems.map((system) => (
                  <tr
                    key={system.id}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-950">
                      <Link href={`/catalog/systems/${system.id}`}>
                        {system.code}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/catalog/systems/${system.id}`}>
                        {system.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{system.status}</td>
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
