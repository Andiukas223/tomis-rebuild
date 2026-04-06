import { PageHeader } from "@/components/app/page-header";
import { HospitalForm } from "@/components/registry/hospital-form";

export default function NewHospitalPage() {
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
