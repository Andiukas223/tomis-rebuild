import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { HospitalForm } from "@/components/registry/hospital-form";

type EditHospitalPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditHospitalPage({
  params,
}: EditHospitalPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  if (!hasCapability(user, "registry.manage")) {
    return (
      <RestrictedAccess
        eyebrow="Registry / Hospitals"
        title="Edit hospital"
        description="Only registry managers can update hospital records."
      />
    );
  }

  const { id } = await params;

  const hospital = await db.hospital.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!hospital) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry / Hospitals"
        title={`Edit ${hospital.name}`}
        description="This edit flow uses the same Guided Intake structure as hospital creation so registry records stay complete and consistent over time."
      />

      <HospitalForm
        mode="edit"
        hospitalId={hospital.id}
        initialValues={{
          name: hospital.name,
          code: hospital.code ?? "",
          city: hospital.city ?? "",
          country: hospital.country ?? "",
          addressLine1: hospital.addressLine1 ?? "",
          addressLine2: hospital.addressLine2 ?? "",
          contactName: hospital.contactName ?? "",
          contactEmail: hospital.contactEmail ?? "",
          contactPhone: hospital.contactPhone ?? "",
          serviceRegion: hospital.serviceRegion ?? "",
          serviceNotes: hospital.serviceNotes ?? "",
        }}
      />
    </div>
  );
}
