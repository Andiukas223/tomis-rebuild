import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { ManufacturerForm } from "@/components/registry/manufacturer-form";

type EditManufacturerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditManufacturerPage({
  params,
}: EditManufacturerPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  if (!hasCapability(user, "registry.manage")) {
    return (
      <RestrictedAccess
        eyebrow="Registry / Manufacturers"
        title="Edit manufacturer"
        description="Only registry managers can update manufacturer records."
      />
    );
  }

  const { id } = await params;

  const manufacturer = await db.manufacturer.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!manufacturer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Manufacturers"
        title={`Edit ${manufacturer.name}`}
        description="This edit screen extends the registry master-data pattern to manufacturer records."
      />

      <ManufacturerForm
        mode="edit"
        manufacturerId={manufacturer.id}
        initialValues={{
          name: manufacturer.name,
          code: manufacturer.code ?? "",
          country: manufacturer.country ?? "",
          website: manufacturer.website ?? "",
        }}
      />
    </div>
  );
}
