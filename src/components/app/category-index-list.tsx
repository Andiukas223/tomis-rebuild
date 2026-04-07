import Link from "next/link";

type CategoryIndexItem = {
  title: string;
  href: string;
  description: string;
  count?: string | number;
  meta?: string;
};

type CategoryIndexListProps = {
  eyebrow?: string;
  title: string;
  items: CategoryIndexItem[];
};

export function CategoryIndexList({
  eyebrow,
  title,
  items,
}: CategoryIndexListProps) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
      <div className="border-b border-[var(--border)] px-4 py-3">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-1 text-base font-bold text-[var(--navy)]">{title}</h3>
      </div>
      <div>
        {items.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-start gap-4 border-b border-[var(--border)] px-4 py-3 transition-colors hover:bg-[var(--navy-pale)]/35 last:border-b-0"
          >
            <div className="pt-0.5">
              <span className="inline-flex min-w-8 justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {item.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                {item.description}
              </p>
            </div>
            <div className="min-w-[74px] text-right">
              {item.count !== undefined ? (
                <p className="font-mono text-lg font-bold leading-none text-[var(--navy)]">
                  {item.count}
                </p>
              ) : null}
              {item.meta ? (
                <p className="mt-1 text-[11px] leading-4 text-[var(--text-muted)]">
                  {item.meta}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
