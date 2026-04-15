export const DEMO_ADMIN_USERNAME = "anlo";
export const DEMO_ADMIN_EMAIL = "anlo@tradintek.local";
export const DEMO_ADMIN_PASSWORD = "dev-admin-pass";

export function isDemoAdminIdentity(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  return (
    normalizedValue === DEMO_ADMIN_USERNAME.toLowerCase() ||
    normalizedValue === DEMO_ADMIN_EMAIL.toLowerCase()
  );
}
