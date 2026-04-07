import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";
import { MetricStrip } from "@/components/app/metric-strip";
import { CategoryIndexList } from "@/components/app/category-index-list";
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
  const canManage = hasCapability(user, "catalog.manage");
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
        description="Compact technical asset register linked to manufacturers and installed systems."
        actions={
          <>
            <Link
              href="/catalog/equipment"
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
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
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Export CSV
            </a>
            {canManage ? (
              <Link
                href="/catalog/equipment/new"
                className="rounded-[var(--radius-sm)] bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--navy-mid)]"
              >
                New equipment
              </Link>
            ) : null}
          </>
        }
      />

      <MetricStrip
        items={[
          {
            label: "Total equipment",
            value: totalEquipment,
            detail: "Indexed technical asset records",
          },
          {
            label: "Active",
            value: activeEquipment,
            detail: "Ready for field use",
            tone: "success",
          },
          {
            label: "Maintenance",
            value: maintenanceEquipment,
            detail: "Require technical review",
            tone: "warning",
          },
          {
            label: "Linked to systems",
            value: assignedEquipment,
            detail: "Assigned to installed systems",
            tone: "accent",
          },
        ]}
      />

      <CategoryIndexList
        eyebrow="Equipment views"
        title="Working lists"
        items={[
          {
            title: "All equipment",
            href: "/catalog/equipment",
            description: "Full asset register across assigned and unassigned items.",
            count: totalEquipment,
            meta: "Master list",
          },
          {
            title: "Assigned equipment",
            href: "/catalog/equipment?system=assigned",
            description: "Equipment already linked to live systems.",
            count: assignedEquipment,
            meta: "Installed",
          },
          {
            title: "Maintenance equipment",
            href: "/catalog/equipment?status=Maintenance",
            description: "Assets currently marked for technical attention.",
            count: maintenanceEquipment,
            meta: "Attention",
          },
          {
            title: "Unassigned equipment",
            href: "/catalog/equipment?system=unassigned",
            description: "Loose inventory not yet attached to a system record.",
            count: totalEquipment - assignedEquipment,
            meta: "Pending",
          },
        ]}
      />

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
        canManage={canManage}
      />
    </div>
  );
}
