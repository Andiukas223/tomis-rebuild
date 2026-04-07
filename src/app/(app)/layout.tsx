import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/app/app-shell";
import { navigationGroups } from "@/lib/navigation";
import { getNavigationGroupsForRole } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getServerSessionUser();
  const visibleGroups = getNavigationGroupsForRole(user, navigationGroups);

  return (
    <AuthGuard>
      <AppShell
        navigationGroups={visibleGroups}
        organizationName={user?.organizationName ?? null}
      >
        {children}
      </AppShell>
    </AuthGuard>
  );
}
