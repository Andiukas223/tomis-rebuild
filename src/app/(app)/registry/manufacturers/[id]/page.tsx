import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { DeleteManufacturerButton } from "@/components/registry/delete-manufacturer-button";

type ManufacturerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ManufacturerDetailPage({
  params,
}: ManufacturerDetailPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  const { id } = await params;

  const manufacturer = await db.manufacturer.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      _count: {
        select: {
          equipment: true,
          products: true,
        },
      },
      equipment: {
        orderBy: [{ code: "asc" }],
        select: {
          id: true,
          code: true,
          name: true,
          model: true,
          status: true,
        },
      },
      products: {
        orderBy: [{ code: "asc" }],
        select: {
          id: true,
          code: true,
          name: true,
          category: true,
          status: true,
        },
      },
    },
  });

  if (!manufacturer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Manufacturers"
        title={manufacturer.name}
        description="Manufacturer detail view for the registry entity now actively used by the product catalog."
        actions={
          <>
            <Link
              href="/registry/manufacturers"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back to manufacturers
            </Link>
            <Link
              href={`/registry/manufacturers/${manufacturer.id}/edit`}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Edit manufacturer
            </Link>
            {manufacturer._count.products === 0 &&
            manufacturer._count.equipment === 0 ? (
              <DeleteManufacturerButton id={manufacturer.id} />
            ) : (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                Remove linked records before deleting
              </span>
            )}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Name
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {manufacturer.name}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Code
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {manufacturer.code ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Country
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {manufacturer.country ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Website
          </p>
          <p className="mt-3 text-sm font-medium text-slate-950">
            {manufacturer.website ? (
              <a
                href={manufacturer.website}
                target="_blank"
                rel="noreferrer"
                className="text-sky-700 hover:underline"
              >
                {manufacturer.website}
              </a>
            ) : (
              "N/A"
            )}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Linked products
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {manufacturer._count.products}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Linked equipment
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {manufacturer._count.equipment}
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Linked products
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Products currently assigned to this manufacturer.
            </p>
          </div>
          <Link
            href="/catalog/products"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Open products
          </Link>
        </div>
        <div className="overflow-x-auto">
          {manufacturer.products.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-600">
              This manufacturer is not linked to any products yet.
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {manufacturer.products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-950">
                      <Link href={`/catalog/products/${product.id}`}>
                        {product.code}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/catalog/products/${product.id}`}>
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{product.category ?? "N/A"}</td>
                    <td className="px-6 py-4">{product.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Linked equipment
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Equipment records currently assigned to this manufacturer.
            </p>
          </div>
          <Link
            href="/catalog/equipment"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Open equipment
          </Link>
        </div>
        <div className="overflow-x-auto">
          {manufacturer.equipment.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-600">
              This manufacturer is not linked to any equipment yet.
            </div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Equipment</th>
                  <th className="px-6 py-4 font-semibold">Model</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {manufacturer.equipment.map((equipment) => (
                  <tr
                    key={equipment.id}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-950">
                      <Link href={`/catalog/equipment/${equipment.id}`}>
                        {equipment.code}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/catalog/equipment/${equipment.id}`}>
                        {equipment.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{equipment.model ?? "N/A"}</td>
                    <td className="px-6 py-4">{equipment.status}</td>
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
