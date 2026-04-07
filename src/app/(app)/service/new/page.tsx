import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import {
  ServiceCaseForm,
  type ServiceCaseFormValues,
} from "@/components/service/service-case-form";

export const dynamic = "force-dynamic";

type NewServiceCasePageProps = {
  searchParams: Promise<{
    systemId?: string;
    equipmentId?: string;
  }>;
};

export default async function NewServiceCasePage({
  searchParams,
}: NewServiceCasePageProps) {
  const user = await getServerSessionUser();

  if (!hasCapability(user, "service.manage")) {
    return (
      <RestrictedAccess
        eyebrow="Service"
        title="Create service case"
        description="Only service users with case management access can create service work."
      />
    );
  }

  const { systemId = "", equipmentId = "" } = await searchParams;
  const normalizedSystemId = systemId.trim();
  const normalizedEquipmentId = equipmentId.trim();

  const [systems, equipment, assignees, preselectedEquipment] = user
    ? await Promise.all([
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
        db.equipment.findMany({
          where: {
            organizationId: user.organizationId,
          },
          orderBy: [{ code: "asc" }],
          select: {
            id: true,
            code: true,
            name: true,
            systemId: true,
          },
        }),
        db.user.findMany({
          where: {
            organizationId: user.organizationId,
            isActive: true,
          },
          orderBy: [{ fullName: "asc" }],
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        }),
        normalizedEquipmentId
          ? db.equipment.findFirst({
              where: {
                id: normalizedEquipmentId,
                organizationId: user.organizationId,
              },
              select: {
                id: true,
                systemId: true,
              },
            })
          : null,
      ])
    : [[], [], [], null];

  const initialValues: ServiceCaseFormValues = {
    code: "",
    title: "",
    summary: "",
    workPerformed: "",
    resolution: "",
    followUpRequired: false,
    followUpActions: "",
    status: "Open",
    priority: "Medium",
    scheduledAt: "",
    completedAt: "",
    systemId: normalizedSystemId || preselectedEquipment?.systemId || "",
    equipmentId: preselectedEquipment?.id ?? "",
    assignedUserId: "",
    tasks: [
      {
        title: "Review issue and confirm scope",
        notes: "",
        isCompleted: false,
        dueAt: "",
        assignedUserId: "",
      },
      {
        title: "Perform technical work",
        notes: "",
        isCompleted: false,
        dueAt: "",
        assignedUserId: "",
      },
      {
        title: "Update service notes and close case",
        notes: "",
        isCompleted: false,
        dueAt: "",
        assignedUserId: "",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service"
        title="Create service case"
        description="Capture a new service request, planned visit, or maintenance job and tie it directly to the affected system."
      />

      <ServiceCaseForm
        mode="create"
        systems={systems}
        equipment={equipment}
        assignees={assignees}
        initialValues={initialValues}
      />
    </div>
  );
}
