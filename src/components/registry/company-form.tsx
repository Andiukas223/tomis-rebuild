"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GuidedIntakeFlowShell,
  GuidedIntakeStep,
} from "@/components/guided-intake/guided-intake-flow-shell";

export type CompanyFormValues = {
  name: string;
  code: string;
  vatCode: string;
  city: string;
  country: string;
  addressLine1: string;
  addressLine2: string;
  website: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

type CompanyFormProps = {
  mode: "create" | "edit";
  companyId?: string;
  initialValues?: CompanyFormValues;
};

const defaultValues: CompanyFormValues = {
  name: "",
  code: "",
  vatCode: "",
  city: "",
  country: "Lithuania",
  addressLine1: "",
  addressLine2: "",
  website: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
};

const steps: GuidedIntakeStep[] = [
  {
    id: "identity",
    title: "Identity",
    description: "Capture the visible company identity used across documents.",
  },
  {
    id: "commercial",
    title: "Commercial",
    description: "Store legal and business details needed for future workflows.",
  },
  {
    id: "address",
    title: "Address",
    description: "Record the physical address used in commercial coordination.",
  },
  {
    id: "contacts",
    title: "Contacts",
    description: "Save the main relationship owner and communication details.",
  },
  {
    id: "review",
    title: "Review",
    description: "Review the full company snapshot before saving.",
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

export function CompanyForm({
  mode,
  companyId,
  initialValues = defaultValues,
}: CompanyFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CompanyFormValues>(initialValues);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const endpoint =
    mode === "create" ? "/api/companies" : `/api/companies/${companyId}`;
  const method = mode === "create" ? "POST" : "PATCH";
  const isReviewStep = currentStepIndex === steps.length - 1;

  const stepError = useMemo(() => {
    const currentStep = steps[currentStepIndex]?.id;

    if (currentStep === "identity" && !values.name.trim()) {
      return "Company name is required before you continue.";
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

  function updateField<Key extends keyof CompanyFormValues>(
    key: Key,
    nextValue: CompanyFormValues[Key],
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
      value: values.name || "Missing company name",
      detail: [values.code || "No code", values.city || "No city"]
        .filter(Boolean)
        .join(" | "),
    },
    {
      label: "Commercial",
      value: values.vatCode || "No VAT code",
      detail: values.website || "No website recorded",
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
      value: values.contactName || "No contact owner",
      detail: [values.contactEmail, values.contactPhone]
        .filter(Boolean)
        .join(" | "),
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
            setError(data.message ?? "Failed to save company.");
            return;
          }

          const data = (await response.json()) as { company: { id: string } };
          router.push(`/registry/companies/${data.company.id}`);
          router.refresh();
        });
      }}
    >
      <GuidedIntakeFlowShell
        eyebrow="Registry / Companies"
        title={mode === "create" ? "Company Guided Intake" : "Edit Company Guided Intake"}
        description={
          mode === "create"
            ? "This second Guided Intake Flow pilot extends the prototype pattern into company records, combining identity, commercial data, address, and contacts before save."
            : "Use the same guided sequence to keep company master data complete, reviewable, and consistent."
        }
        stepLabel={`Step ${currentStepIndex + 1} / ${steps.length}`}
        currentStepIndex={currentStepIndex}
        steps={steps}
        helper={
          <div className="rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-4 text-sm leading-6 text-[#d5e2ef]">
            <p className="font-semibold text-white">Commercial registry flow</p>
            <p className="mt-2">
              This flow is meant for denser business records, especially where
              legal and contact data should be reviewed before activation.
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
                    ? "Review the commercial record before saving it to the registry."
                    : "Continue step by step. You can move back without losing progress."}
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
                      ? "Create company"
                      : "Save company"
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
              label="Company name"
              hint="This label will appear in future orders, documents, and linked operational workflows."
            >
              <input
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={fieldClassName(true)}
                placeholder="Tradintek, Lietuva, UAB"
              />
            </StepField>

            <StepField label="Company code" hint="Internal or legal company code.">
              <input
                value={values.code}
                onChange={(event) => updateField("code", event.target.value)}
                className={fieldClassName()}
                placeholder="302512994"
              />
            </StepField>

            <StepField label="City">
              <input
                value={values.city}
                onChange={(event) => updateField("city", event.target.value)}
                className={fieldClassName()}
                placeholder="Vilnius"
              />
            </StepField>

            <StepField label="Country">
              <input
                value={values.country}
                onChange={(event) => updateField("country", event.target.value)}
                className={fieldClassName()}
                placeholder="Lithuania"
              />
            </StepField>
          </div>
        ) : null}

        {steps[currentStepIndex]?.id === "commercial" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <StepField label="VAT code" hint="Useful for legal and future billing flows.">
              <input
                value={values.vatCode}
                onChange={(event) => updateField("vatCode", event.target.value)}
                className={fieldClassName(true)}
                placeholder="LT100005129944"
              />
            </StepField>

            <StepField label="Website" hint="Optional public company reference.">
              <input
                value={values.website}
                onChange={(event) => updateField("website", event.target.value)}
                className={fieldClassName()}
                placeholder="https://www.tradintek.com"
              />
            </StepField>

            <div className="rounded-[1.4rem] border border-[#ffe0c2] bg-[#fff5eb] px-4 py-4 text-sm leading-7 text-[#7a4a17] md:col-span-2">
              Keep the commercial step compact: legal identifiers and a simple
              public reference are enough for now. We can deepen this later when
              order and document modules need more structure.
            </div>
          </div>
        ) : null}

        {steps[currentStepIndex]?.id === "address" ? (
          <div className="grid gap-5">
            <StepField label="Address line 1">
              <input
                value={values.addressLine1}
                onChange={(event) =>
                  updateField("addressLine1", event.target.value)
                }
                className={fieldClassName(true)}
                placeholder="Laisves pr. 77C"
              />
            </StepField>

            <StepField label="Address line 2">
              <input
                value={values.addressLine2}
                onChange={(event) =>
                  updateField("addressLine2", event.target.value)
                }
                className={fieldClassName()}
                placeholder="Office 412"
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
                placeholder="Andrejus Lomovas"
              />
            </StepField>

            <StepField label="Contact phone">
              <input
                value={values.contactPhone}
                onChange={(event) =>
                  updateField("contactPhone", event.target.value)
                }
                className={fieldClassName()}
                placeholder="+370 612 55001"
              />
            </StepField>

            <StepField label="Contact email" hint="Validated if provided.">
              <input
                value={values.contactEmail}
                onChange={(event) =>
                  updateField("contactEmail", event.target.value)
                }
                className={fieldClassName(true)}
                placeholder="contact@company.example"
              />
            </StepField>

            <div className="rounded-[1.4rem] border border-[#dce7f2] bg-[#f4f8fc] px-4 py-4 text-sm leading-7 text-[#38536d]">
              Use the person who will actually own coordination with your team,
              not just a general inbox, whenever possible.
            </div>
          </div>
        ) : null}

        {steps[currentStepIndex]?.id === "review" ? (
          <div className="space-y-5">
            <div className="rounded-[1.4rem] border border-[#d7e3f0] bg-[#edf4fb] px-5 py-4 text-sm leading-7 text-[#38536d]">
              Review the commercial identity, address, and relationship owner
              before the company becomes shared registry data.
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
              Want to compare against the existing company registry first?
              <Link
                href="/registry/companies"
                className="ml-2 font-semibold text-[#0f2742] underline decoration-[#ff8b2b] underline-offset-4"
              >
                Open company registry
              </Link>
            </div>
          </div>
        ) : null}
      </GuidedIntakeFlowShell>
    </form>
  );
}
