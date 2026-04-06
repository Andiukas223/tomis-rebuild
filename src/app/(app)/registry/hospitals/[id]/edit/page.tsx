import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
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
        description="This edit screen extends the registry master-data pattern and keeps hospital records maintainable over time."
      />

      <HospitalForm
        mode="edit"
        hospitalId={hospital.id}
        initialValues={{
          name: hospital.name,
          code: hospital.code ?? "",
          city: hospital.city ?? "",
        }}
      />
    </div>
  );
}
