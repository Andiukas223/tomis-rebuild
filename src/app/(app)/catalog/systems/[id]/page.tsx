import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";

type SystemDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SystemDetailPage({
  params,
}: SystemDetailPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  const { id } = await params;

  const system = await db.system.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      hospital: true,
    },
  });

  if (!system) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Systems"
        title={system.name}
        description="System detail view for the first real CRUD module in the rebuild."
        actions={
          <>
            <Link
              href="/catalog/systems"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back to systems
            </Link>
            <Link
              href={`/catalog/systems/${system.id}/edit`}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Edit system
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Code
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {system.code}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Status
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {system.status}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Serial number
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {system.serialNumber ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Hospital
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {system.hospital.name}
          </p>
        </article>
      </section>
    </div>
  );
}
