import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { DeleteEquipmentButton } from "@/components/catalog/delete-equipment-button";

type EquipmentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EquipmentDetailPage({
  params,
}: EquipmentDetailPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  const { id } = await params;

  const equipment = await db.equipment.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      manufacturer: true,
      system: true,
      serviceCases: {
        orderBy: [{ updatedAt: "desc" }],
        include: {
          system: true,
        },
      },
    },
  });

  if (!equipment) {
    notFound();
  }

  const canManageCatalog = hasCapability(user, "catalog.manage");
  const canManageService = hasCapability(user, "service.manage");
  const canViewRegistry = hasCapability(user, "registry.view");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Equipment"
        title={equipment.name}
        description="Equipment detail view for the technical asset records now connected to registry manufacturers."
        actions={
          <>
            <Link
              href="/catalog/equipment"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back to equipment
            </Link>
            {canManageCatalog ? (
              <Link
                href={`/catalog/equipment/${equipment.id}/edit`}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Edit equipment
              </Link>
            ) : null}
            <Link
              href={`/service?equipmentId=${equipment.id}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              View service
            </Link>
            {canManageService ? (
              <Link
                href={`/service/new?equipmentId=${equipment.id}`}
                className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500"
              >
                New service case
              </Link>
            ) : null}
            {canManageCatalog ? <DeleteEquipmentButton id={equipment.id} /> : null}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Code
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {equipment.code}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Model
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {equipment.model ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Serial number
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {equipment.serialNumber ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Status
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {equipment.status}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Category
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {equipment.category ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Manufacturer
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {canViewRegistry ? (
              <Link
                href={`/registry/manufacturers/${equipment.manufacturer.id}`}
                className="hover:text-sky-700"
              >
                {equipment.manufacturer.name}
              </Link>
            ) : (
              equipment.manufacturer.name
            )}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Manufacturer country
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {equipment.manufacturer.country ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Manufacturer website
          </p>
          <p className="mt-3 text-sm font-medium text-slate-950">
            {equipment.manufacturer.website ? (
              <a
                href={equipment.manufacturer.website}
                target="_blank"
                rel="noreferrer"
                className="text-sky-700 hover:underline"
              >
                {equipment.manufacturer.website}
              </a>
            ) : (
              "N/A"
            )}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Linked system
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {equipment.system ? (
              <Link
                href={`/catalog/systems/${equipment.system.id}`}
                className="hover:text-sky-700"
              >
                {equipment.system.code}
              </Link>
            ) : (
              "Unassigned"
            )}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Service cases
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {equipment.serviceCases.length}
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Service activity
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Service cases currently linked to this equipment asset.
            </p>
          </div>
          <Link
            href={`/service?equipmentId=${equipment.id}`}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Open service
          </Link>
        </div>
        <div className="overflow-x-auto">
          {equipment.serviceCases.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-600">
              This equipment does not have linked service cases yet.
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-6 py-4 font-semibold">Case</th>
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">System</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {equipment.serviceCases.map((serviceCase) => (
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
                      <Link href={`/catalog/systems/${serviceCase.system.id}`}>
                        {serviceCase.system.code}
                      </Link>
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
