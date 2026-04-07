import { PageHeader } from "@/components/app/page-header";
import { CompanyForm } from "@/components/registry/company-form";

export default function NewCompanyPage() {
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
