import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import {
  EquipmentForm,
  type EquipmentFormValues,
} from "@/components/catalog/equipment-form";

type EditEquipmentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditEquipmentPage({
  params,
}: EditEquipmentPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  const { id } = await params;

  const [equipment, manufacturers, systems] = await Promise.all([
    db.equipment.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    }),
    db.manufacturer.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        country: true,
      },
    }),
    db.system.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: [{ code: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),
  ]);

  if (!equipment) {
    notFound();
  }

  const initialValues: EquipmentFormValues = {
    code: equipment.code,
    name: equipment.name,
    model: equipment.model ?? "",
    serialNumber: equipment.serialNumber ?? "",
    category: equipment.category ?? "",
    status: equipment.status,
    manufacturerId: equipment.manufacturerId,
    systemId: equipment.systemId ?? "",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Equipment"
        title={`Edit ${equipment.name}`}
        description="Use this flow to update equipment details while keeping manufacturer relationships intact."
      />

      <EquipmentForm
        mode="edit"
        equipmentId={equipment.id}
        manufacturers={manufacturers}
        systems={systems}
        initialValues={initialValues}
      />
    </div>
  );
}
