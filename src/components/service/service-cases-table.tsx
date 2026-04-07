import Link from "next/link";
import { DeleteServiceCaseButton } from "@/components/service/delete-service-case-button";

export type ServiceCaseTableItem = {
  id: string;
  code: string;
  title: string;
  systemId: string;
  systemCode: string;
  equipmentId: string | null;
  equipmentCode: string | null;
  assigneeName: string | null;
  taskProgressLabel: string;
  priority: string;
  status: string;
  scheduledAt: string | null;
};

type ServiceCasesTableProps = {
  serviceCases: ServiceCaseTableItem[];
  filters: {
    q: string;
    status: string;
    priority: string;
    systemId: string;
    equipmentId: string;
  };
  createHref?: string;
};

export function ServiceCasesTable({
  serviceCases,
  filters,
  createHref = "/service/new",
}: ServiceCasesTableProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Service cases</h3>
          <p className="mt-1 text-sm text-slate-600">
            Operational service work tied directly to systems and optionally to
            a specific piece of equipment.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={createHref}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Create service case
          </Link>
        </div>
      </div>

      <form
        action="/service"
        className="grid gap-4 border-b border-slate-200 px-6 py-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto_auto]"
      >
        {filters.systemId ? (
          <input type="hidden" name="systemId" value={filters.systemId} />
        ) : null}
        {filters.equipmentId ? (
          <input type="hidden" name="equipmentId" value={filters.equipmentId} />
        ) : null}
        <input
          aria-label="Search service cases"
          name="q"
          defaultValue={filters.q}
          placeholder="Search by code, title, system, equipment, or summary..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
        />
        <select
          aria-label="Filter service cases by status"
          name="status"
          defaultValue={filters.status}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
        >
          <option value="all">All statuses</option>
          <option value="Open">Open</option>
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select
          aria-label="Filter service cases by priority"
          name="priority"
          defaultValue={filters.priority}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-sky-400 focus:bg-white"
        >
          <option value="all">All priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Apply
        </button>
        <Link
          href="/service"
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          Clear
        </Link>
      </form>

      <div className="overflow-x-auto">
        {serviceCases.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-950">
              No service cases match this view
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Adjust the filters or create a new service case to start the
              operational workflow.
            </p>
          </div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4 font-semibold">Case</th>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">System</th>
                <th className="px-6 py-4 font-semibold">Equipment</th>
                <th className="px-6 py-4 font-semibold">Technician</th>
                <th className="px-6 py-4 font-semibold">Tasks</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Scheduled</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceCases.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 text-sm text-slate-700"
                >
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    <Link href={`/service/${item.id}`}>{item.code}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/service/${item.id}`}>{item.title}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/catalog/systems/${item.systemId}`}>
                      {item.systemCode}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {item.equipmentId && item.equipmentCode ? (
                      <Link href={`/catalog/equipment/${item.equipmentId}`}>
                        {item.equipmentCode}
                      </Link>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4">{item.assigneeName ?? "Unassigned"}</td>
                  <td className="px-6 py-4">{item.taskProgressLabel}</td>
                  <td className="px-6 py-4">{item.priority}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Done"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.status === "In Progress"
                            ? "bg-sky-100 text-sky-700"
                            : item.status === "Planned"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.scheduledAt
                      ? new Date(item.scheduledAt).toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/service/${item.id}`}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </Link>
                      <Link
                        href={`/service/${item.id}/edit`}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                      <DeleteServiceCaseButton id={item.id} />
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
