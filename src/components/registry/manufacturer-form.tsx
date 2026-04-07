"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GuidedIntakeFlowShell,
  GuidedIntakeStep,
} from "@/components/guided-intake/guided-intake-flow-shell";

export type ManufacturerFormValues = {
  name: string;
  code: string;
  country: string;
  website: string;
  supportEmail: string;
  supportPhone: string;
  productFocus: string;
  serviceNotes: string;
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
  supportEmail: "",
  supportPhone: "",
  productFocus: "",
  serviceNotes: "",
};

const steps: GuidedIntakeStep[] = [
  {
    id: "identity",
    title: "Identity",
    description: "Capture the vendor identity used across products and equipment.",
  },
  {
    id: "geography",
    title: "Geography",
    description: "Store the country and public reference path for the vendor.",
  },
  {
    id: "support",
    title: "Support",
    description: "Record the people and channels used for escalations.",
  },
  {
    id: "service",
    title: "Service Context",
    description: "Describe focus areas and support guidance for field work.",
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm the vendor support profile before saving.",
  },
];

function StepField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </label>
  );
}

function fieldClassName(isHighlighted?: boolean) {
  return `w-full rounded-[1.1rem] border px-4 py-3 text-sm text-slate-900 outline-none transition ${
    isHighlighted
      ? "border-[#ffb97a] bg-[#fffaf4] focus:border-[#ff8b2b] focus:bg-white"
      : "border-slate-200 bg-slate-50 focus:border-sky-400 focus:bg-white"
  }`;
}

export function ManufacturerForm({
  mode,
  manufacturerId,
  initialValues = defaultValues,
}: ManufacturerFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ManufacturerFormValues>(initialValues);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const endpoint =
    mode === "create"
      ? "/api/manufacturers"
      : `/api/manufacturers/${manufacturerId}`;
  const method = mode === "create" ? "POST" : "PATCH";
  const isReviewStep = currentStepIndex === steps.length - 1;

  const stepError = useMemo(() => {
    const currentStep = steps[currentStepIndex]?.id;

    if (currentStep === "identity" && !values.name.trim()) {
      return "Manufacturer name is required before you continue.";
    }

    if (
      currentStep === "support" &&
      values.supportEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.supportEmail.trim())
    ) {
      return "Support email must be a valid email address.";
    }

    return "";
  }, [currentStepIndex, values.name, values.supportEmail]);

  function updateField<Key extends keyof ManufacturerFormValues>(
    key: Key,
    nextValue: ManufacturerFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  function handleNext() {
    if (stepError) {
      setError(stepError);
      return;
    }

    setError("");
    setCurrentStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function handleBack() {
    setError("");
    setCurrentStepIndex((current) => Math.max(current - 1, 0));
  }

  const summaryItems = [
    {
      label: "Identity",
      value: values.name || "Missing manufacturer name",
      detail: [values.code || "No code", values.country || "No country"]
        .filter(Boolean)
        .join(" | "),
    },
    {
      label: "Public reference",
      value: values.website || "No website recorded",
      detail: values.productFocus || "No product focus recorded",
    },
    {
      label: "Support",
      value: values.supportEmail || "No support email",
      detail: values.supportPhone || "No support phone recorded",
    },
    {
      label: "Service Context",
      value: values.productFocus || "No product focus",
      detail: values.serviceNotes || "No service notes recorded.",
    },
  ];

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();

        if (!isReviewStep) {
          handleNext();
          return;
        }

        if (stepError) {
          setError(stepError);
          return;
        }

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
      <GuidedIntakeFlowShell
        eyebrow="Registry / Manufacturers"
        title={
          mode === "create"
            ? "Manufacturer Guided Intake"
            : "Edit Manufacturer Guided Intake"
        }
        description={
          mode === "create"
            ? "This completes the first Registry-wide Guided Intake rollout, combining vendor identity, geography, support channels, and service context before the manufacturer becomes shared master data."
            : "Use the same guided sequence to keep manufacturer support data complete, reviewable, and consistent for catalog and service teams."
        }
        stepLabel={`Step ${currentStepIndex + 1} / ${steps.length}`}
        currentStepIndex={currentStepIndex}
        steps={steps}
        helper={
          <div className="rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-4 text-sm leading-6 text-[#d5e2ef]">
            <p className="font-semibold text-white">Vendor support profile</p>
            <p className="mt-2">
              This intake is built for real vendor coordination: who they are,
              what they focus on, and how your team should escalate service issues.
            </p>
          </div>
        }
        footer={
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm text-slate-600">
              {error ? (
                <span className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700">
                  {error}
                </span>
              ) : (
                <span>
                  {isReviewStep
                    ? "Review the manufacturer support profile before saving it to the registry."
                    : "Move through the vendor profile one block at a time without losing progress."}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStepIndex === 0 || isPending}
                className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <button
                type={isReviewStep ? "submit" : "button"}
                onClick={isReviewStep ? undefined : handleNext}
                disabled={isPending}
                className="rounded-full bg-[#ff8b2b] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,139,43,0.28)] transition-colors hover:bg-[#f27c1c] disabled:cursor-not-allowed disabled:bg-[#f0b37e]"
              >
                {isPending
                  ? mode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : isReviewStep
                    ? mode === "create"
                      ? "Create manufacturer"
                      : "Save manufacturer"
                    : "Continue"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Exit flow
              </button>
            </div>
          </div>
        }
      >
        {steps[currentStepIndex]?.id === "identity" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <StepField
              label="Manufacturer name"
              hint="Used across products, equipment, service history, and reports."
            >
              <input
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={fieldClassName(true)}
                placeholder="GE Healthcare"
              />
            </StepField>

            <StepField label="Manufacturer code">
              <input
                value={values.code}
                onChange={(event) => updateField("code", event.target.value)}
                className={fieldClassName()}
                placeholder="GEH"
              />
            </StepField>
          </div>
        ) : null}

        {steps[currentStepIndex]?.id === "geography" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <StepField label="Country">
              <input
                value={values.country}
                onChange={(event) => updateField("country", event.target.value)}
                className={fieldClassName(true)}
                placeholder="United States"
              />
            </StepField>

            <StepField label="Website" hint="Optional public reference for product or support materials.">
              <input
                value={values.website}
                onChange={(event) => updateField("website", event.target.value)}
                className={fieldClassName()}
                placeholder="https://www.example.com"
              />
            </StepField>
          </div>
        ) : null}

        {steps[currentStepIndex]?.id === "support" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <StepField label="Support email" hint="Validated if provided.">
              <input
                value={values.supportEmail}
                onChange={(event) =>
                  updateField("supportEmail", event.target.value)
                }
                className={fieldClassName(true)}
                placeholder="support@vendor.example"
              />
            </StepField>

            <StepField label="Support phone">
              <input
                value={values.supportPhone}
                onChange={(event) =>
                  updateField("supportPhone", event.target.value)
                }
                className={fieldClassName()}
                placeholder="+49 69 500 7001"
              />
            </StepField>

            <div className="rounded-[1.4rem] border border-[#dce7f2] bg-[#f4f8fc] px-4 py-4 text-sm leading-7 text-[#38536d] md:col-span-2">
              Add the real escalation channel your service team will use. This
              keeps vendor coordination faster than searching through old notes.
            </div>
          </div>
        ) : null}

        {steps[currentStepIndex]?.id === "service" ? (
          <div className="grid gap-5">
            <StepField label="Product focus" hint="What this vendor is best known for in your operation.">
              <input
                value={values.productFocus}
                onChange={(event) =>
                  updateField("productFocus", event.target.value)
                }
                className={fieldClassName(true)}
                placeholder="Imaging systems and ultrasound"
              />
            </StepField>

            <StepField
              label="Service notes"
              hint="Capture escalation paths, recurring constraints, or vendor-specific support behavior."
            >
              <textarea
                value={values.serviceNotes}
                onChange={(event) =>
                  updateField("serviceNotes", event.target.value)
                }
                className={`${fieldClassName()} min-h-36 resize-y`}
                placeholder="Escalate advanced imaging diagnostics through the regional applications team first."
              />
            </StepField>
          </div>
        ) : null}

        {steps[currentStepIndex]?.id === "review" ? (
          <div className="space-y-5">
            <div className="rounded-[1.4rem] border border-[#d7e3f0] bg-[#edf4fb] px-5 py-4 text-sm leading-7 text-[#38536d]">
              Review the vendor profile before saving it as shared registry data
              for catalog, service, and reporting flows.
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {summaryItems.map((item) => (
                <article
                  key={item.label}
                  className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.detail || "No additional information recorded."}
                  </p>
                </article>
              ))}
            </div>

            <div className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-slate-600">
              Need to compare with the current registry list first?
              <Link
                href="/registry/manufacturers"
                className="ml-2 font-semibold text-[#0f2742] underline decoration-[#ff8b2b] underline-offset-4"
              >
                Open manufacturer registry
              </Link>
            </div>
          </div>
        ) : null}
      </GuidedIntakeFlowShell>
    </form>
  );
}
