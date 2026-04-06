type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
