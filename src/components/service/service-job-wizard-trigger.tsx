"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type WizardState = {
  step: number;
  cus: string;
  device: string;
  issue: string;
  contact: string;
  mob: string;
  fe: string;
  svc: string;
  diagStart: number | null;
  diagEnd: number | null;
  diagRunning: boolean;
  travelDiag: string;
  diagnosticsNotes: string;
  hasContract: boolean | null;
  hasWarranty: boolean | null;
  quotationRef: string;
  quotationOk: boolean | null;
  partsRequired: string;
  partsInWarehouse: boolean | null;
  rfqReference: string;
  edd: string;
  partsDelivered: boolean | null;
  repairStart: number | null;
  repairEnd: number | null;
  repairRunning: boolean;
  travelRepair: string;
  partDoa: boolean | null;
  returnToVendor: boolean | null;
  returnAddress: string;
  invoiceRef: string;
  expensesNotes: string;
  checklist: boolean[];
};

type WizardStep = {
  id: string;
  label: string;
};

type WizardInfoTone = "default" | "warning" | "success" | "danger";

type ServiceJobWizardTriggerProps = {
  label: string;
  className: string;
  startStep?: number;
  title?: string;
  subtitle?: string;
};

const engineerOptions = [
  "A. Lomavas",
  "J. Kazlauskas",
  "R. Petraitis",
  "T. Simkus",
  "M. Petrauskas",
  "Self-assign",
];

const checklistItems = [
  "POA/ADA signed by client",
  "Acceptance report signed",
  "Invoice created",
  "Expenses logged",
  "Counter reset for scheduled jobs",
];

const wizardSteps: WizardStep[] = [
  { id: "job-info", label: "Job Info" },
  { id: "assign-fe", label: "Assign FE" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "contract", label: "Contract" },
  { id: "parts", label: "Parts" },
  { id: "repair", label: "Repair" },
  { id: "completion", label: "Completion" },
  { id: "summary", label: "Summary" },
];

function createInitialState(step = 0): WizardState {
  return {
    step,
    cus: "",
    device: "",
    issue: "",
    contact: "",
    mob: "",
    fe: "",
    svc: "",
    diagStart: null,
    diagEnd: null,
    diagRunning: false,
    travelDiag: "",
    diagnosticsNotes: "",
    hasContract: null,
    hasWarranty: null,
    quotationRef: "",
    quotationOk: null,
    partsRequired: "",
    partsInWarehouse: null,
    rfqReference: "",
    edd: "",
    partsDelivered: null,
    repairStart: null,
    repairEnd: null,
    repairRunning: false,
    travelRepair: "",
    partDoa: null,
    returnToVendor: null,
    returnAddress: "",
    invoiceRef: "",
    expensesNotes: "",
    checklist: [false, false, false, false, false],
  };
}

function formatTimerDuration(start: number | null, end: number | null, running: boolean) {
  if (!start) {
    return "00:00:00";
  }

  const endPoint = running ? Date.now() : end ?? start;
  const totalSeconds = Math.max(0, Math.floor((endPoint - start) / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-[11px] text-[var(--text-muted)]">{children}</p>;
}

function InfoBox({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children: ReactNode;
  tone?: WizardInfoTone;
}) {
  const toneClasses: Record<WizardInfoTone, string> = {
    default: "border-[#c8d8ea] bg-[#eef5fb] text-[#36506b]",
    warning: "border-[#f0c77b] bg-[#fff7e6] text-[#8a5a12]",
    success: "border-[#b9dec9] bg-[#edf9f1] text-[#1d7b48]",
    danger: "border-[#efb9b9] bg-[#fff1f1] text-[#9e2e2e]",
  };

  return (
    <div className={`rounded-[4px] border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-xs font-bold">{title}</p>
      <div className="mt-1 text-sm leading-6">{children}</div>
    </div>
  );
}

function DecisionCard({
  icon,
  label,
  description,
  selected,
  tone,
  onClick,
}: {
  icon: string;
  label: string;
  description: string;
  selected: boolean;
  tone: "yes" | "no" | "neutral";
  onClick: () => void;
}) {
  const toneClasses =
    tone === "yes"
      ? selected
        ? "border-[#1e8f53] bg-[#edf9f1]"
        : "border-[var(--border)] bg-white hover:border-[#1e8f53] hover:bg-[#f5fcf7]"
      : tone === "no"
        ? selected
          ? "border-[#c94b4b] bg-[#fff1f1]"
          : "border-[var(--border)] bg-white hover:border-[#c94b4b] hover:bg-[#fff7f7]"
        : selected
          ? "border-[#2a63b7] bg-[#eef5ff]"
          : "border-[var(--border)] bg-white hover:border-[#2a63b7] hover:bg-[#f6faff]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border-2 px-4 py-4 text-center transition-colors ${toneClasses}`}
    >
      <div className="text-[26px]">{icon}</div>
      <p className="mt-1 text-[13px] font-bold text-[var(--foreground)]">{label}</p>
      <p className="mt-1 text-[11px] text-[var(--text-muted)]">{description}</p>
    </button>
  );
}

function TimerPanel({
  label,
  value,
  running,
  done,
  onStart,
  onStop,
}: {
  label: string;
  value: string;
  running: boolean;
  done: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="rounded-lg bg-[var(--navy)] px-5 py-4 text-center text-white">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
        {label}
      </p>
      <div
        className={`mt-3 font-mono text-4xl tracking-[0.18em] ${
          running ? "text-[#6ADFA0]" : done ? "text-[#FFB15C]" : "text-white/45"
        }`}
      >
        {value}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {!running && !done ? (
          <button
            type="button"
            onClick={onStart}
            className="rounded-[var(--radius-sm)] bg-[#1e8f53] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#167143]"
          >
            Start
          </button>
        ) : null}
        {running ? (
          <button
            type="button"
            onClick={onStop}
            className="rounded-[var(--radius-sm)] bg-[#c94b4b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#aa3636]"
          >
            Stop
          </button>
        ) : null}
        {done && !running ? (
          <span className="rounded-[var(--radius-sm)] border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
            Recorded: {value}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ServiceJobWizardTrigger({
  label,
  className,
  startStep = 0,
  title = "New Service Job",
  subtitle,
}: ServiceJobWizardTriggerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, setNowTick] = useState(0);
  const [wizard, setWizard] = useState<WizardState>(() => createInitialState(startStep));

  const currentStep = wizardSteps[wizard.step];
  const diagTimerValue = formatTimerDuration(
    wizard.diagStart,
    wizard.diagEnd,
    wizard.diagRunning,
  );
  const repairTimerValue = formatTimerDuration(
    wizard.repairStart,
    wizard.repairEnd,
    wizard.repairRunning,
  );

  useEffect(() => {
    if (!open || (!wizard.diagRunning && !wizard.repairRunning)) {
      return;
    }

    const timer = window.setInterval(() => {
      setNowTick(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, wizard.diagRunning, wizard.repairRunning]);

  function openWizard(targetStep = startStep) {
    setWizard(createInitialState(targetStep));
    setOpen(true);
  }

  function closeWizard() {
    setOpen(false);
    setWizard(createInitialState(startStep));
  }

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setWizard((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleChecklist(index: number) {
    setWizard((current) => ({
      ...current,
      checklist: current.checklist.map((item, itemIndex) =>
        itemIndex === index ? !item : item,
      ),
    }));
  }

  function continueWizard() {
    if (wizard.step === wizardSteps.length - 1) {
      const jobId = `VM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      window.alert(`Service job submitted: ${jobId}`);
      closeWizard();
      router.push("/service");
      router.refresh();
      return;
    }

    setWizard((current) => ({
      ...current,
      step: Math.min(current.step + 1, wizardSteps.length - 1),
    }));
  }

  function goBack() {
    setWizard((current) => ({
      ...current,
      step: Math.max(current.step - 1, 0),
    }));
  }

  function renderStepContent() {
    switch (wizard.step) {
      case 0:
        return (
          <div className="space-y-4">
            <InfoBox title="Job entry">
              This is the entry point from a customer request. Capture the primary issue before routing the work further.
            </InfoBox>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel>Customer</FieldLabel>
                <input value={wizard.cus} onChange={(e) => update("cus", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
              </div>
              <div>
                <FieldLabel>Device / System</FieldLabel>
                <input value={wizard.device} onChange={(e) => update("device", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <FieldLabel>Issue description</FieldLabel>
              <textarea value={wizard.issue} onChange={(e) => update("issue", e.target.value)} className="min-h-[92px] w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel>Contact person</FieldLabel>
                <input value={wizard.contact} onChange={(e) => update("contact", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
              </div>
              <div>
                <FieldLabel>Contact mobile</FieldLabel>
                <input value={wizard.mob} onChange={(e) => update("mob", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <InfoBox title="Assignment">
              Assign the field engineer and record the service conditions before technical work begins.
            </InfoBox>
            <div>
              <FieldLabel>Assign FE</FieldLabel>
              <select value={wizard.fe} onChange={(e) => update("fe", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm">
                <option value="">Select engineer</option>
                {engineerOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <FieldHint>Choose a named engineer or self-assign to the current coordinator.</FieldHint>
            </div>
            <div>
              <FieldLabel>Service conditions</FieldLabel>
              <input value={wizard.svc} onChange={(e) => update("svc", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
              <FieldHint>Record contract numbers, rate terms, or SLA notes.</FieldHint>
            </div>
            <InfoBox tone="warning" title="Verification">
              Verify what contracts are valid before moving into diagnostics and warranty checks.
            </InfoBox>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <InfoBox title="Diagnostics phase">
              Start diagnostics when on-site work begins and stop it when the investigation phase is complete.
            </InfoBox>
            <TimerPanel
              label="Diag timer"
              value={diagTimerValue}
              running={wizard.diagRunning}
              done={Boolean(wizard.diagStart && wizard.diagEnd)}
              onStart={() =>
                setWizard((current) => ({
                  ...current,
                  diagRunning: true,
                  diagStart: Date.now(),
                  diagEnd: null,
                }))
              }
              onStop={() =>
                setWizard((current) => ({
                  ...current,
                  diagRunning: false,
                  diagEnd: Date.now(),
                }))
              }
            />
            <div>
              <FieldLabel>Travel time (minutes)</FieldLabel>
              <input type="number" value={wizard.travelDiag} onChange={(e) => update("travelDiag", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
            </div>
            <div>
              <FieldLabel>Diagnostics notes</FieldLabel>
              <textarea value={wizard.diagnosticsNotes} onChange={(e) => update("diagnosticsNotes", e.target.value)} className="min-h-[92px] w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <InfoBox title="Contract assessment">
              Determine whether the customer has a valid contract and whether the system is under warranty.
            </InfoBox>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">Does the customer have a service / maintenance contract?</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <DecisionCard icon="✅" label="Yes - Contract exists" description="Proceed to warranty check" tone="yes" selected={wizard.hasContract === true} onClick={() => update("hasContract", true)} />
                <DecisionCard icon="❌" label="No - No contract" description="Quotation required" tone="no" selected={wizard.hasContract === false} onClick={() => update("hasContract", false)} />
              </div>
            </div>
            {wizard.hasContract === true ? (
              <div className="space-y-4">
                <p className="text-sm font-bold text-[var(--foreground)]">Is the system under warranty or vendor service contract?</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <DecisionCard icon="🛡️" label="Yes - Under warranty" description="2nd opinion and RFQ to vendor" tone="yes" selected={wizard.hasWarranty === true} onClick={() => update("hasWarranty", true)} />
                  <DecisionCard icon="🛠" label="No - Not under warranty" description="Order materials and logistics" tone="no" selected={wizard.hasWarranty === false} onClick={() => update("hasWarranty", false)} />
                </div>
                {wizard.hasWarranty === true ? (
                  <InfoBox tone="warning" title="2nd Opinion Required">
                    Attach the vendor email confirmation to the part order before RFQ handling continues.
                  </InfoBox>
                ) : null}
              </div>
            ) : null}
            {wizard.hasContract === false ? (
              <div className="space-y-4">
                <InfoBox tone="warning" title="Quotation required">
                  This request needs a quotation before materials or warranty-style escalation can continue.
                </InfoBox>
                <div>
                  <FieldLabel>Quotation reference</FieldLabel>
                  <input value={wizard.quotationRef} onChange={(e) => update("quotationRef", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">Quotation confirmed by customer?</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <DecisionCard icon="✅" label="Yes - Confirmed" description="Proceed to parts and logistics" tone="yes" selected={wizard.quotationOk === true} onClick={() => update("quotationOk", true)} />
                    <DecisionCard icon="⏳" label="Pending" description="Waiting for customer response" tone="neutral" selected={wizard.quotationOk === false} onClick={() => update("quotationOk", false)} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <InfoBox title="Parts and logistics">
              Capture the required materials and decide whether warehouse stock is enough or vendor ordering is needed.
            </InfoBox>
            <div>
              <FieldLabel>Parts / materials required</FieldLabel>
              <textarea value={wizard.partsRequired} onChange={(e) => update("partsRequired", e.target.value)} className="min-h-[92px] w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">Do we have the required parts in the warehouse?</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <DecisionCard icon="🏭" label="Yes - In warehouse" description="Proceed using local stock" tone="yes" selected={wizard.partsInWarehouse === true} onClick={() => update("partsInWarehouse", true)} />
                <DecisionCard icon="📋" label="No - Order from vendor" description="Open RFQ and wait for logistics" tone="no" selected={wizard.partsInWarehouse === false} onClick={() => update("partsInWarehouse", false)} />
              </div>
            </div>
            {wizard.partsInWarehouse === false ? (
              <div className="space-y-4">
                <InfoBox tone="warning" title="Vendor order flow">
                  RFQ and delivery expectations should be captured here so the repair queue stays realistic.
                </InfoBox>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <FieldLabel>RFQ reference</FieldLabel>
                    <input value={wizard.rfqReference} onChange={(e) => update("rfqReference", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <FieldLabel>Estimated delivery date</FieldLabel>
                    <input type="date" value={wizard.edd} onChange={(e) => update("edd", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">Parts delivered?</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <DecisionCard icon="✅" label="Delivered" description="Ready for repair execution" tone="yes" selected={wizard.partsDelivered === true} onClick={() => update("partsDelivered", true)} />
                    <DecisionCard icon="⏳" label="Awaiting delivery" description="Still in logistics pipeline" tone="neutral" selected={wizard.partsDelivered === false} onClick={() => update("partsDelivered", false)} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <InfoBox title="Repair">
              Record repair execution separately from diagnostics so travel and bench time stay clear.
            </InfoBox>
            <TimerPanel
              label="Repair timer"
              value={repairTimerValue}
              running={wizard.repairRunning}
              done={Boolean(wizard.repairStart && wizard.repairEnd)}
              onStart={() =>
                setWizard((current) => ({
                  ...current,
                  repairRunning: true,
                  repairStart: Date.now(),
                  repairEnd: null,
                }))
              }
              onStop={() =>
                setWizard((current) => ({
                  ...current,
                  repairRunning: false,
                  repairEnd: Date.now(),
                }))
              }
            />
            <div>
              <FieldLabel>Travel time (minutes)</FieldLabel>
              <input type="number" value={wizard.travelRepair} onChange={(e) => update("travelRepair", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
            </div>
            {wizard.repairEnd ? (
              <div className="space-y-4">
                <p className="text-sm font-bold text-[var(--foreground)]">Is any replaced part dead on arrival (DOA)?</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <DecisionCard icon="✅" label="No - Part OK" description="Proceed to completion" tone="yes" selected={wizard.partDoa === false} onClick={() => update("partDoa", false)} />
                  <DecisionCard icon="💀" label="Yes - DOA" description="Re-order replacement part" tone="no" selected={wizard.partDoa === true} onClick={() => update("partDoa", true)} />
                </div>
                {wizard.partDoa === true ? (
                  <InfoBox tone="danger" title="DOA - Re-order required">
                    Issue a new RFQ and restart the logistics cycle for the failed replacement part.
                  </InfoBox>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <InfoBox tone="success" title="Completion and sign-off">
              Capture the administrative finish so the job is ready for handoff, invoicing, and closure.
            </InfoBox>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">Should replaced parts be returned to the vendor?</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <DecisionCard icon="🔁" label="Yes - Return" description="Track vendor return path" tone="yes" selected={wizard.returnToVendor === true} onClick={() => update("returnToVendor", true)} />
                <DecisionCard icon="♻️" label="No - Recycle" description="Local disposal route" tone="neutral" selected={wizard.returnToVendor === false} onClick={() => update("returnToVendor", false)} />
              </div>
            </div>
            {wizard.returnToVendor === true ? (
              <div>
                <FieldLabel>Return address / vendor</FieldLabel>
                <input value={wizard.returnAddress} onChange={(e) => update("returnAddress", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
              </div>
            ) : null}
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">Completion checklist</p>
              <div className="mt-3 rounded-lg border border-[var(--border)]">
                {checklistItems.map((item, index) => (
                  <button key={item} type="button" onClick={() => toggleChecklist(index)} className="flex w-full items-center gap-3 border-b border-[var(--border)] px-4 py-3 text-left last:border-b-0">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-[4px] border text-xs ${wizard.checklist[index] ? "border-[#1e8f53] bg-[#1e8f53] text-white" : "border-[var(--border-mid)] bg-white text-transparent"}`}>
                      ✓
                    </span>
                    <span className="text-sm text-[var(--foreground)]">{item}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Invoice reference</FieldLabel>
              <input value={wizard.invoiceRef} onChange={(e) => update("invoiceRef", e.target.value)} className="w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
            </div>
            <div>
              <FieldLabel>Expenses notes</FieldLabel>
              <textarea value={wizard.expensesNotes} onChange={(e) => update("expensesNotes", e.target.value)} className="min-h-[92px] w-full rounded-[4px] border border-[var(--border-mid)] px-3 py-2 text-sm" />
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <InfoBox tone="success" title="Job summary - ready to submit">
              Review the key service inputs before creating the final job record.
            </InfoBox>
            <div className="overflow-hidden rounded-lg border border-[var(--border)]">
              {[
                ["Customer", wizard.cus || "-"],
                ["System / Device", wizard.device || "-"],
                ["Assigned FE", wizard.fe || "-"],
                ["Diagnostics time", diagTimerValue !== "00:00:00" ? diagTimerValue : "-"],
                ["Contract status", wizard.hasContract === null ? "-" : wizard.hasContract ? "Contract exists" : "No contract"],
                ["Warranty status", wizard.hasWarranty === null ? "-" : wizard.hasWarranty ? "Under warranty" : "Not under warranty"],
                ["Parts source", wizard.partsInWarehouse === null ? "-" : wizard.partsInWarehouse ? "Warehouse" : "Vendor order"],
                ["Repair time", repairTimerValue !== "00:00:00" ? repairTimerValue : "-"],
                ["Part DOA", wizard.partDoa === null ? "-" : wizard.partDoa ? "Yes" : "No"],
                ["Parts return", wizard.returnToVendor === null ? "-" : wizard.returnToVendor ? "Return to vendor" : "Recycle"],
                ["Checklist", `${wizard.checklist.filter(Boolean).length} / ${wizard.checklist.length} completed`],
              ].map(([key, value]) => (
                <div key={key} className="grid grid-cols-[180px_minmax(0,1fr)] border-b border-[var(--border)] px-4 py-3 text-sm last:border-b-0">
                  <p className="font-semibold text-[var(--text-mid)]">{key}</p>
                  <p className="font-mono text-[var(--foreground)]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <button type="button" onClick={() => openWizard(startStep)} className={className}>
        {label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/65 p-4">
          <div className="max-h-[92vh] w-full max-w-[680px] overflow-hidden rounded-lg bg-white shadow-[0_28px_90px_rgba(15,23,42,0.45)]">
            <div className="border-t-4 border-[var(--orange)] bg-[var(--dark)] px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">{title}</h2>
                  <p className="mt-1 text-sm text-white/75">
                    {subtitle ?? `Step ${wizard.step + 1} of ${wizardSteps.length} - ${currentStep.label}`}
                  </p>
                </div>
                <button type="button" onClick={closeWizard} className="rounded-[var(--radius-sm)] border border-white/15 px-2.5 py-1 text-sm text-white/85 transition-colors hover:bg-white/10" aria-label="Close wizard">
                  ×
                </button>
              </div>
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-5 py-5">
              <div className="overflow-x-auto pb-4">
                <div className="flex min-w-max items-start gap-2">
                  {wizardSteps.map((step, index) => {
                    const isDone = index < wizard.step;
                    const isActive = index === wizard.step;

                    return (
                      <div key={step.id} className="flex items-start gap-2">
                        <div className="flex w-[56px] shrink-0 flex-col items-center">
                          <div className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border text-[11px] font-bold ${isDone ? "border-[#1e8f53] bg-[#1e8f53] text-white" : isActive ? "border-[var(--orange)] bg-[var(--orange)] text-white" : "border-[var(--border-mid)] bg-white text-[var(--text-muted)]"}`}>
                            {isDone ? "✓" : index + 1}
                          </div>
                          <p className={`mt-2 text-center text-[9.5px] leading-4 ${isActive ? "font-bold text-[var(--orange)]" : "text-[var(--text-muted)]"}`}>
                            {step.label}
                          </p>
                        </div>
                        {index < wizardSteps.length - 1 ? <div className={`mt-3 h-[2px] w-6 shrink-0 ${isDone ? "bg-[#1e8f53]" : "bg-[var(--border-mid)]"}`} /> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4">{renderStepContent()}</div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeWizard}
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={goBack}
                  disabled={wizard.step === 0}
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-muted)]">
                  {wizard.step + 1} / {wizardSteps.length}
                </span>
                <button type="button" onClick={continueWizard} className="rounded-[var(--radius-sm)] bg-[var(--orange)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--orange-dark)]">
                  {wizard.step === wizardSteps.length - 1 ? "Submit Job" : "Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
