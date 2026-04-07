import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { navigationGroups } from "@/lib/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getServerSessionUser();

  const [
    systemsCount,
    equipmentCount,
    openServiceCount,
    criticalServiceCount,
    recentServiceCases,
  ] = user
    ? await Promise.all([
        db.system.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
        db.equipment.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
        db.serviceCase.count({
          where: {
            organizationId: user.organizationId,
            status: {
              in: ["Open", "Planned", "In Progress"],
            },
          },
        }),
        db.serviceCase.count({
          where: {
            organizationId: user.organizationId,
            priority: "Critical",
            status: {
              in: ["Open", "Planned", "In Progress"],
            },
          },
        }),
        db.serviceCase.findMany({
          where: {
            organizationId: user.organizationId,
          },
          orderBy: [{ updatedAt: "desc" }],
          take: 5,
          include: {
            system: true,
            equipment: true,
            assignedUser: true,
            tasks: true,
          },
        }),
      ])
    : [0, 0, 0, 0, []];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Protected area"
        title="Dashboard and module launcher"
        description="This page now acts as the daily launch point for active assets and service work, not just the shell landing screen."
        actions={
          <>
            <Link
              href="/service"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Open service
            </Link>
            <Link
              href="/service/new"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              New service case
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Systems"
          value={String(systemsCount)}
          detail="Installed systems currently tracked across the organization."
        />
        <StatCard
          label="Equipment"
          value={String(equipmentCount)}
          detail="Equipment assets available for system and service workflows."
        />
        <StatCard
          label="Active Service"
          value={String(openServiceCount)}
          detail="Open, planned, and in-progress cases that still need action."
        />
        <StatCard
          label="Critical Cases"
          value={String(criticalServiceCount)}
          detail="High-risk service items that should stay visible from the front page."
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Recent service activity
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                The latest operational work linked to systems and equipment.
              </p>
            </div>
            <Link
              href="/service"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Open service
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentServiceCases.length === 0 ? (
              <div className="px-6 py-10 text-sm text-slate-600">
                No service activity yet.
              </div>
            ) : (
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-6 py-4 font-semibold">Case</th>
                    <th className="px-6 py-4 font-semibold">System</th>
                    <th className="px-6 py-4 font-semibold">Equipment</th>
                    <th className="px-6 py-4 font-semibold">Technician</th>
                    <th className="px-6 py-4 font-semibold">Tasks</th>
                    <th className="px-6 py-4 font-semibold">Priority</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentServiceCases.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 text-sm text-slate-700"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-950">
                        <Link href={`/service/${item.id}`}>{item.code}</Link>
                        <p className="mt-1 font-normal text-slate-600">
                          {item.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/catalog/systems/${item.system.id}`}>
                          {item.system.code}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {item.equipment ? (
                          <Link href={`/catalog/equipment/${item.equipment.id}`}>
                            {item.equipment.code}
                          </Link>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.assignedUser?.fullName ?? "Unassigned"}
                      </td>
                      <td className="px-6 py-4">
                        {item.tasks.filter((task) => task.isCompleted).length}/
                        {item.tasks.length}
                      </td>
                      <td className="px-6 py-4">{item.priority}</td>
                      <td className="px-6 py-4">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="grid gap-4">
          {navigationGroups.map((group) => (
            <article
              key={group.label}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Module
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                    {group.label}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {group.description}
                  </p>
                </div>
                <Link
                  href={group.href}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Open
                </Link>
              </div>

              {group.children?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {group.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </section>
    </div>
  );
}
