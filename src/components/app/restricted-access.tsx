import { PageHeader } from "@/components/app/page-header";

type RestrictedAccessProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function RestrictedAccess({
  eyebrow,
  title,
  description,
}: RestrictedAccessProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50/80 px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Restricted
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
          This page is not available for your role
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Your account can still view the related module, but create and edit
          access is limited to users with the required management permissions.
        </p>
      </section>
    </div>
  );
}
