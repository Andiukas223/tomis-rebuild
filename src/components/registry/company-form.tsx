"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type CompanyFormValues = {
  name: string;
  code: string;
  city: string;
  country: string;
};

type CompanyFormProps = {
  mode: "create" | "edit";
  companyId?: string;
  initialValues?: CompanyFormValues;
};

const defaultValues: CompanyFormValues = {
  name: "",
  code: "",
  city: "",
  country: "",
};

export function CompanyForm({
  mode,
  companyId,
  initialValues = defaultValues,
}: CompanyFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CompanyFormValues>(initialValues);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const endpoint =
    mode === "create" ? "/api/companies" : `/api/companies/${companyId}`;
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
            setError(data.message ?? "Failed to save company.");
            return;
          }

          const data = (await response.json()) as { company: { id: string } };
          router.push(`/registry/companies/${data.company.id}`);
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
            placeholder="Tradintek, Lietuva, UAB"
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
            placeholder="302512994"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">City</span>
          <input
            value={values.city}
            onChange={(event) =>
              setValues((current) => ({ ...current, city: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="Vilnius"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
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
            placeholder="Lithuania"
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
              ? "Create company"
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
