import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { HospitalForm } from "@/components/registry/hospital-form";

export default async function NewHospitalPage() {
  const user = await getServerSessionUser();

  if (!hasCapability(user, "registry.manage")) {
    return (
      <RestrictedAccess
        eyebrow="Registry / Hospitals"
        title="Create hospital"
        description="Only registry managers can create hospital records."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Hospitals"
        title="Create hospital"
        description="This create flow establishes the editable registry pattern for master data screens in the rebuild."
      />

      <HospitalForm mode="create" />
    </div>
  );
}
