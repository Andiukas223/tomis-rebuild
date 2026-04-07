import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { MetricStrip } from "@/components/app/metric-strip";
import { CategoryIndexList } from "@/components/app/category-index-list";
import { navigationGroups } from "@/lib/navigation";
import { getServerSessionUser } from "@/lib/server-session";
import { canAccessPath } from "@/lib/permissions";

type CatchAllPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

type PlannedItem = {
  title: string;
  description: string;
  meta: string;
};

const modulePlans: Record<
  string,
  {
    statusDetail: string;
    nextTarget: string;
    rolloutItems: PlannedItem[];
  }
> = {
  "/sales": {
    statusDetail: "Commercial workflow is queued after operations-first modules.",
    nextTarget: "Orders and quotes",
    rolloutItems: [
      {
        title: "Requests and leads",
        description: "Capture client demand, inbound requests, and early qualification.",
        meta: "Pipeline",
      },
      {
        title: "Offers and pricing",
        description: "Build structured offer records with product and service references.",
        meta: "Commercial",
      },
      {
        title: "Sales orders",
        description: "Convert approved offers into tracked order execution flows.",
        meta: "Execution",
      },
    ],
  },
  "/tasks": {
    statusDetail: "Standalone task management follows the current service task refinement work.",
    nextTarget: "Cross-module task board",
    rolloutItems: [
      {
        title: "Shared task board",
        description: "A central queue for internal jobs that do not belong only to service cases.",
        meta: "Operations",
      },
      {
        title: "Visits and field work",
        description: "Track technician visits, travel, and execution slots outside full service jobs.",
        meta: "Scheduling",
      },
      {
        title: "Ownership and follow-up",
        description: "Escalation, reminders, and due-date control across teams.",
        meta: "Accountability",
      },
    ],
  },
  "/warehouse": {
    statusDetail: "Inventory foundation is planned after service and registry stabilization.",
    nextTarget: "Stock balances",
    rolloutItems: [
      {
        title: "Stock items",
        description: "Maintain indexed inventory records linked to products and spare parts.",
        meta: "Inventory",
      },
      {
        title: "Movements",
        description: "Track in, out, transfer, and reservation events with traceability.",
        meta: "Traceability",
      },
      {
        title: "Service reservations",
        description: "Link required parts directly to service execution and task planning.",
        meta: "Operations",
      },
    ],
  },
  "/office": {
    statusDetail: "Internal office tools stay queued until the core operational modules are stronger.",
    nextTarget: "Shared resources",
    rolloutItems: [
      {
        title: "Vehicles and shared assets",
        description: "Track internal resources needed for visits and company operations.",
        meta: "Resources",
      },
      {
        title: "Leave and availability",
        description: "Support planning around technician and staff availability windows.",
        meta: "Planning",
      },
      {
        title: "Internal schedules",
        description: "Add office-side visibility for support work, handoffs, and logistics.",
        meta: "Coordination",
      },
    ],
  },
  "/administration": {
    statusDetail: "Administration remains a controlled area, expanded carefully behind the new role model.",
    nextTarget: "User and master-data controls",
    rolloutItems: [
      {
        title: "Roles and users",
        description: "Extend the current permission model into editable user and role administration.",
        meta: "Security",
      },
      {
        title: "Master data",
        description: "Centralize shared types, statuses, and controlled dictionaries.",
        meta: "Core data",
      },
      {
        title: "Audit review",
        description: "Surface sensitive action history for accountability and support.",
        meta: "Governance",
      },
    ],
  },
};

export default async function CatchAllModulePage({
  params,
}: CatchAllPageProps) {
  const user = await getServerSessionUser();
  const { slug } = await params;
  const href = `/${slug.join("/")}`;
  const group = navigationGroups.find((item) => item.href === href);

  if (!group) {
    notFound();
  }

  const modulePlan = modulePlans[href] ?? {
    statusDetail: "This route is reserved in the roadmap and will be implemented later.",
    nextTarget: "Queued module work",
    rolloutItems: [
      {
        title: `${group.label} overview`,
        description:
          "Module shell, indexed list screens, and compact operational summaries.",
        meta: "Placeholder",
      },
    ],
  };

  if (!canAccessPath(user, href)) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Restricted area"
          title={`${group.label} is not available for your role`}
          description="This route is part of the rebuild plan, but the current role cannot open it in the active permission model."
          actions={
            <Link
              href="/dashboard"
              className="rounded-[var(--radius-sm)] bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--navy-mid)]"
            >
              Return to dashboard
            </Link>
          }
        />

        <MetricStrip
          items={[
            {
              label: "Module",
              value: group.label,
              detail: "Restricted route",
            },
            {
              label: "Access",
              value: "Blocked",
              detail: "Current role cannot open this area",
              tone: "danger",
            },
            {
              label: "Priority",
              value: modulePlan.nextTarget,
              detail: "Next useful direction when access is granted",
              tone: "warning",
            },
            {
              label: "Fallback",
              value: "Dashboard",
              detail: "Use a permitted module",
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Queued module"
        title={group.label}
        description={`${group.description} This route stays visible so navigation remains stable while we build the next slices in order.`}
        actions={
          <Link
            href="/dashboard"
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
          >
            Return to dashboard
          </Link>
        }
      />

      <MetricStrip
        items={[
          {
            label: "Status",
            value: "Planned",
            detail: modulePlan.statusDetail,
            tone: "warning",
          },
          {
            label: "Next target",
            value: modulePlan.nextTarget,
            detail: "Current roadmap focus for this area",
            tone: "accent",
          },
          {
            label: "Subsections",
            value: group.children?.length ?? modulePlan.rolloutItems.length,
            detail: "Visible module entry points",
          },
          {
            label: "Layout",
            value: "Compact",
            detail: "Small metrics line and indexed main lists",
            tone: "success",
          },
        ]}
      />

      <CategoryIndexList
        eyebrow="Module index"
        title={`${group.label} rollout plan`}
        items={modulePlan.rolloutItems.map((item, index) => ({
          title: item.title,
          href: group.children?.[index]?.href ?? group.href,
          description: item.description,
          count: String(index + 1).padStart(2, "0"),
          meta: item.meta,
        }))}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Build note
            </p>
            <h3 className="mt-1 text-base font-bold text-[var(--navy)]">
              Why this page exists now
            </h3>
          </div>
          <div className="px-4 py-4 text-sm leading-6 text-[var(--text-muted)]">
            The placeholder keeps route structure, sidebar logic, and future module
            naming stable while implementation continues. When this module is built,
            it should follow the same compact pattern already used in active areas:
            a slim metric strip at the top and a main window focused on indexed
            operational lists.
          </div>
        </article>

        <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Useful links
            </p>
            <h3 className="mt-1 text-base font-bold text-[var(--navy)]">
              Closest active modules
            </h3>
          </div>
          <div className="grid gap-3 px-4 py-4">
            <Link
              href="/dashboard"
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Dashboard
            </Link>
            <Link
              href="/service"
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Service
            </Link>
            <Link
              href="/documents"
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Documents
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
