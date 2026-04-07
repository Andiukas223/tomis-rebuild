import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { navigationGroups } from "@/lib/navigation";
import { getServerSessionUser } from "@/lib/server-session";
import { canAccessPath } from "@/lib/permissions";

type CatchAllPageProps = {
  params: Promise<{
    slug: string[];
  }>;
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

  if (!canAccessPath(user, href)) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Restricted area"
          title={`${group.label} is not available for your role`}
          description="This area is part of the rebuild plan, but your current role does not have access to it in the new permission model."
          actions={
            <Link
              href="/dashboard"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Return to dashboard
            </Link>
          }
        />

        <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-sm leading-7 text-slate-600 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
          The access-control rollout has started with role-aware shell visibility and
          protected module entry points. Deeper API and action-level enforcement will
          follow in the next permissions passes.
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module placeholder"
        title={`${group.label} is queued for implementation`}
        description={`${group.description} This route exists now so the shell and navigation stay cohesive while we implement modules in priority order.`}
        actions={
          <Link
            href="/catalog/systems"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Review reference module
          </Link>
        }
      />

      <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-sm leading-7 text-slate-600 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
        This placeholder keeps the route map stable while we implement the
        rebuild in phases. The current focus remains on auth, shell patterns,
        and the first reusable CRUD module.
      </section>
    </div>
  );
}
