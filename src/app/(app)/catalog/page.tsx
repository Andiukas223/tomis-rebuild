import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";

const cards = [
  {
    title: "Systems",
    href: "/catalog/systems",
    description: "Installed systems, references, and linked equipment flows.",
  },
  {
    title: "Products",
    href: "/catalog/products",
    description: "Product catalog used across sales, service, and warehouse.",
  },
  {
    title: "Equipment",
    href: "/catalog/equipment",
    description: "Equipment master data, models, and technical references.",
  },
  {
    title: "Categories",
    href: "/catalog/categories",
    description: "Classification structure for equipment and future product taxonomies.",
  },
];

export default function CatalogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Catalog module"
        description="Catalog is the first domain being translated into the rebuild. It will establish the repeatable patterns for list views, detail screens, and create-edit workflows."
      />

      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Catalog area
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">
              {card.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {card.description}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
