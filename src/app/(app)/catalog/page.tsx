import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { MetricStrip } from "@/components/app/metric-strip";
import { CategoryIndexList } from "@/components/app/category-index-list";

const cards = [
  {
    title: "Systems",
    href: "/catalog/systems",
    description: "Installed systems, references, and linked equipment flows.",
    meta: "Installed assets",
  },
  {
    title: "Products",
    href: "/catalog/products",
    description: "Product catalog used across sales, service, and warehouse.",
    meta: "Commercial references",
  },
  {
    title: "Equipment",
    href: "/catalog/equipment",
    description: "Equipment master data, models, and technical references.",
    meta: "Technical assets",
  },
  {
    title: "Categories",
    href: "/catalog/categories",
    description: "Classification structure for equipment and future product taxonomies.",
    meta: "Taxonomy structure",
  },
];

export default function CatalogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Catalog"
        description="Compact index for systems, products, equipment, and category references."
      />

      <MetricStrip
        items={[
          { label: "Areas", value: 4, detail: "Current catalog sections" },
          { label: "Primary use", value: "Index", detail: "List-first module", tone: "accent" },
          { label: "Density", value: "High", detail: "Compact operational layout" },
          { label: "Status", value: "Live", detail: "Ready for linked records", tone: "success" },
        ]}
      />

      <CategoryIndexList
        eyebrow="Catalog index"
        title="Catalog areas"
        items={cards.map((card) => ({
          ...card,
          count: "-",
        }))}
      />

      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Quick access
            </p>
            <h3 className="mt-1 text-base font-bold text-[var(--navy)]">
              Frequent actions
            </h3>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-semibold text-[var(--text-mid)] transition-colors hover:border-[var(--steel-light)] hover:bg-[var(--navy-pale)]"
            >
              {card.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
