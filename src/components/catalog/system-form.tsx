"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type SystemFormValues = {
  code: string;
  name: string;
  serialNumber: string;
  hospitalId: string;
  status: string;
  equipmentIds: string[];
};

type HospitalOption = {
  id: string;
  name: string;
  city: string | null;
};

type EquipmentOption = {
  id: string;
  code: string;
  name: string;
  model: string | null;
};

type SystemFormProps = {
  mode: "create" | "edit";
  systemId?: string;
  hospitals: HospitalOption[];
  equipmentOptions: EquipmentOption[];
  initialValues?: SystemFormValues;
};

const defaultValues: SystemFormValues = {
  code: "",
  name: "",
  serialNumber: "",
  hospitalId: "",
  status: "Active",
  equipmentIds: [],
};

export function SystemForm({
  mode,
  systemId,
  hospitals,
  equipmentOptions,
  initialValues = defaultValues,
}: SystemFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<SystemFormValues>(initialValues);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const endpoint =
    mode === "create" ? "/api/systems" : `/api/systems/${systemId}`;
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
            setError(data.message ?? "Failed to save system.");
            return;
          }

          const data = (await response.json()) as { system: { id: string } };
          router.push(`/catalog/systems/${data.system.id}`);
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
            placeholder="1308-002"
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
            placeholder="Endoskopine sistema"
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
            placeholder="862125231"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Hospital</span>
          <select
            value={values.hospitalId}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                hospitalId: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">Select hospital</option>
            {hospitals.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name}
                {hospital.city ? ` · ${hospital.city}` : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-3 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">
            Linked equipment
          </span>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {equipmentOptions.length === 0 ? (
              <p className="text-sm text-slate-600">
                No equipment is available yet. Create equipment records first to
                attach them to this system.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {equipmentOptions.map((equipment) => {
                  const checked = values.equipmentIds.includes(equipment.id);

                  return (
                    <label
                      key={equipment.id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            equipmentIds: event.target.checked
                              ? [...current.equipmentIds, equipment.id]
                              : current.equipmentIds.filter(
                                  (id) => id !== equipment.id,
                                ),
                          }))
                        }
                        className="mt-0.5 h-4 w-4 rounded border-slate-300"
                      />
                      <span>
                        <span className="block font-medium text-slate-950">
                          {equipment.code} {equipment.name}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {equipment.model ?? "Model not set"}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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
              ? "Create system"
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
