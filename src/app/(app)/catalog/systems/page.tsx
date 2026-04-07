import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";
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
        title="Systems reference screen"
        description="This page is the first concrete business screen in the rebuild. It is intentionally modeled as the baseline CRUD experience that future modules will reuse and refine."
        actions={
          <>
            <Link
              href="/catalog/systems"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
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
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Export CSV
            </a>
            {canManage ? (
              <Link
                href="/catalog/systems/new"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                New system
              </Link>
            ) : null}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Total systems
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {totalSystems}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Active
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {activeSystems}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-amber-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Maintenance
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {maintenanceSystems}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Inactive
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {inactiveSystems}
          </p>
        </article>
      </section>

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
