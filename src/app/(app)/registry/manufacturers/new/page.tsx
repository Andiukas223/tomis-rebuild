import { PageHeader } from "@/components/app/page-header";
import { ManufacturerForm } from "@/components/registry/manufacturer-form";

export default function NewManufacturerPage() {
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
