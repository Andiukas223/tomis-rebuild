"use client";

import { ReactNode } from "react";

export type GuidedIntakeStep = {
  id: string;
  title: string;
  description: string;
};

type GuidedIntakeFlowShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  stepLabel: string;
  currentStepIndex: number;
  steps: GuidedIntakeStep[];
  helper?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
};

export function GuidedIntakeFlowShell({
  eyebrow,
  title,
  description,
  stepLabel,
  currentStepIndex,
  steps,
  helper,
  children,
  footer,
}: GuidedIntakeFlowShellProps) {
  const currentStep = steps[currentStepIndex];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#d6dde8] bg-[#f4f7fb] shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="border-b border-[#d6dde8] bg-[#0f2742] px-6 py-6 text-white md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8db2d5]">
              {eyebrow}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#ffb15c]">
                {stepLabel}
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c9d8e8]">
              {description}
            </p>
          </div>
          {helper ? <div className="max-w-sm">{helper}</div> : null}
        </div>
      </div>

      <div className="border-b border-[#d6dde8] bg-white px-6 py-5 md:px-8">
        <ol className="grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => {
            const isComplete = index < currentStepIndex;
            const isActive = index === currentStepIndex;

            return (
              <li
                key={step.id}
                className={`rounded-[1.4rem] border px-4 py-4 transition-colors ${
                  isActive
                    ? "border-[#ff9a3d] bg-[#fff5ea] shadow-[0_12px_25px_rgba(255,154,61,0.18)]"
                    : isComplete
                      ? "border-[#c9e2d1] bg-[#f3fbf5]"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                      isActive
                        ? "bg-[#ff8b2b] text-white"
                        : isComplete
                          ? "bg-[#1e8f53] text-white"
                          : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isActive ? "text-[#0f2742]" : "text-slate-800"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white px-6 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Current step
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#0f2742]">
              {currentStep.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {currentStep.description}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            {children}
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white px-6 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            {footer}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border border-[#d7e3f0] bg-[#edf4fb] px-5 py-5 shadow-[0_18px_35px_rgba(15,39,66,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4c6a87]">
              View Process Flow
            </p>
            <p className="mt-3 text-sm font-semibold text-[#0f2742]">
              Guided Intake Flow
            </p>
            <p className="mt-2 text-sm leading-7 text-[#38536d]">
              This intake mirrors the prototype pattern: capture one operational
              block at a time, then confirm the full registry record before save.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-[#ffe0c2] bg-[#fff5eb] px-5 py-5 shadow-[0_18px_35px_rgba(255,154,61,0.1)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9c5b1d]">
              Flow Guidance
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-[#7a4a17]">
              <li>Use the orange action to continue only after the step is complete.</li>
              <li>Keep contact and service notes close to the registry record.</li>
              <li>Review the full hospital snapshot before creating the record.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
