import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { ServiceCasesTable } from "@/components/service/service-cases-table";

export const dynamic = "force-dynamic";

type ServicePageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    priority?: string;
    systemId?: string;
    equipmentId?: string;
  }>;
};

const allowedStatuses = ["Open", "Planned", "In Progress", "Done"] as const;
const allowedPriorities = ["Low", "Medium", "High", "Critical"] as const;

export default async function ServicePage({ searchParams }: ServicePageProps) {
  const user = await getServerSessionUser();
  const {
    q = "",
    status = "all",
    priority = "all",
    systemId = "",
    equipmentId = "",
  } = await searchParams;
  const normalizedQuery = q.trim();
  const normalizedStatus = allowedStatuses.includes(
    status as (typeof allowedStatuses)[number],
  )
    ? status
    : "all";
  const normalizedPriority = allowedPriorities.includes(
    priority as (typeof allowedPriorities)[number],
  )
    ? priority
    : "all";
  const normalizedSystemId = systemId.trim();
  const normalizedEquipmentId = equipmentId.trim();

  const [systemContext, equipmentContext] = user
    ? await Promise.all([
        normalizedSystemId
          ? db.system.findFirst({
              where: {
                id: normalizedSystemId,
                organizationId: user.organizationId,
              },
              select: {
                id: true,
                code: true,
                name: true,
              },
            })
          : null,
        normalizedEquipmentId
          ? db.equipment.findFirst({
              where: {
                id: normalizedEquipmentId,
                organizationId: user.organizationId,
              },
              select: {
                id: true,
                code: true,
                name: true,
                systemId: true,
              },
            })
          : null,
      ])
    : [null, null];

  const effectiveSystemId =
    equipmentContext?.systemId && !systemContext
      ? equipmentContext.systemId
      : normalizedSystemId;

  const serviceCases = user
    ? await db.serviceCase.findMany({
        where: {
          organizationId: user.organizationId,
          ...(normalizedStatus !== "all" ? { status: normalizedStatus } : {}),
          ...(normalizedPriority !== "all"
            ? { priority: normalizedPriority }
            : {}),
          ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
          ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
          ...(normalizedQuery
            ? {
                OR: [
                  { code: { contains: normalizedQuery, mode: "insensitive" } },
                  {
                    title: { contains: normalizedQuery, mode: "insensitive" },
                  },
                  {
                    summary: { contains: normalizedQuery, mode: "insensitive" },
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
                    equipment: {
                      code: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ updatedAt: "desc" }],
        include: {
          system: true,
          equipment: true,
          assignedUser: true,
          tasks: true,
        },
      })
    : [];

  const [totalCases, openCases, inProgressCases, criticalCases] = user
    ? await Promise.all([
        db.serviceCase.count({
          where: {
            organizationId: user.organizationId,
            ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
            ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
          },
        }),
        db.serviceCase.count({
          where: {
            organizationId: user.organizationId,
            status: "Open",
            ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
            ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
          },
        }),
        db.serviceCase.count({
          where: {
            organizationId: user.organizationId,
            status: "In Progress",
            ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
            ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
          },
        }),
        db.serviceCase.count({
          where: {
            organizationId: user.organizationId,
            priority: "Critical",
            ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
            ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
          },
        }),
      ])
    : [0, 0, 0, 0];

  const contextDescription = equipmentContext
    ? `Showing service work for equipment ${equipmentContext.code} and its linked system.`
    : systemContext
      ? `Showing service work for system ${systemContext.code}.`
      : "The rebuild now has its first operational workflow: service cases connected to systems and linked equipment, ready for preventive and corrective work tracking.";

  const createHref = `/service/new?${new URLSearchParams({
    ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
    ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
  }).toString()}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service"
        title="Service operations"
        description={contextDescription}
        actions={
          <>
            <Link
              href={
                effectiveSystemId || equipmentContext
                  ? "/service"
                  : "/service"
              }
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Refresh
            </Link>
            <a
              href={`/api/service-cases/export?${new URLSearchParams({
                ...(normalizedQuery ? { q: normalizedQuery } : {}),
                ...(normalizedStatus !== "all"
                  ? { status: normalizedStatus }
                  : {}),
                ...(normalizedPriority !== "all"
                  ? { priority: normalizedPriority }
                  : {}),
                ...(effectiveSystemId ? { systemId: effectiveSystemId } : {}),
                ...(equipmentContext ? { equipmentId: equipmentContext.id } : {}),
              }).toString()}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Export CSV
            </a>
            <Link
              href={createHref}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              New service case
            </Link>
          </>
        }
      />

      {systemContext || equipmentContext ? (
        <section className="rounded-[1.5rem] border border-sky-100 bg-sky-50/70 px-6 py-5 text-sm text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center gap-3">
            {systemContext ? (
              <Link
                href={`/catalog/systems/${systemContext.id}`}
                className="rounded-full border border-sky-200 bg-white px-3 py-1.5 font-medium text-sky-700 hover:bg-sky-100"
              >
                System: {systemContext.code}
              </Link>
            ) : null}
            {equipmentContext ? (
              <Link
                href={`/catalog/equipment/${equipmentContext.id}`}
                className="rounded-full border border-sky-200 bg-white px-3 py-1.5 font-medium text-sky-700 hover:bg-sky-100"
              >
                Equipment: {equipmentContext.code}
              </Link>
            ) : null}
            <Link
              href="/service"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
            >
              Clear context
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Total cases
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {totalCases}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Open
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {openCases}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            In progress
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {inProgressCases}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-rose-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Critical
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {criticalCases}
          </p>
        </article>
      </section>

      <ServiceCasesTable
        serviceCases={serviceCases.map((item) => ({
          id: item.id,
          code: item.code,
          title: item.title,
          systemId: item.system.id,
          systemCode: item.system.code,
          equipmentId: item.equipment?.id ?? null,
          equipmentCode: item.equipment?.code ?? null,
          assigneeName: item.assignedUser?.fullName ?? null,
          taskProgressLabel: `${item.tasks.filter((task) => task.isCompleted).length}/${item.tasks.length}`,
          priority: item.priority,
          status: item.status,
          scheduledAt: item.scheduledAt?.toISOString() ?? null,
        }))}
        filters={{
          q: normalizedQuery,
          status: normalizedStatus,
          priority: normalizedPriority,
          systemId: effectiveSystemId,
          equipmentId: equipmentContext?.id ?? "",
        }}
        createHref={createHref}
      />
    </div>
  );
}
