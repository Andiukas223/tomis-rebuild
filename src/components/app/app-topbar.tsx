"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function AppTopbar() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const initials = (user?.name ?? "Guest")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="border-b border-white/8 bg-[var(--navy)] text-white">
      <div className="flex min-h-[50px] flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[18px] font-bold tracking-[-0.03em] text-white">
              tradintek
            </p>
          </div>
          <div className="hidden h-5 w-px bg-white/15 lg:block" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--steel-light)]">
              Service IS
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/catalog/systems"
            className="rounded-[var(--radius-sm)] border border-white/14 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/12"
          >
            Systems module
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="rounded-[var(--radius-sm)] border border-white/14 bg-transparent px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            Sign out
          </button>
          <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--orange)] text-[11px] font-bold text-white">
              {initials}
            </div>
            <div className="text-xs font-medium text-white/85">
              {user?.name ?? "Guest"} | {user?.role ?? "No role"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
