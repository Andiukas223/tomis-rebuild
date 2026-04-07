import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";
import { MetricStrip } from "@/components/app/metric-strip";
import { CategoryIndexList } from "@/components/app/category-index-list";
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
  const canManage = hasCapability(user, "catalog.manage");
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
        description="Compact product register tied to manufacturers, categories, and indexed catalog status views."
        actions={
          <>
            <Link
              href="/catalog/products"
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
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
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Export CSV
            </a>
            {canManage ? (
              <Link
                href="/catalog/products/new"
                className="rounded-[var(--radius-sm)] bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--navy-mid)]"
              >
                New product
              </Link>
            ) : null}
          </>
        }
      />

      <MetricStrip
        items={[
          {
            label: "Total products",
            value: totalProducts,
            detail: "Catalog product records",
          },
          {
            label: "Active",
            value: activeProducts,
            detail: "Ready for operational use",
            tone: "success",
          },
          {
            label: "Maintenance",
            value: maintenanceProducts,
            detail: "Require review or updates",
            tone: "warning",
          },
          {
            label: "Inactive",
            value: inactiveProducts,
            detail: "Hidden from active catalog work",
          },
        ]}
      />

      <CategoryIndexList
        eyebrow="Products views"
        title="Working lists"
        items={[
          {
            title: "All products",
            href: "/catalog/products",
            description: "Full product register with manufacturer-linked records.",
            count: totalProducts,
            meta: "Master list",
          },
          {
            title: "Active products",
            href: "/catalog/products?status=Active",
            description: "Available product records used in current operations.",
            count: activeProducts,
            meta: "In use",
          },
          {
            title: "Maintenance products",
            href: "/catalog/products?status=Maintenance",
            description: "Items that need updates, fixes, or review.",
            count: maintenanceProducts,
            meta: "Attention",
          },
          {
            title: "Inactive products",
            href: "/catalog/products?status=Inactive",
            description: "Older or retired catalog entries kept for history.",
            count: inactiveProducts,
            meta: "Archive",
          },
        ]}
      />

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
        canManage={canManage}
      />
    </div>
  );
}
