import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  const { id } = await params;

  const product = await db.product.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      manufacturer: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Products"
        title={product.name}
        description="Product detail view for the first manufacturer-linked catalog entity in the rebuild."
        actions={
          <>
            <Link
              href="/catalog/products"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back to products
            </Link>
            <Link
              href={`/catalog/products/${product.id}/edit`}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Edit product
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Code
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {product.code}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            SKU
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {product.sku ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Status
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {product.status}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Category
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {product.category ?? "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Manufacturer
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            <Link
              href={`/registry/manufacturers/${product.manufacturer.id}`}
              className="hover:text-sky-700"
            >
              {product.manufacturer.name}
            </Link>
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Manufacturer country
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {product.manufacturer.country ?? "N/A"}
          </p>
        </article>
      </section>
    </div>
  );
}
