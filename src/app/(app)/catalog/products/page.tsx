import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { ProductsTable } from "@/components/catalog/products-table";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

const allowedStatuses = ["Active", "Maintenance", "Inactive"] as const;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const user = await getServerSessionUser();
  const { q = "", status = "all" } = await searchParams;
  const normalizedQuery = q.trim();
  const normalizedStatus = allowedStatuses.includes(
    status as (typeof allowedStatuses)[number],
  )
    ? status
    : "all";

  const products = user
    ? await db.product.findMany({
        where: {
          organizationId: user.organizationId,
          ...(normalizedStatus !== "all" ? { status: normalizedStatus } : {}),
          ...(normalizedQuery
            ? {
                OR: [
                  {
                    code: { contains: normalizedQuery, mode: "insensitive" },
                  },
                  {
                    name: { contains: normalizedQuery, mode: "insensitive" },
                  },
                  {
                    sku: { contains: normalizedQuery, mode: "insensitive" },
                  },
                  {
                    category: {
                      contains: normalizedQuery,
                      mode: "insensitive",
                    },
                  },
                  {
                    manufacturer: {
                      name: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ code: "asc" }],
        include: {
          manufacturer: true,
        },
      })
    : [];

  const [totalProducts, activeProducts, maintenanceProducts, inactiveProducts] =
    user
      ? await Promise.all([
          db.product.count({
            where: { organizationId: user.organizationId },
          }),
          db.product.count({
            where: { organizationId: user.organizationId, status: "Active" },
          }),
          db.product.count({
            where: {
              organizationId: user.organizationId,
              status: "Maintenance",
            },
          }),
          db.product.count({
            where: { organizationId: user.organizationId, status: "Inactive" },
          }),
        ])
      : [0, 0, 0, 0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Products"
        title="Products"
        description="Products are now a real catalog slice and the first concrete place where registry manufacturers are connected into business data."
        actions={
          <>
            <Link
              href="/catalog/products"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Refresh
            </Link>
            <a
              href={`/api/products/export?${new URLSearchParams({
                ...(normalizedQuery ? { q: normalizedQuery } : {}),
                ...(normalizedStatus !== "all"
                  ? { status: normalizedStatus }
                  : {}),
              }).toString()}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Export CSV
            </a>
            <Link
              href="/catalog/products/new"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              New product
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Total products
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {totalProducts}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Active
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {activeProducts}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-amber-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Maintenance
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {maintenanceProducts}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Inactive
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {inactiveProducts}
          </p>
        </article>
      </section>

      <ProductsTable
        products={products.map((product) => ({
          id: product.id,
          code: product.code,
          name: product.name,
          sku: product.sku,
          category: product.category,
          manufacturerName: product.manufacturer.name,
          status: product.status,
        }))}
        filters={{
          q: normalizedQuery,
          status: normalizedStatus,
        }}
      />
    </div>
  );
}
