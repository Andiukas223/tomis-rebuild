"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function AppTopbar() {
  const router = useRouter();
  const { logout, user } = useAuth();

  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Tomis rebuild
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-950">
            Protected application shell
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/catalog/systems"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Systems module
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Sign out
          </button>
          <div className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
            {user?.name ?? "Guest"} · {user?.role ?? "No role"}
          </div>
        </div>
      </div>
    </header>
  );
}
