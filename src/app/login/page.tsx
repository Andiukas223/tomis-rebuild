import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = resolvedSearchParams.next || "/dashboard";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_28%),linear-gradient(180deg,_#eff6ff_0%,_#ffffff_100%)] px-6 py-12">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_25px_70px_rgba(15,23,42,0.08)] backdrop-blur md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            Public area
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Login experience for the rebuild.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            The rebuild now uses a real database-backed session flow. This
            screen is the entry point into the protected business shell and
            will keep evolving into the long-term authentication experience.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-slate-100">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
                Live now
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>Email or username login</li>
                <li>Secure refresh and logout flow</li>
                <li>Organization-aware access control</li>
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Next up
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Role-specific policies, password reset flows, and audit-focused
                access management will build on this baseline.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_25px_70px_rgba(15,23,42,0.08)] md:p-10">
          <LoginForm nextPath={nextPath} />
        </section>
      </div>
    </main>
  );
}
