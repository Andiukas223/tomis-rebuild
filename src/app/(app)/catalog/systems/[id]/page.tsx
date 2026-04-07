import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";

type SystemDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SystemDetailPage({
  params,
}: SystemDetailPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  const { id } = await params;

  const system = await db.system.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      hospital: true,
      equipment: {
        orderBy: [{ code: "asc" }],
        include: {
          manufacturer: true,
        },
      },
      serviceCases: {
        orderBy: [{ updatedAt: "desc" }],
        include: {
          equipment: true,
        },
      },
    },
  });

  if (!system) {
    notFound();
  }

  const canManageCatalog = hasCapability(user, "catalog.manage");
  const canManageService = hasCapability(user, "service.manage");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Systems"
        title={system.name}
        description="System detail view for the first real CRUD module in the rebuild."
        actions={
          <>
            <Link
              href="/catalog/systems"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back to systems
            </Link>
            {canManageCatalog ? (
              <Link
                href={`/catalog/systems/${system.id}/edit`}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Edit system
              </Link>
            ) : null}
            <Link
              href={`/service?systemId=${system.id}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              View service
            </Link>
            {canManageService ? (
              <Link
                href={`/service/new?systemId=${system.id}`}
                className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500"
              >
                New service case
              </Link>
            ) : null}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Code
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {system.code}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Status
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {system.status}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Serial number
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {system.serialNumber ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Hospital
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {system.hospital.name}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Linked equipment
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {system.equipment.length}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Service cases
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {system.serviceCases.length}
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Linked equipment
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Equipment currently attached to this installed system.
            </p>
          </div>
          <Link
            href="/catalog/equipment"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Open equipment
          </Link>
        </div>
        <div className="overflow-x-auto">
          {system.equipment.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-600">
              This system does not have linked equipment yet.
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Equipment</th>
                  <th className="px-6 py-4 font-semibold">Model</th>
                  <th className="px-6 py-4 font-semibold">Manufacturer</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {system.equipment.map((equipment) => (
                  <tr
                    key={equipment.id}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-950">
                      <Link href={`/catalog/equipment/${equipment.id}`}>
                        {equipment.code}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/catalog/equipment/${equipment.id}`}>
                        {equipment.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{equipment.model ?? "N/A"}</td>
                    <td className="px-6 py-4">{equipment.manufacturer.name}</td>
                    <td className="px-6 py-4">{equipment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Service activity
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Open and historical service work linked to this system.
            </p>
          </div>
          <Link
            href={`/service?systemId=${system.id}`}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Open service
          </Link>
        </div>
        <div className="overflow-x-auto">
          {system.serviceCases.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-600">
              This system does not have service cases yet.
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-6 py-4 font-semibold">Case</th>
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Equipment</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {system.serviceCases.map((serviceCase) => (
                  <tr
                    key={serviceCase.id}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-950">
                      <Link href={`/service/${serviceCase.id}`}>
                        {serviceCase.code}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/service/${serviceCase.id}`}>
                        {serviceCase.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {serviceCase.equipment ? (
                        <Link href={`/catalog/equipment/${serviceCase.equipment.id}`}>
                          {serviceCase.equipment.code}
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4">{serviceCase.priority}</td>
                    <td className="px-6 py-4">{serviceCase.status}</td>
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
