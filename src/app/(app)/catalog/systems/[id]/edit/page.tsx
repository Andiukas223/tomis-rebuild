import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { SystemForm } from "@/components/catalog/system-form";

type EditSystemPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditSystemPage({
  params,
}: EditSystemPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  const { id } = await params;

  const system = await db.system.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      hospital: true,
      equipment: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!system) {
    notFound();
  }

  const hospitals = await db.hospital.findMany({
    where: {
      organizationId: user.organizationId,
    },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      city: true,
    },
  });

  const equipmentOptions = await db.equipment.findMany({
    where: {
      organizationId: user.organizationId,
      OR: [{ systemId: null }, { systemId: system.id }],
    },
    orderBy: [{ code: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
      model: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Systems"
        title={`Edit ${system.name}`}
        description="This edit screen extends the first real CRUD workflow and sets the pattern for future update forms."
      />

      <SystemForm
        mode="edit"
        systemId={system.id}
        hospitals={hospitals}
        initialValues={{
          code: system.code,
          name: system.name,
          serialNumber: system.serialNumber ?? "",
          hospitalId: system.hospitalId,
          status: system.status,
          equipmentIds: system.equipment.map((equipment) => equipment.id),
        }}
        equipmentOptions={equipmentOptions}
      />
    </div>
  );
}
