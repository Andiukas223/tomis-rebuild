import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { hasCapability } from "@/lib/permissions";
import { PageHeader } from "@/components/app/page-header";

export const dynamic = "force-dynamic";

type ManufacturersPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function ManufacturersPage({
  searchParams,
}: ManufacturersPageProps) {
  const user = await getServerSessionUser();
  const canManage = hasCapability(user, "registry.manage");
  const { q = "" } = await searchParams;
  const normalizedQuery = q.trim();

  const manufacturers = user
    ? await db.manufacturer.findMany({
        where: {
          organizationId: user.organizationId,
          ...(normalizedQuery
            ? {
                OR: [
                  { name: { contains: normalizedQuery, mode: "insensitive" } },
                  { code: { contains: normalizedQuery, mode: "insensitive" } },
                  {
                    country: {
                      contains: normalizedQuery,
                      mode: "insensitive",
                    },
                  },
                  {
                    website: {
                      contains: normalizedQuery,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ name: "asc" }],
        include: {
          _count: {
            select: {
              equipment: true,
              products: true,
            },
          },
        },
      })
    : [];

  const [totalManufacturers, linkedProducts, linkedEquipment] = user
    ? await Promise.all([
        db.manufacturer.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
        db.product.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
        db.equipment.count({
          where: {
            organizationId: user.organizationId,
          },
        }),
      ])
    : [0, 0, 0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Manufacturers"
        title="Manufacturers"
        description="Manufacturers are now actively connected to products, turning this registry slice into real shared master data."
        actions={
          <>
            <Link
              href="/catalog/products"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Open products
            </Link>
            {canManage ? (
              <Link
                href="/registry/manufacturers/new"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                New manufacturer
              </Link>
            ) : null}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Manufacturers
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {totalManufacturers}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Linked products
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {linkedProducts}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-violet-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
            Linked equipment
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {linkedEquipment}
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Manufacturer registry
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            These records now drive the product catalog and future equipment
            relationships.
          </p>
        </div>

        <form
          action="/registry/manufacturers"
          className="grid gap-4 border-b border-slate-200 px-6 py-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]"
        >
          <input
            aria-label="Search manufacturers"
            name="q"
            defaultValue={normalizedQuery}
            placeholder="Search by name, code, country, or website..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
          />
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Apply
          </button>
          <Link
            href="/registry/manufacturers"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Clear
          </Link>
        </form>

        <div className="overflow-x-auto">
          {manufacturers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-lg font-semibold text-slate-950">
                No manufacturers match this view
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Try changing the search or add a new manufacturer to expand the
                registry.
              </p>
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Country</th>
                  <th className="px-6 py-4 font-semibold">Website</th>
                  <th className="px-6 py-4 font-semibold">Products</th>
                  <th className="px-6 py-4 font-semibold">Equipment</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {manufacturers.map((manufacturer) => (
                  <tr
                    key={manufacturer.id}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-950">
                      <Link href={`/registry/manufacturers/${manufacturer.id}`}>
                        {manufacturer.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{manufacturer.code ?? "N/A"}</td>
                    <td className="px-6 py-4">
                      {manufacturer.country ?? "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {manufacturer.website ? (
                        <a
                          href={manufacturer.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-700 hover:underline"
                        >
                          Open site
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4">{manufacturer._count.products}</td>
                    <td className="px-6 py-4">{manufacturer._count.equipment}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/registry/manufacturers/${manufacturer.id}`}
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </Link>
                        {canManage ? (
                          <Link
                            href={`/registry/manufacturers/${manufacturer.id}/edit`}
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
