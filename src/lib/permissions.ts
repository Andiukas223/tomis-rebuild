import type { SessionUser } from "@/lib/session";
import type { NavigationGroup } from "@/lib/navigation";

export type AppRole =
  | "Administrator"
  | "Service Coordinator"
  | "Field Engineer"
  | "Operations Viewer";

export type AppCapability =
  | "dashboard.view"
  | "catalog.view"
  | "catalog.manage"
  | "registry.view"
  | "registry.manage"
  | "service.view"
  | "service.manage"
  | "service.dispatch"
  | "service.reports"
  | "documents.view"
  | "documents.manage"
  | "sales.view"
  | "tasks.view"
  | "warehouse.view"
  | "office.view"
  | "administration.view";

const roleCapabilities: Record<AppRole, AppCapability[]> = {
  Administrator: [
    "dashboard.view",
    "catalog.view",
    "catalog.manage",
    "registry.view",
    "registry.manage",
    "service.view",
    "service.manage",
    "service.dispatch",
    "service.reports",
    "documents.view",
    "documents.manage",
    "sales.view",
    "tasks.view",
    "warehouse.view",
    "office.view",
    "administration.view",
  ],
  "Service Coordinator": [
    "dashboard.view",
    "catalog.view",
    "registry.view",
    "service.view",
    "service.manage",
    "service.dispatch",
    "service.reports",
    "documents.view",
    "documents.manage",
    "tasks.view",
  ],
  "Field Engineer": [
    "dashboard.view",
    "catalog.view",
    "service.view",
    "service.manage",
    "documents.view",
    "tasks.view",
  ],
  "Operations Viewer": [
    "dashboard.view",
    "catalog.view",
    "service.view",
    "documents.view",
    "tasks.view",
  ],
};

const navigationCapabilityMap: Record<string, AppCapability> = {
  "/dashboard": "dashboard.view",
  "/catalog": "catalog.view",
  "/catalog/systems": "catalog.view",
  "/catalog/products": "catalog.view",
  "/catalog/equipment": "catalog.view",
  "/sales": "sales.view",
  "/service": "service.view",
  "/service/tasks": "service.view",
  "/service/reports": "service.reports",
  "/service/process-flow": "service.view",
  "/tasks": "tasks.view",
  "/warehouse": "warehouse.view",
  "/documents": "documents.view",
  "/office": "office.view",
  "/registry": "registry.view",
  "/registry/hospitals": "registry.view",
  "/registry/companies": "registry.view",
  "/registry/manufacturers": "registry.view",
  "/administration": "administration.view",
};

function normalizeRole(role: string): AppRole {
  if (role === "Administrator") {
    return role;
  }

  if (role === "Service Coordinator") {
    return role;
  }

  if (role === "Operations Viewer") {
    return role;
  }

  return "Field Engineer";
}

export function getCapabilitiesForRole(role: string) {
  return roleCapabilities[normalizeRole(role)];
}

export function hasCapability(
  userOrRole: SessionUser | string | null | undefined,
  capability: AppCapability,
) {
  if (!userOrRole) {
    return false;
  }

  const role = typeof userOrRole === "string" ? userOrRole : userOrRole.role;
  return getCapabilitiesForRole(role).includes(capability);
}

export function getNavigationGroupsForRole(
  userOrRole: SessionUser | string | null | undefined,
  groups: NavigationGroup[],
) {
  return groups
    .filter((group) => hasCapability(userOrRole, navigationCapabilityMap[group.href]))
    .map((group) => ({
      ...group,
      children: group.children?.filter((child) =>
        hasCapability(userOrRole, navigationCapabilityMap[child.href]),
      ),
    }));
}

export function canAccessPath(
  userOrRole: SessionUser | string | null | undefined,
  href: string,
) {
  const matchedEntry = Object.entries(navigationCapabilityMap).find(([path]) =>
    href === path || href.startsWith(`${path}/`),
  );

  if (!matchedEntry) {
    return true;
  }

  return hasCapability(userOrRole, matchedEntry[1]);
}
