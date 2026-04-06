import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { navigationGroups } from "@/lib/navigation";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Protected area"
        title="Dashboard and module launcher"
        description="This page mirrors the role of the current Tomis landing experience: a fast, modular starting point for navigating into business workflows."
        actions={
          <>
            <Link
              href="/catalog/systems"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Open systems
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              View login page
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Foundation status"
          value="Active"
          detail="Shell, navigation, and protected route grouping are in place."
        />
        <StatCard
          label="Reference module"
          value="Systems"
          detail="Catalog systems is the first reusable CRUD target for the rebuild."
        />
        <StatCard
          label="Next milestone"
          value="Core data"
          detail="The next layer is expanding real persistence into more business modules."
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
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
    </div>
  );
}
