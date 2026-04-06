import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";

export const dynamic = "force-dynamic";

export default async function RegistryPage() {
  const user = await getServerSessionUser();

  const [hospitalCount, activeSystemCount] = user
    ? await Promise.all([
        db.hospital.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
        db.system.count({
          where: {
            organizationId: user.organizationId,
            status: "Active",
          },
        }),
      ])
    : [0, 0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry"
        title="Registry module"
        description="Registry is now starting to hold real master data. Hospitals are the first normalized entity and will become the reference backbone for systems and future service workflows."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Hospitals
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {hospitalCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Active master records linked from catalog systems.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Active systems
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {activeSystemCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Systems already attached to a registry hospital.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Next registry slices
          </p>
          <p className="mt-3 text-lg font-semibold text-slate-950">
            Companies and manufacturers
          </p>
          <p className="mt-2 text-sm text-slate-600">
            These will follow the same master-data pattern.
          </p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/registry/hospitals"
          className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Registry area
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">
            Hospitals
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Manage the hospitals used by systems, service visits, and future
            customer-facing workflows.
          </p>
        </Link>
        <article className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Queued
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">
            Additional registry entities
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Companies, contacts, manufacturers, and addresses can now follow
            the same normalized master-data approach.
          </p>
        </article>
      </section>
    </div>
  );
}
