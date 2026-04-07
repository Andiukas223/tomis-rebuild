import Link from "next/link";
import { DeleteEquipmentButton } from "@/components/catalog/delete-equipment-button";

export type EquipmentTableItem = {
  id: string;
  code: string;
  name: string;
  model: string | null;
  serialNumber: string | null;
  category: string | null;
  manufacturerName: string;
  systemCode: string | null;
  status: string;
};

type EquipmentTableProps = {
  equipment: EquipmentTableItem[];
  filters: {
    q: string;
    status: string;
    system: string;
  };
};

export function EquipmentTable({ equipment, filters }: EquipmentTableProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Equipment</h3>
          <p className="mt-1 text-sm text-slate-600">
            Manufacturer-linked equipment records for future service, system,
            and warehouse workflows.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/catalog/equipment/new"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Create equipment
          </Link>
        </div>
      </div>

      <form
        action="/catalog/equipment"
        className="grid gap-4 border-b border-slate-200 px-6 py-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto_auto]"
      >
        <input
          aria-label="Search equipment"
          name="q"
          defaultValue={filters.q}
          placeholder="Search by code, name, model, serial number, category, manufacturer, or system..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
        />
        <select
          aria-label="Filter equipment by status"
          name="status"
          defaultValue={filters.status}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
        >
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select
          aria-label="Filter equipment by linked system"
          name="system"
          defaultValue={filters.system}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
        >
          <option value="all">All system states</option>
          <option value="assigned">Assigned to system</option>
          <option value="unassigned">Unassigned</option>
        </select>
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Apply
        </button>
        <Link
          href="/catalog/equipment"
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          Clear
        </Link>
      </form>

      <div className="overflow-x-auto">
        {equipment.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-950">
              No equipment matches this view
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Try changing the search or filter settings, or create a new
              equipment record to expand the catalog.
            </p>
          </div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Equipment</th>
                <th className="px-6 py-4 font-semibold">Model</th>
                <th className="px-6 py-4 font-semibold">Serial number</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Manufacturer</th>
                <th className="px-6 py-4 font-semibold">Linked system</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 text-sm text-slate-700"
                >
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    <Link href={`/catalog/equipment/${item.id}`}>{item.code}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/catalog/equipment/${item.id}`}>{item.name}</Link>
                  </td>
                  <td className="px-6 py-4">{item.model ?? "N/A"}</td>
                  <td className="px-6 py-4">{item.serialNumber ?? "N/A"}</td>
                  <td className="px-6 py-4">{item.category ?? "N/A"}</td>
                  <td className="px-6 py-4">{item.manufacturerName}</td>
                  <td className="px-6 py-4">{item.systemCode ?? "Unassigned"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.status === "Maintenance"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/catalog/equipment/${item.id}`}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </Link>
                      <Link
                        href={`/catalog/equipment/${item.id}/edit`}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                      <DeleteEquipmentButton id={item.id} />
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
