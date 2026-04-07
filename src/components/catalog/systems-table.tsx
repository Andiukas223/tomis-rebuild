import Link from "next/link";
import { DeleteSystemButton } from "@/components/catalog/delete-system-button";

export type SystemsTableItem = {
  id: string;
  code: string;
  name: string;
  serialNumber: string | null;
  hospitalName: string;
  status: string;
  equipmentCount: number;
};

type SystemsTableProps = {
  systems: SystemsTableItem[];
  filters: {
    q: string;
    status: string;
  };
  canManage: boolean;
};

export function SystemsTable({ systems, filters, canManage }: SystemsTableProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Systems</h3>
          <p className="mt-1 text-sm text-slate-600">
            Reference CRUD screen for the rebuild. This page will define the
            table, search, filters, actions, and detail flow patterns for other
            modules.
          </p>
        </div>
        {canManage ? (
          <div className="flex flex-wrap gap-3">
            <Link
              href="/catalog/systems/new"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Create system
            </Link>
          </div>
        ) : null}
      </div>

      <form
        action="/catalog/systems"
        className="grid gap-4 border-b border-slate-200 px-6 py-4 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]"
      >
        <input
          aria-label="Search systems"
          name="q"
          defaultValue={filters.q}
          placeholder="Search by code, name, serial number, hospital, or equipment..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
        />
        <select
          aria-label="Filter by status"
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
          href="/catalog/systems"
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          Clear
        </Link>
      </form>

      <div className="overflow-x-auto">
        {systems.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-950">
              No systems match this view
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Try changing the search or filter settings, or create a new system
              to begin building the real catalog workflow.
            </p>
          </div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">System</th>
                <th className="px-6 py-4 font-semibold">Serial number</th>
                <th className="px-6 py-4 font-semibold">Hospital</th>
                <th className="px-6 py-4 font-semibold">Equipment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {systems.map((system) => (
                <tr
                  key={system.id}
                  className="border-b border-slate-100 text-sm text-slate-700"
                >
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    <Link href={`/catalog/systems/${system.id}`}>{system.code}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/catalog/systems/${system.id}`}>{system.name}</Link>
                  </td>
                  <td className="px-6 py-4">{system.serialNumber ?? "N/A"}</td>
                  <td className="px-6 py-4">{system.hospitalName}</td>
                  <td className="px-6 py-4">{system.equipmentCount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        system.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {system.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/catalog/systems/${system.id}`}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </Link>
                      {canManage ? (
                        <>
                          <Link
                            href={`/catalog/systems/${system.id}/edit`}
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </Link>
                          <DeleteSystemButton id={system.id} />
                        </>
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
  );
}
