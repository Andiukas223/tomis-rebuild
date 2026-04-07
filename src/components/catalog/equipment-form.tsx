"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type EquipmentFormValues = {
  code: string;
  name: string;
  model: string;
  serialNumber: string;
  category: string;
  status: string;
  manufacturerId: string;
  systemId: string;
};

type ManufacturerOption = {
  id: string;
  name: string;
  country: string | null;
};

type SystemOption = {
  id: string;
  code: string;
  name: string;
};

type EquipmentFormProps = {
  mode: "create" | "edit";
  equipmentId?: string;
  manufacturers: ManufacturerOption[];
  systems: SystemOption[];
  initialValues?: EquipmentFormValues;
};

const defaultValues: EquipmentFormValues = {
  code: "",
  name: "",
  model: "",
  serialNumber: "",
  category: "",
  status: "Active",
  manufacturerId: "",
  systemId: "",
};

export function EquipmentForm({
  mode,
  equipmentId,
  manufacturers,
  systems,
  initialValues = defaultValues,
}: EquipmentFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<EquipmentFormValues>(initialValues);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const endpoint =
    mode === "create" ? "/api/equipment" : `/api/equipment/${equipmentId}`;
  const method = mode === "create" ? "POST" : "PATCH";

  return (
    <form
      className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");

        startTransition(async () => {
          const response = await fetch(endpoint, {
            method,
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });

          if (!response.ok) {
            const data = (await response.json()) as { message?: string };
            setError(data.message ?? "Failed to save equipment.");
            return;
          }

          const data = (await response.json()) as { equipment: { id: string } };
          router.push(`/catalog/equipment/${data.equipment.id}`);
          router.refresh();
        });
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Code</span>
          <input
            value={values.code}
            onChange={(event) =>
              setValues((current) => ({ ...current, code: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="EQ-2001"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="Portable Ultrasound Console"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Model</span>
          <input
            value={values.model}
            onChange={(event) =>
              setValues((current) => ({ ...current, model: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="Vscan Air CL"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Serial number
          </span>
          <input
            value={values.serialNumber}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                serialNumber: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="GE-ULS-88231"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <input
            value={values.category}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="Imaging"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Manufacturer</span>
          <select
            value={values.manufacturerId}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                manufacturerId: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">Select manufacturer</option>
            {manufacturers.map((manufacturer) => (
              <option key={manufacturer.id} value={manufacturer.id}>
                {manufacturer.name}
                {manufacturer.country ? ` · ${manufacturer.country}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Linked system</span>
          <select
            value={values.systemId}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                systemId: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">No linked system</option>
            {systems.map((system) => (
              <option key={system.id} value={system.id}>
                {system.code} · {system.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create equipment"
              : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
