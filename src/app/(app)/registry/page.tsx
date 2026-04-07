import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { MetricStrip } from "@/components/app/metric-strip";
import { CategoryIndexList } from "@/components/app/category-index-list";

export const dynamic = "force-dynamic";

export default async function RegistryPage() {
  const user = await getServerSessionUser();

  const [
    hospitalCount,
    companyCount,
    manufacturerCount,
    activeSystemCount,
    equipmentCount,
  ] =
    user
    ? await Promise.all([
        db.hospital.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
        db.company.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
        db.manufacturer.count({
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
        db.equipment.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
      ])
    : [0, 0, 0, 0, 0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry"
        title="Registry"
        description="Compact master-data index for hospitals, companies, and manufacturers."
      />

      <MetricStrip
        items={[
          { label: "Hospitals", value: hospitalCount, detail: "Facility records" },
          { label: "Companies", value: companyCount, detail: "Commercial master data" },
          { label: "Manufacturers", value: manufacturerCount, detail: "Vendor references" },
          { label: "Linked assets", value: `${activeSystemCount}/${equipmentCount}`, detail: "Systems / equipment", tone: "accent" },
        ]}
      />

      <CategoryIndexList
        eyebrow="Registry index"
        title="Master data sections"
        items={[
          {
            title: "Hospitals",
            href: "/registry/hospitals",
            description:
              "Manage the hospitals used by systems, service visits, and customer-facing workflows.",
            count: hospitalCount,
            meta: "Facility registry",
          },
          {
            title: "Companies",
            href: "/registry/companies",
            description:
              "Manage company master data for customer, sales, and document-linked flows.",
            count: companyCount,
            meta: "Commercial registry",
          },
          {
            title: "Manufacturers",
            href: "/registry/manufacturers",
            description:
              "Manage manufacturer data for products, equipment, and service references.",
            count: manufacturerCount,
            meta: "Vendor registry",
          },
        ]}
      />

      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Linked references
            </p>
            <h3 className="mt-1 text-base font-bold text-[var(--navy)]">
              Dependency checks
            </h3>
          </div>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--text-mid)]">
            Active systems already tied to registry hospitals:{" "}
            <span className="font-mono font-semibold text-[var(--navy)]">
              {activeSystemCount}
            </span>
          </div>
          <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--text-mid)]">
            Equipment records linked through manufacturer references:{" "}
            <span className="font-mono font-semibold text-[var(--navy)]">
              {equipmentCount}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
