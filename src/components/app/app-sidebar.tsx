"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationGroup } from "@/lib/navigation";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type AppSidebarProps = {
  organizationName: string | null;
  navigationGroups: NavigationGroup[];
};

export function AppSidebar({
  organizationName,
  navigationGroups,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-r border-slate-200/80 bg-slate-950 text-slate-100">
      <div className="sticky top-0 flex h-screen flex-col overflow-y-auto px-4 py-5">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
            Organization
          </p>
          <div className="mt-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white">
            {organizationName ?? "No organization selected"}
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-2">
          {navigationGroups.map((group) => {
            const active = isActive(pathname, group.href);

            return (
              <div
                key={group.label}
                className="rounded-[1.25rem] border border-transparent bg-transparent transition-colors"
              >
                <Link
                  href={group.href}
                  className={`block rounded-[1.1rem] px-4 py-3 transition-colors ${
                    active
                      ? "bg-sky-400 text-slate-950"
                      : "text-slate-200 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <div className="text-sm font-semibold">{group.label}</div>
                  <div
                    className={`mt-1 text-xs leading-5 ${
                      active ? "text-slate-900/75" : "text-slate-400"
                    }`}
                  >
                    {group.description}
                  </div>
                </Link>

                {active && group.children?.length ? (
                  <div className="mt-2 space-y-1 px-2 pb-2">
                    {group.children.map((child) => {
                      const childActive = isActive(pathname, child.href);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block rounded-xl px-3 py-2 text-sm transition-colors ${
                            childActive
                              ? "bg-white/14 text-white"
                              : "text-slate-400 hover:bg-white/8 hover:text-slate-200"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Rebuild status
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Shell, navigation, and the first reference module are now active.
          </p>
        </div>
      </div>
    </aside>
  );
}
