import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { SystemForm } from "@/components/catalog/system-form";

export const dynamic = "force-dynamic";

export default async function NewSystemPage() {
  const user = await getServerSessionUser();

  if (!hasCapability(user, "catalog.manage")) {
    return (
      <RestrictedAccess
        eyebrow="Catalog / Systems"
        title="Create system"
        description="Only catalog managers can create systems."
      />
    );
  }

  const hospitals = user
    ? await db.hospital.findMany({
        where: {
          organizationId: user.organizationId,
        },
        orderBy: [{ name: "asc" }],
        select: {
          id: true,
          name: true,
          city: true,
        },
      })
    : [];

  const equipmentOptions = user
    ? await db.equipment.findMany({
        where: {
          organizationId: user.organizationId,
          OR: [{ systemId: null }],
        },
        orderBy: [{ code: "asc" }],
        select: {
          id: true,
          code: true,
          name: true,
          model: true,
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog / Systems"
        title="Create system"
        description="This is the first create flow in the rebuild. It establishes the form pattern that future modules can reuse."
      />

      <SystemForm
        mode="create"
        hospitals={hospitals}
        equipmentOptions={equipmentOptions}
      />
    </div>
  );
}
