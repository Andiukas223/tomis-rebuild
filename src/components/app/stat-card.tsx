type StatCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-2 font-mono text-[28px] font-bold leading-none text-[var(--navy)]">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{detail}</p>
    </article>
  );
}
