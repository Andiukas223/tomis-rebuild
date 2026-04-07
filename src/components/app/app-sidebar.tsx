"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NavigationGroup } from "@/lib/navigation";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getBestMatchingChild(pathname: string, group: NavigationGroup) {
  if (!group.children?.length) {
    return null;
  }

  const matches = group.children.filter((child) => isActive(pathname, child.href));
  if (!matches.length) {
    return null;
  }

  return matches.sort((left, right) => right.href.length - left.href.length)[0];
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
  const [openGroup, setOpenGroup] = useState<string | null>(() => {
    return (
      navigationGroups.find((group) => isActive(pathname, group.href))?.label ??
      null
    );
  });

  return (
    <aside className="border-r border-white/6 bg-[var(--navy)] text-slate-100">
      <div className="sticky top-0 flex h-screen flex-col overflow-y-auto px-0 py-5">
        <div className="px-4">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/28">
            Organization
          </p>
          <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white">
            {organizationName ?? "No organization selected"}
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-2">
          {navigationGroups.map((group) => {
            const hasChildren = Boolean(group.children?.length);
            const active = isActive(pathname, group.href);
            const matchedChild = getBestMatchingChild(pathname, group);
            const expanded = hasChildren && (openGroup === group.label || active);

            return (
              <div key={group.label}>
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroup((current) =>
                        current === group.label ? null : group.label,
                      )
                    }
                    className={`block w-full border-l-2 px-4 py-2.5 text-left transition-colors ${
                      active
                        ? "border-[var(--orange)] bg-white/10 text-white"
                        : expanded
                          ? "border-transparent bg-white/8 text-white/90"
                          : "border-transparent text-white/58 hover:bg-white/7 hover:text-white/88"
                    }`}
                    aria-expanded={expanded}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">{group.label}</div>
                      <div
                        className={`text-[10px] transition-transform duration-200 ${
                          expanded
                            ? "rotate-180 text-[var(--orange-light)]"
                            : "text-white/36"
                        }`}
                      >
                        ^
                      </div>
                    </div>
                  </button>
                ) : (
                  <Link
                    href={group.href}
                    className={`block border-l-2 px-4 py-2.5 text-left transition-colors ${
                      active
                        ? "border-[var(--orange)] bg-white/10 text-white"
                        : "border-transparent text-white/58 hover:bg-white/7 hover:text-white/88"
                    }`}
                  >
                    <div className="text-sm font-semibold">{group.label}</div>
                  </Link>
                )}

                <div
                  className={`grid overflow-hidden transition-all duration-200 ease-out ${
                    expanded
                      ? "mt-2 grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0">
                    <div className="mx-2 rounded-[var(--radius-lg)] border border-white/10 bg-[rgba(255,255,255,0.06)] p-3 shadow-[var(--shadow-soft)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">
                        {group.label} info
                      </p>
                      <p className="mt-2 text-xs leading-5 text-white/72">
                        {group.description}
                      </p>
                      <div className="mt-3 flex flex-col gap-2">
                        {group.children?.map((child) => {
                          const childActive = matchedChild?.href === child.href;

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs font-semibold transition-colors ${
                                childActive
                                  ? "border border-[var(--orange)] bg-[var(--orange)] text-white shadow-[0_8px_18px_rgba(224,112,32,0.22)]"
                                  : "border border-white/12 bg-transparent text-white/82 hover:border-white/24 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mx-4 mt-6 rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/38">
            Rebuild status
          </p>
          <p className="mt-3 text-sm leading-6 text-white/68">
            Registry now follows prototype-style guided intake, and shell
            styling is moving toward full prototype parity.
          </p>
        </div>
      </div>
    </aside>
  );
}
