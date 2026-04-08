import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { MetricStrip } from "@/components/app/metric-strip";
import { CategoryIndexList } from "@/components/app/category-index-list";
import { ServiceJobWizardTrigger } from "@/components/service/service-job-wizard-trigger";

export const dynamic = "force-dynamic";

type FlowNode = {
  icon: string;
  label: string;
  meta?: string;
  tone?: "start" | "decision" | "timer" | "action" | "process" | "default";
  step: number;
};

type FlowRow = {
  label: string;
  nodes: FlowNode[];
};

const rows: FlowRow[] = [
  {
    label: "1 - Entry & Assignment",
    nodes: [
      { icon: "▶", label: "CUS Request", tone: "start", step: 0 },
      { icon: "📝", label: "Job Info", tone: "process", step: 0 },
      { icon: "👤", label: "Assign FE", tone: "action", step: 1 },
      { icon: "🔔", label: "Notify Stakeholders", tone: "default", step: 1 },
    ],
  },
  {
    label: "2 - Diagnostics",
    nodes: [
      { icon: "⏱", label: "Start Diagnostics", tone: "timer", step: 2 },
      { icon: "🔎", label: "Collect Notes", tone: "process", step: 2 },
      { icon: "⏹", label: "Stop Timer", tone: "timer", step: 2 },
    ],
  },
  {
    label: "3 - Contract Assessment",
    nodes: [
      { icon: "❓", label: "Contract?", tone: "decision", step: 3 },
      { icon: "🛡️", label: "Warranty Check", tone: "decision", step: 3 },
      { icon: "💬", label: "Quotation", tone: "action", step: 3 },
      { icon: "✅", label: "Customer OK", tone: "default", step: 3 },
    ],
  },
  {
    label: "4 - Parts & Logistics",
    nodes: [
      { icon: "📦", label: "Parts Needed", tone: "process", step: 4 },
      { icon: "🏭", label: "Warehouse?", tone: "decision", step: 4 },
      { icon: "📋", label: "RFQ Vendor", tone: "action", step: 4 },
      { icon: "🚚", label: "Delivered", tone: "default", step: 4 },
    ],
  },
  {
    label: "5 - Repair & Completion",
    nodes: [
      { icon: "🛠", label: "Repair Start", tone: "timer", step: 5 },
      { icon: "💀", label: "DOA?", tone: "decision", step: 5 },
      { icon: "🧾", label: "Checklist", tone: "action", step: 6 },
      { icon: "■", label: "Submit Job", tone: "start", step: 7 },
    ],
  },
  {
    label: "Installation Overview",
    nodes: [
      { icon: "▶", label: "Install Entry", tone: "start", step: 0 },
      { icon: "📍", label: "Site Prep", tone: "action", step: 1 },
      { icon: "⚙", label: "Install Work", tone: "process", step: 5 },
      { icon: "✅", label: "Sign-Off", tone: "default", step: 6 },
    ],
  },
];

function nodeClasses(tone: FlowNode["tone"]) {
  switch (tone) {
    case "start":
      return "rounded-full border-[#1e1b1b] bg-[#1f1b1b] text-white";
    case "decision":
      return "border-[#dba7a7] bg-[#fff1f1] text-[#9e2e2e]";
    case "timer":
      return "border-[#9dc1e8] bg-[#eef5ff] text-[#245e9d]";
    case "action":
      return "border-[#f0c77b] bg-[#fff7e6] text-[#8a5a12]";
    case "process":
      return "border-[#c6d4e8] bg-[#f5f9ff] text-[#26415e]";
    default:
      return "border-[var(--border)] bg-white text-[var(--foreground)]";
  }
}

export default function ServiceProcessFlowPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service / Process Flow"
        title="View Process Flow"
        description="Operational flow reference for repair and installation jobs. Every node can open the multi-step service wizard at the relevant stage."
        actions={
          <>
            <Link
              href="/service"
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--text-mid)] transition-colors hover:bg-[var(--navy-pale)]"
            >
              Back to service
            </Link>
            <ServiceJobWizardTrigger
              label="+ New Service Job"
              className="rounded-[var(--radius-sm)] bg-[var(--orange)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--orange-dark)]"
            />
          </>
        }
      />

      <MetricStrip
        items={[
          { label: "Repair lanes", value: 5, detail: "Core repair process rows" },
          { label: "Installation", value: 1, detail: "Overview support lane", tone: "accent" },
          { label: "Clickable nodes", value: rows.reduce((sum, row) => sum + row.nodes.length, 0), detail: "Open wizard from any stage" },
          { label: "Wizard steps", value: 8, detail: "Conditional guided intake flow", tone: "success" },
        ]}
      />

      <CategoryIndexList
        eyebrow="Flow index"
        title="Jump to flow context"
        items={[
          {
            title: "Entry and assignment",
            href: "/service/process-flow",
            description: "Start from incoming requests and FE assignment.",
            count: "01",
            meta: "Step 1-2",
          },
          {
            title: "Contract branching",
            href: "/service/process-flow",
            description: "Contract, warranty, and quotation decisions.",
            count: "02",
            meta: "Step 4",
          },
          {
            title: "Parts and logistics",
            href: "/service/process-flow",
            description: "Warehouse and vendor-order routing.",
            count: "03",
            meta: "Step 5",
          },
          {
            title: "Completion and sign-off",
            href: "/service/process-flow",
            description: "Checklist, invoice, return, and summary submission.",
            count: "04",
            meta: "Step 7-8",
          },
        ]}
      />

      <section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        {rows.map((row) => (
          <article key={row.label} className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)]">
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Flow lane
              </p>
              <h3 className="mt-1 text-sm font-bold text-[var(--navy)]">{row.label}</h3>
            </div>
            <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-4">
              <div className="flex min-w-max items-center gap-2">
                {row.nodes.map((node, index) => (
                  <div key={`${row.label}-${node.label}`} className="flex items-center gap-2">
                    <ServiceJobWizardTrigger
                      label={`${node.icon} ${node.label}`}
                      startStep={node.step}
                      title="New Service Job"
                      subtitle={`Step ${node.step + 1} of 8 - ${node.label}`}
                      className={`min-w-[108px] rounded-[4px] border px-3 py-3 text-center text-[10.5px] font-bold shadow-sm transition-colors hover:border-[var(--orange)] hover:shadow-[0_8px_18px_rgba(224,112,32,0.16)] ${nodeClasses(node.tone)}`}
                    />
                    {index < row.nodes.length - 1 ? (
                      <div className="flex items-center gap-1">
                        <div className="h-[2px] w-7 bg-[var(--border-mid)]" />
                        <span className="text-[10px] text-[var(--text-muted)]">▶</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Legend
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["Start / End", nodeClasses("start")],
            ["Decision", nodeClasses("decision")],
            ["Timer", nodeClasses("timer")],
            ["Action Required", nodeClasses("action")],
            ["Process Step", nodeClasses("process")],
            ["Default", nodeClasses("default")],
          ].map(([label, classes]) => (
            <span key={label} className={`rounded-[4px] border px-3 py-1.5 text-xs font-semibold ${classes}`}>
              {label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
