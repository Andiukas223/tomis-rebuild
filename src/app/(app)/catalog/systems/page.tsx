import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";
import { MetricStrip } from "@/components/app/metric-strip";
import { CategoryIndexList } from "@/components/app/category-index-list";
import { SystemsTable } from "@/components/catalog/systems-table";

export const dynamic = "force-dynamic";

type SystemsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

const allowedStatuses = ["Active", "Maintenance", "Inactive"] as const;

export default async function SystemsPage({ searchParams }: SystemsPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return null;
  }
  const canManage = hasCapability(user, "catalog.manage");

  const { q = "", status = "all" } = await searchParams;
  const normalizedQuery = q.trim();
  const normalizedStatus = allowedStatuses.includes(
    status as (typeof allowedStatuses)[number],
  )
    ? status
    : "all";

  const systems = await db.system.findMany({
    where: {
      organizationId: user.organizationId,
      ...(normalizedStatus !== "all" ? { status: normalizedStatus } : {}),
      ...(normalizedQuery
        ? {
            OR: [
              { code: { contains: normalizedQuery, mode: "insensitive" } },
              { name: { contains: normalizedQuery, mode: "insensitive" } },
              {
                serialNumber: {
                  contains: normalizedQuery,
                  mode: "insensitive",
                },
              },
              { hospital: { name: { contains: normalizedQuery, mode: "insensitive" } } },
              {
                equipment: {
                  some: {
                    OR: [
                      { code: { contains: normalizedQuery, mode: "insensitive" } },
                      { name: { contains: normalizedQuery, mode: "insensitive" } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ code: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
      serialNumber: true,
      status: true,
      hospital: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          equipment: true,
        },
      },
    },
  });

  const [totalSystems, activeSystems, maintenanceSystems, inactiveSystems] =
    await Promise.all([
      db.system.count({ where: { organizationId: user.organizationId } }),
      db.system.count({
        where: { organizationId: user.organizationId, status: "Active" },
      }),
      db.system.count({
        where: { organizationId: user.organizationId, status: "Maintenance" },
      }),
      db.system.count({
        where: { organizationId: user.organizationId, status: "Inactive" },
      }),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Systems"
        title="Systems"
        description="Indexed system register with compact status visibility and a list-first working view."
        actions={
          <>
            <Link
              href="/catalog/systems"
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Refresh
            </Link>
            <a
              href={`/api/systems/export?${new URLSearchParams({
                ...(normalizedQuery ? { q: normalizedQuery } : {}),
                ...(normalizedStatus !== "all"
                  ? { status: normalizedStatus }
                  : {}),
              }).toString()}`}
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Export CSV
            </a>
            {canManage ? (
              <Link
                href="/catalog/systems/new"
                className="rounded-[var(--radius-sm)] bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--navy-mid)]"
              >
                New system
              </Link>
            ) : null}
          </>
        }
      />

      <MetricStrip
        items={[
          {
            label: "Total systems",
            value: totalSystems,
            detail: "Indexed system records",
          },
          {
            label: "Active",
            value: activeSystems,
            detail: "Ready for normal operation",
            tone: "success",
          },
          {
            label: "Maintenance",
            value: maintenanceSystems,
            detail: "Require service attention",
            tone: "warning",
          },
          {
            label: "Inactive",
            value: inactiveSystems,
            detail: "Removed from active use",
          },
        ]}
      />

      <CategoryIndexList
        eyebrow="Systems views"
        title="Working lists"
        items={[
          {
            title: "All systems",
            href: "/catalog/systems",
            description: "Full indexed register across the current organization.",
            count: totalSystems,
            meta: "Master list",
          },
          {
            title: "Active systems",
            href: "/catalog/systems?status=Active",
            description: "Operational records ready for normal service use.",
            count: activeSystems,
            meta: "In use",
          },
          {
            title: "Maintenance queue",
            href: "/catalog/systems?status=Maintenance",
            description: "Systems currently flagged for technical review or work.",
            count: maintenanceSystems,
            meta: "Attention",
          },
          {
            title: "Inactive systems",
            href: "/catalog/systems?status=Inactive",
            description: "Archived or decommissioned system entries.",
            count: inactiveSystems,
            meta: "Archive",
          },
        ]}
      />

      <SystemsTable
        systems={systems.map((system) => ({
          ...system,
          hospitalName: system.hospital.name,
          equipmentCount: system._count.equipment,
        }))}
        filters={{
          q: normalizedQuery,
          status: normalizedStatus,
        }}
        canManage={canManage}
      />
    </div>
  );
}
