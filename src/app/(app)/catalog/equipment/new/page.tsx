import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { EquipmentForm } from "@/components/catalog/equipment-form";

export const dynamic = "force-dynamic";

export default async function NewEquipmentPage() {
  const user = await getServerSessionUser();

  if (!hasCapability(user, "catalog.manage")) {
    return (
      <RestrictedAccess
        eyebrow="Catalog / Equipment"
        title="Create equipment"
        description="Only catalog managers can create equipment records."
      />
    );
  }

  const manufacturers = user
    ? await db.manufacturer.findMany({
        where: {
          organizationId: user.organizationId,
        },
        orderBy: [{ name: "asc" }],
        select: {
          id: true,
          name: true,
          country: true,
        },
      })
    : [];

  const systems = user
    ? await db.system.findMany({
        where: {
          organizationId: user.organizationId,
        },
        orderBy: [{ code: "asc" }],
        select: {
          id: true,
          code: true,
          name: true,
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Equipment"
        title="Create equipment"
        description="This create flow extends the manufacturer-linked catalog pattern into equipment and technical asset tracking."
      />

      <EquipmentForm
        mode="create"
        manufacturers={manufacturers}
        systems={systems}
      />
    </div>
  );
}
