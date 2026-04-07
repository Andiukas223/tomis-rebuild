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
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f4f7fb_0%,_#eef4fb_100%)] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
        <AppSidebar
          organizationName={organizationName}
          navigationGroups={navigationGroups}
        />
        <div className="flex min-h-screen flex-col">
          <AppTopbar />
          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
