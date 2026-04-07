type MetricStripItem = {
  label: string;
  value: string | number;
  detail?: string;
  tone?: "default" | "accent" | "warning" | "danger" | "success";
};

type MetricStripProps = {
  items: MetricStripItem[];
};

const toneClasses: Record<NonNullable<MetricStripItem["tone"]>, string> = {
  default: "border-[var(--border)] text-[var(--foreground)]",
  accent: "border-[var(--steel-light)] text-[var(--navy)]",
  warning: "border-[#f0d6a8] text-[#a56b00]",
  danger: "border-[#f1c3c3] text-[#b63737]",
  success: "border-[#b9dec9] text-[#1a8a50]",
};

export function MetricStrip({ items }: MetricStripProps) {
  return (
    <section className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
      <div className="grid min-w-full grid-cols-1 divide-y divide-[var(--border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.label}
            className={`min-w-[180px] border-l-2 px-4 py-3 ${
              toneClasses[item.tone ?? "default"]
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {item.label}
              </p>
              <p className="font-mono text-[22px] font-bold leading-none">
                {item.value}
              </p>
            </div>
            {item.detail ? (
              <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                {item.detail}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
