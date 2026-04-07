import type { NavigationGroup } from "@/lib/navigation";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";

type AppShellProps = {
  children: React.ReactNode;
  navigationGroups: NavigationGroup[];
  organizationName: string | null;
};

export function AppShell({
  children,
  navigationGroups,
  organizationName,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[210px_1fr]">
        <AppSidebar
          organizationName={organizationName}
          navigationGroups={navigationGroups}
        />
        <div className="flex min-h-screen flex-col">
          <AppTopbar />
          <main className="flex-1 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
