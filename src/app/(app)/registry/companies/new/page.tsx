import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { CompanyForm } from "@/components/registry/company-form";

export default async function NewCompanyPage() {
  const user = await getServerSessionUser();

  if (!hasCapability(user, "registry.manage")) {
    return (
      <RestrictedAccess
        eyebrow="Registry / Companies"
        title="Create company"
        description="Only registry managers can create company records."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Companies"
        title="Create company"
        description="This create flow extends the registry master-data pattern to companies and future commercial workflows."
      />

      <CompanyForm mode="create" />
    </div>
  );
}
