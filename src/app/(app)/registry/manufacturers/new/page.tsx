import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { ManufacturerForm } from "@/components/registry/manufacturer-form";

export default async function NewManufacturerPage() {
  const user = await getServerSessionUser();

  if (!hasCapability(user, "registry.manage")) {
    return (
      <RestrictedAccess
        eyebrow="Registry / Manufacturers"
        title="Create manufacturer"
        description="Only registry managers can create manufacturer records."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Manufacturers"
        title="Create manufacturer"
        description="This create flow extends the registry master-data pattern to manufacturers and future catalog relationships."
      />

      <ManufacturerForm mode="create" />
    </div>
  );
}
