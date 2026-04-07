import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import {
  ServiceCaseForm,
  type ServiceCaseFormValues,
} from "@/components/service/service-case-form";

type EditServiceCasePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

function formatDateTimeLocal(value: Date | null) {
  if (!value) {
    return "";
  }

  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

export default async function EditServiceCasePage({
  params,
}: EditServiceCasePageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  if (!hasCapability(user, "service.manage")) {
    return (
      <RestrictedAccess
        eyebrow="Service"
        title="Edit service case"
        description="Only service users with case management access can update service work."
      />
    );
  }

  const { id } = await params;

  const [serviceCase, systems, equipment, assignees] = await Promise.all([
    db.serviceCase.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        tasks: {
          orderBy: [{ sortOrder: "asc" }],
        },
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
  ]);

  if (!serviceCase) {
    notFound();
  }

  const initialValues: ServiceCaseFormValues = {
    code: serviceCase.code,
    title: serviceCase.title,
    summary: serviceCase.summary ?? "",
    workPerformed: serviceCase.workPerformed ?? "",
    resolution: serviceCase.resolution ?? "",
    followUpRequired: serviceCase.followUpRequired,
    followUpActions: serviceCase.followUpActions ?? "",
    status: serviceCase.status,
    priority: serviceCase.priority,
    scheduledAt: formatDateTimeLocal(serviceCase.scheduledAt),
    completedAt: formatDateTimeLocal(serviceCase.completedAt),
    systemId: serviceCase.systemId,
    equipmentId: serviceCase.equipmentId ?? "",
    assignedUserId: serviceCase.assignedUserId ?? "",
    tasks:
      serviceCase.tasks.length > 0
        ? serviceCase.tasks.map((task) => ({
            title: task.title,
            notes: task.notes ?? "",
            isCompleted: task.isCompleted,
            dueAt: formatDateTimeLocal(task.dueAt),
            assignedUserId: task.assignedUserId ?? "",
          }))
        : [
            {
              title: "",
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
        title={`Edit ${serviceCase.code}`}
        description="Adjust scope, dates, linked assets, assignment, and task checklist without losing the service history context."
      />

      <ServiceCaseForm
        mode="edit"
        serviceCaseId={serviceCase.id}
        systems={systems}
        equipment={equipment}
        assignees={assignees}
        initialValues={initialValues}
      />
    </div>
  );
}
