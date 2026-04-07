import Link from "next/link";
import { DeleteProductButton } from "@/components/catalog/delete-product-button";

export type ProductsTableItem = {
  id: string;
  code: string;
  name: string;
  sku: string | null;
  category: string | null;
  manufacturerName: string;
  status: string;
};

type ProductsTableProps = {
  products: ProductsTableItem[];
  filters: {
    q: string;
    status: string;
  };
};

export function ProductsTable({ products, filters }: ProductsTableProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Products</h3>
          <p className="mt-1 text-sm text-slate-600">
            Manufacturer-linked catalog records that will feed future sales,
            warehouse, and service workflows.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/catalog/products/new"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Create product
          </Link>
        </div>
      </div>

      <form
        action="/catalog/products"
        className="grid gap-4 border-b border-slate-200 px-6 py-4 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]"
      >
        <input
          aria-label="Search products"
          name="q"
          defaultValue={filters.q}
          placeholder="Search by code, name, SKU, category, or manufacturer..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
        />
        <select
          aria-label="Filter products by status"
          name="status"
          defaultValue={filters.status}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
        >
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Apply
        </button>
        <Link
          href="/catalog/products"
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          Clear
        </Link>
      </form>

      <div className="overflow-x-auto">
        {products.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-950">
              No products match this view
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Try changing the search or filter settings, or create a new
              product to expand the catalog.
            </p>
          </div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Manufacturer</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
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
                  <td className="px-6 py-4">{product.sku ?? "N/A"}</td>
                  <td className="px-6 py-4">{product.category ?? "N/A"}</td>
                  <td className="px-6 py-4">{product.manufacturerName}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : product.status === "Maintenance"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/catalog/products/${product.id}`}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </Link>
                      <Link
                        href={`/catalog/products/${product.id}/edit`}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton id={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
