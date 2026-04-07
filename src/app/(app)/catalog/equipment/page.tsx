import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { EquipmentTable } from "@/components/catalog/equipment-table";

export const dynamic = "force-dynamic";

type EquipmentPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    system?: string;
  }>;
};

const allowedStatuses = ["Active", "Maintenance", "Inactive"] as const;

export default async function EquipmentPage({
  searchParams,
}: EquipmentPageProps) {
  const user = await getServerSessionUser();
  const { q = "", status = "all", system = "all" } = await searchParams;
  const normalizedQuery = q.trim();
  const normalizedStatus = allowedStatuses.includes(
    status as (typeof allowedStatuses)[number],
  )
    ? status
    : "all";
  const normalizedSystem =
    system === "assigned" || system === "unassigned" ? system : "all";

  const equipment = user
    ? await db.equipment.findMany({
        where: {
          organizationId: user.organizationId,
          ...(normalizedStatus !== "all" ? { status: normalizedStatus } : {}),
          ...(normalizedSystem === "assigned"
            ? { systemId: { not: null } }
            : normalizedSystem === "unassigned"
              ? { systemId: null }
              : {}),
          ...(normalizedQuery
            ? {
                OR: [
                  { code: { contains: normalizedQuery, mode: "insensitive" } },
                  { name: { contains: normalizedQuery, mode: "insensitive" } },
                  { model: { contains: normalizedQuery, mode: "insensitive" } },
                  {
                    serialNumber: {
                      contains: normalizedQuery,
                      mode: "insensitive",
                    },
                  },
                  {
                    category: {
                      contains: normalizedQuery,
                      mode: "insensitive",
                    },
                  },
                  {
                    manufacturer: {
                      name: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    system: {
                      code: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    system: {
                      name: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ code: "asc" }],
        include: {
          manufacturer: true,
          system: {
            select: {
              id: true,
              code: true,
            },
          },
        },
      })
    : [];

  const [
    totalEquipment,
    activeEquipment,
    maintenanceEquipment,
    assignedEquipment,
  ] = user
    ? await Promise.all([
        db.equipment.count({
          where: { organizationId: user.organizationId },
        }),
        db.equipment.count({
          where: { organizationId: user.organizationId, status: "Active" },
        }),
        db.equipment.count({
          where: {
            organizationId: user.organizationId,
            status: "Maintenance",
          },
        }),
        db.equipment.count({
          where: {
            organizationId: user.organizationId,
            systemId: { not: null },
          },
        }),
      ])
    : [0, 0, 0, 0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Equipment"
        title="Equipment"
        description="Equipment extends the catalog beyond products and gives the rebuild a reusable technical asset register tied to manufacturers and systems."
        actions={
          <>
            <Link
              href="/catalog/equipment"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Refresh
            </Link>
            <a
              href={`/api/equipment/export?${new URLSearchParams({
                ...(normalizedQuery ? { q: normalizedQuery } : {}),
                ...(normalizedStatus !== "all"
                  ? { status: normalizedStatus }
                  : {}),
                ...(normalizedSystem !== "all"
                  ? { system: normalizedSystem }
                  : {}),
              }).toString()}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Export CSV
            </a>
            <Link
              href="/catalog/equipment/new"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              New equipment
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Total equipment
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {totalEquipment}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Active
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {activeEquipment}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-amber-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Maintenance
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {maintenanceEquipment}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Linked to systems
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {assignedEquipment}
          </p>
        </article>
      </section>

      <EquipmentTable
        equipment={equipment.map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          model: item.model,
          serialNumber: item.serialNumber,
          category: item.category,
          manufacturerName: item.manufacturer.name,
          systemCode: item.system?.code ?? null,
          status: item.status,
        }))}
        filters={{
          q: normalizedQuery,
          status: normalizedStatus,
          system: normalizedSystem,
        }}
      />
    </div>
  );
}
