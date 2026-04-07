"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GuidedIntakeFlowShell,
  GuidedIntakeStep,
} from "@/components/guided-intake/guided-intake-flow-shell";

export type HospitalFormValues = {
  name: string;
  code: string;
  city: string;
  country: string;
  addressLine1: string;
  addressLine2: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  serviceRegion: string;
  serviceNotes: string;
};

type HospitalFormProps = {
  mode: "create" | "edit";
  hospitalId?: string;
  initialValues?: HospitalFormValues;
};

const defaultValues: HospitalFormValues = {
  name: "",
  code: "",
  city: "",
  country: "Lithuania",
  addressLine1: "",
  addressLine2: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  serviceRegion: "",
  serviceNotes: "",
};

const steps: GuidedIntakeStep[] = [
  {
    id: "identity",
    title: "Identity",
    description: "Create the registry identity and visible short code.",
  },
  {
    id: "address",
    title: "Address",
    description: "Capture the physical location used in service coordination.",
  },
  {
    id: "contacts",
    title: "Contacts",
    description: "Store the day-to-day people and communication details.",
  },
  {
    id: "service",
    title: "Service Context",
    description: "Add regional handling notes and operational guidance.",
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm the full record before it becomes master data.",
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

export function HospitalForm({
  mode,
  hospitalId,
  initialValues = defaultValues,
}: HospitalFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<HospitalFormValues>(initialValues);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const endpoint =
    mode === "create" ? "/api/hospitals" : `/api/hospitals/${hospitalId}`;
  const method = mode === "create" ? "POST" : "PATCH";
  const isReviewStep = currentStepIndex === steps.length - 1;

  const stepError = useMemo(() => {
    const currentStep = steps[currentStepIndex]?.id;

    if (currentStep === "identity" && !values.name.trim()) {
      return "Hospital name is required before you continue.";
    }

    if (
      currentStep === "contacts" &&
      values.contactEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail.trim())
    ) {
      return "Contact email must be a valid email address.";
    }

    return "";
  }, [currentStepIndex, values.contactEmail, values.name]);

  const summaryItems = [
    {
      label: "Identity",
      value: values.name || "Missing name",
      detail: [values.code || "No code", values.city || "No city"]
        .filter(Boolean)
        .join(" | "),
    },
    {
      label: "Address",
      value: values.addressLine1 || "No primary address",
      detail: [values.addressLine2, values.city, values.country]
        .filter(Boolean)
        .join(", "),
    },
    {
      label: "Contact",
      value: values.contactName || "No contact name",
      detail: [values.contactEmail, values.contactPhone]
        .filter(Boolean)
        .join(" | "),
    },
    {
      label: "Service Context",
      value: values.serviceRegion || "No service region",
      detail: values.serviceNotes || "No service notes recorded.",
    },
  ];

  function updateField<Key extends keyof HospitalFormValues>(
    key: Key,
    nextValue: HospitalFormValues[Key],
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
            setError(data.message ?? "Failed to save hospital.");
            return;
          }

          const data = (await response.json()) as { hospital: { id: string } };
          router.push(`/registry/hospitals/${data.hospital.id}`);
          router.refresh();
        });
      }}
    >
      <GuidedIntakeFlowShell
        eyebrow="Registry / Hospitals"
        title={mode === "create" ? "Hospital Guided Intake" : "Edit Hospital Guided Intake"}
        description={
          mode === "create"
            ? "This pilot mirrors the prototype intake logic: move through identity, address, contacts, and service context before the hospital record becomes reusable registry data."
            : "Edit the hospital record through the same guided structure so the registry stays complete and consistent."
        }
        stepLabel={`Step ${currentStepIndex + 1} / ${steps.length}`}
        currentStepIndex={currentStepIndex}
        steps={steps}
        helper={
          <div className="rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-4 text-sm leading-6 text-[#d5e2ef]">
            <p className="font-semibold text-white">Prototype parity target</p>
            <p className="mt-2">
              Orange primary actions, compact decision blocks, and a dedicated
              process summary are now part of the registry intake pattern.
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
                    ? "Review the full hospital snapshot before saving."
                    : "Continue step by step. You can move back without losing entered data."}
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
                      ? "Create hospital"
                      : "Save hospital"
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
              label="Hospital name"
              hint="This is the primary registry label used across systems and service cases."
            >
              <input
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={fieldClassName(true)}
                placeholder="Vilniaus klinika"
              />
            </StepField>

            <StepField
              label="Hospital code"
              hint="Short code used in tables and quick references."
            >
              <input
                value={values.code}
                onChange={(event) => updateField("code", event.target.value)}
                className={fieldClassName()}
                placeholder="VKL"
              />
            </StepField>

            <StepField
              label="City"
              hint="Used in operational overviews and route planning."
            >
              <input
                value={values.city}
                onChange={(event) => updateField("city", event.target.value)}
                className={fieldClassName()}
                placeholder="Vilnius"
              />
            </StepField>

            <StepField
              label="Country"
              hint="Helps standardize registry geography as more entities are added."
            >
              <input
                value={values.country}
                onChange={(event) => updateField("country", event.target.value)}
                className={fieldClassName()}
                placeholder="Lithuania"
              />
            </StepField>
          </div>
        ) : null}

        {steps[currentStepIndex]?.id === "address" ? (
          <div className="grid gap-5">
            <div className="rounded-[1.4rem] border border-[#dce7f2] bg-[#f4f8fc] px-4 py-4 text-sm leading-7 text-[#38536d]">
              Keep the serviceable address close to the record. This is the
              location technicians and coordinators will recognize first.
            </div>

            <StepField label="Address line 1">
              <input
                value={values.addressLine1}
                onChange={(event) =>
                  updateField("addressLine1", event.target.value)
                }
                className={fieldClassName(true)}
                placeholder="Santariskiu g. 4"
              />
            </StepField>

            <StepField label="Address line 2">
              <input
                value={values.addressLine2}
                onChange={(event) =>
                  updateField("addressLine2", event.target.value)
                }
                className={fieldClassName()}
                placeholder="Radiology wing, level 2"
              />
            </StepField>
          </div>
        ) : null}

        {steps[currentStepIndex]?.id === "contacts" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <StepField label="Primary contact">
              <input
                value={values.contactName}
                onChange={(event) =>
                  updateField("contactName", event.target.value)
                }
                className={fieldClassName(true)}
                placeholder="Rasa Valuckiene"
              />
            </StepField>

            <StepField label="Contact phone">
              <input
                value={values.contactPhone}
                onChange={(event) =>
                  updateField("contactPhone", event.target.value)
                }
                className={fieldClassName()}
                placeholder="+370 612 44001"
              />
            </StepField>

            <StepField
              label="Contact email"
              hint="Optional, but validated when provided."
            >
              <input
                value={values.contactEmail}
                onChange={(event) =>
                  updateField("contactEmail", event.target.value)
                }
                className={fieldClassName(true)}
                placeholder="service@hospital.lt"
              />
            </StepField>

            <div className="rounded-[1.4rem] border border-[#ffe0c2] bg-[#fff5eb] px-4 py-4 text-sm leading-7 text-[#7a4a17]">
              Add the person your team actually coordinates with. This keeps
              service dispatch and follow-up faster than relying on a general
              switchboard number.
            </div>
          </div>
        ) : null}

        {steps[currentStepIndex]?.id === "service" ? (
          <div className="grid gap-5">
            <StepField label="Service region">
              <input
                value={values.serviceRegion}
                onChange={(event) =>
                  updateField("serviceRegion", event.target.value)
                }
                className={fieldClassName(true)}
                placeholder="Vilnius region"
              />
            </StepField>

            <StepField
              label="Service notes"
              hint="Capture site-specific handling details, preferred time windows, or escalation notes."
            >
              <textarea
                value={values.serviceNotes}
                onChange={(event) =>
                  updateField("serviceNotes", event.target.value)
                }
                className={`${fieldClassName()} min-h-36 resize-y`}
                placeholder="Preferred preventive maintenance before morning patient lists."
              />
            </StepField>
          </div>
        ) : null}

        {steps[currentStepIndex]?.id === "review" ? (
          <div className="space-y-5">
            <div className="rounded-[1.4rem] border border-[#d7e3f0] bg-[#edf4fb] px-5 py-4 text-sm leading-7 text-[#38536d]">
              This review step is the checkpoint that makes the flow useful:
              confirm the hospital identity, address, contacts, and service
              context before the record becomes reusable registry data.
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
              Need to compare this flow with the original registry list first?
              <Link
                href="/registry/hospitals"
                className="ml-2 font-semibold text-[#0f2742] underline decoration-[#ff8b2b] underline-offset-4"
              >
                Open hospital registry
              </Link>
            </div>
          </div>
        ) : null}
      </GuidedIntakeFlowShell>
    </form>
  );
}
