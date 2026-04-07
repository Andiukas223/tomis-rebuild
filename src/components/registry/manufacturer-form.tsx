"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type ManufacturerFormValues = {
  name: string;
  code: string;
  country: string;
  website: string;
};

type ManufacturerFormProps = {
  mode: "create" | "edit";
  manufacturerId?: string;
  initialValues?: ManufacturerFormValues;
};

const defaultValues: ManufacturerFormValues = {
  name: "",
  code: "",
  country: "",
  website: "",
};

export function ManufacturerForm({
  mode,
  manufacturerId,
  initialValues = defaultValues,
}: ManufacturerFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ManufacturerFormValues>(initialValues);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const endpoint =
    mode === "create"
      ? "/api/manufacturers"
      : `/api/manufacturers/${manufacturerId}`;
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
            setError(data.message ?? "Failed to save manufacturer.");
            return;
          }

          const data = (await response.json()) as {
            manufacturer: { id: string };
          };
          router.push(`/registry/manufacturers/${data.manufacturer.id}`);
          router.refresh();
        });
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="GE Healthcare"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Code</span>
          <input
            value={values.code}
            onChange={(event) =>
              setValues((current) => ({ ...current, code: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="GEH"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Country</span>
          <input
            value={values.country}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                country: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="United States"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Website</span>
          <input
            value={values.website}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                website: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="https://www.example.com"
          />
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
              ? "Create manufacturer"
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
