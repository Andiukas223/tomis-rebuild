import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hasCapability } from "@/lib/permissions";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { RestrictedAccess } from "@/components/app/restricted-access";
import { DeleteServiceAttachmentButton } from "@/components/service/delete-service-attachment-button";
import { DeleteServiceCaseButton } from "@/components/service/delete-service-case-button";
import { ServiceAttachmentUploadForm } from "@/components/service/service-attachment-upload-form";
import { ServiceCaseCompletionForm } from "@/components/service/service-case-completion-form";
import { ServiceCaseStatusActions } from "@/components/service/service-case-status-actions";
import { ServiceNoteForm } from "@/components/service/service-note-form";
import { ServiceNoteItem } from "@/components/service/service-note-item";
import { ServiceTaskExecutionCard } from "@/components/service/service-task-execution-card";
import { getAttachmentSizeLabel } from "@/lib/service-attachments";

type ServiceCaseDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ActivityEntry =
  | {
      id: string;
      kind: "case";
      createdAt: Date;
      title: string;
      description: string;
      meta: string;
    }
  | {
      id: string;
      kind: "note";
      createdAt: Date;
      title: string;
      description: string;
      meta: string;
    }
  | {
      id: string;
      kind: "attachment";
      createdAt: Date;
      title: string;
      description: string;
      meta: string;
    }
  | {
      id: string;
      kind: "assignment";
      createdAt: Date;
      title: string;
      description: string;
      meta: string;
    };

export const dynamic = "force-dynamic";

export default async function ServiceCaseDetailPage({
  params,
}: ServiceCaseDetailPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

  if (!hasCapability(user, "service.view")) {
    return (
      <RestrictedAccess
        eyebrow="Service"
        title="Service case detail"
        description="Your role does not have access to service case records."
      />
    );
  }

  const canManageService = hasCapability(user, "service.manage");

  const { id } = await params;

  const serviceCase = await db.serviceCase.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      system: {
        include: {
          hospital: true,
        },
      },
      equipment: {
        include: {
          manufacturer: true,
        },
      },
      assignedUser: true,
      assignmentEvents: {
        orderBy: [{ createdAt: "desc" }],
        include: {
          changedBy: true,
        },
      },
      attachments: {
        orderBy: [{ createdAt: "desc" }],
        include: {
          uploadedBy: true,
        },
      },
      notes: {
        orderBy: [{ createdAt: "desc" }],
        include: {
          author: true,
        },
      },
      tasks: {
        orderBy: [{ sortOrder: "asc" }],
        include: {
          assignedUser: true,
          events: {
            orderBy: [{ createdAt: "desc" }],
            take: 3,
            include: {
              changedBy: true,
            },
          },
        },
      },
    },
  });

  if (!serviceCase) {
    notFound();
  }

  const assignees = await db.user.findMany({
    where: {
      organizationId: user.organizationId,
      isActive: true,
    },
    orderBy: [{ fullName: "asc" }],
    select: {
      id: true,
      fullName: true,
    },
  });

  const completedTaskCount = serviceCase.tasks.filter(
    (task) => task.isCompleted,
  ).length;
  const scheduledTaskCount = serviceCase.tasks.filter(
    (task) => task.dueAt && !task.isCompleted,
  ).length;
  const assignedTaskCount = serviceCase.tasks.filter(
    (task) => Boolean(task.assignedUserId),
  ).length;

  const activityEntries: ActivityEntry[] = [
    {
      id: `case-${serviceCase.id}`,
      kind: "case" as const,
      createdAt: serviceCase.createdAt,
      title: "Service case created",
      description: `${serviceCase.code} was opened with status ${serviceCase.status} and priority ${serviceCase.priority}.`,
      meta: serviceCase.createdAt.toLocaleString(),
    },
    ...serviceCase.notes.map((note) => ({
      id: `note-${note.id}`,
      kind: "note" as const,
      createdAt: note.createdAt,
      title: "Internal note",
      description: note.body,
      meta: `${note.author ? note.author.fullName : "Unknown author"} - ${note.createdAt.toLocaleString()}`,
    })),
    ...serviceCase.attachments.map((attachment) => ({
      id: `attachment-${attachment.id}`,
      kind: "attachment" as const,
      createdAt: attachment.createdAt,
      title: "Attachment added",
      description: attachment.fileName,
      meta: `${attachment.uploadedBy ? attachment.uploadedBy.fullName : "Unknown uploader"} - ${attachment.createdAt.toLocaleString()}`,
    })),
    ...serviceCase.assignmentEvents.map((event) => ({
      id: `assignment-${event.id}`,
      kind: "assignment" as const,
      createdAt: event.createdAt,
      title: "Technician assignment updated",
      description: event.newAssigneeName
        ? `Assignment changed from ${event.previousAssigneeName ?? "Unassigned"} to ${event.newAssigneeName}.`
        : `Assignment cleared from ${event.previousAssigneeName ?? "Unknown technician"}.`,
      meta: `${event.changedBy ? event.changedBy.fullName : "System"} - ${event.createdAt.toLocaleString()}`,
    })),
  ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service"
        title={serviceCase.title}
        description="Operational service detail view connected to the system backbone, technician assignment, task execution, notes, timeline history, stored evidence, and case completion records."
        actions={
          <>
            <Link
              href="/service"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back to service
            </Link>
            {canManageService ? (
              <Link
                href={`/service/${serviceCase.id}/edit`}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Edit case
              </Link>
            ) : null}
            {canManageService ? <DeleteServiceCaseButton id={serviceCase.id} /> : null}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Case code
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {serviceCase.code}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Status
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {serviceCase.status}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Priority
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {serviceCase.priority}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Technician
          </p>
          <p className="mt-3 text-sm font-medium text-slate-950">
            {serviceCase.assignedUser
              ? `${serviceCase.assignedUser.fullName} - ${serviceCase.assignedUser.role}`
              : "Unassigned"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Scheduled
          </p>
          <p className="mt-3 text-sm font-medium text-slate-950">
            {serviceCase.scheduledAt
              ? serviceCase.scheduledAt.toLocaleString()
              : "N/A"}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Activity items
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {activityEntries.length}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Summary</h3>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {serviceCase.summary ?? "No detailed summary has been added yet."}
              </p>
            </div>
            {canManageService ? (
              <ServiceCaseStatusActions
                id={serviceCase.id}
                currentStatus={serviceCase.status}
              />
            ) : null}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-semibold text-slate-950">Linked assets</h3>
          <div className="mt-5 space-y-5 text-sm text-slate-600">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                System
              </p>
              <Link
                href={`/catalog/systems/${serviceCase.system.id}`}
                className="mt-2 block font-medium text-sky-700 hover:underline"
              >
                {serviceCase.system.code} - {serviceCase.system.name}
              </Link>
              <p className="mt-1">
                {serviceCase.system.hospital.name}
                {serviceCase.system.hospital.city
                  ? ` - ${serviceCase.system.hospital.city}`
                  : ""}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Equipment
              </p>
              {serviceCase.equipment ? (
                <>
                  <Link
                    href={`/catalog/equipment/${serviceCase.equipment.id}`}
                    className="mt-2 block font-medium text-sky-700 hover:underline"
                  >
                    {serviceCase.equipment.code} - {serviceCase.equipment.name}
                  </Link>
                  <p className="mt-1">{serviceCase.equipment.manufacturer.name}</p>
                </>
              ) : (
                <p className="mt-2">No specific equipment is attached.</p>
              )}
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Completion record
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Capture what was done, the case outcome, and any required follow-up work.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {serviceCase.completedAt
                ? `Completed ${serviceCase.completedAt.toLocaleString()}`
                : "Open completion record"}
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Work performed
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {serviceCase.workPerformed ?? "No work log has been recorded yet."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Resolution
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {serviceCase.resolution ?? "No resolution has been recorded yet."}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">
              Follow-up required: {serviceCase.followUpRequired ? "Yes" : "No"}
            </p>
            <p className="mt-2 whitespace-pre-wrap">
              {serviceCase.followUpRequired
                ? serviceCase.followUpActions ?? "No follow-up plan has been written yet."
                : "No follow-up work is currently scheduled."}
            </p>
          </div>
          <div className="mt-5">
            {canManageService ? (
              <ServiceCaseCompletionForm
                serviceCaseId={serviceCase.id}
                initialValues={{
                  workPerformed: serviceCase.workPerformed ?? "",
                  resolution: serviceCase.resolution ?? "",
                  followUpRequired: serviceCase.followUpRequired,
                  followUpActions: serviceCase.followUpActions ?? "",
                }}
              />
            ) : null}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Task checklist</h3>
              <p className="mt-1 text-sm text-slate-600">
                Progress can now be tracked task by task directly from the service case.{" "}
                {completedTaskCount}/{serviceCase.tasks.length} complete.
              </p>
            </div>
            {canManageService ? (
              <Link
                href={`/service/${serviceCase.id}/edit`}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Edit checklist
              </Link>
            ) : null}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Assigned tasks
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {assignedTaskCount}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Scheduled tasks
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {scheduledTaskCount}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Execution coverage
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {serviceCase.tasks.length > 0
                  ? `${Math.round((assignedTaskCount / serviceCase.tasks.length) * 100)}% with owners`
                  : "No tasks yet"}
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {serviceCase.tasks.length === 0 ? (
              <p className="text-sm text-slate-600">No tasks defined for this case yet.</p>
            ) : (
              serviceCase.tasks.map((task) => (
                <ServiceTaskExecutionCard
                  key={task.id}
                  canManage={canManageService}
                  assignees={assignees}
                  task={{
                    id: task.id,
                    title: task.title,
                    notes: task.notes ?? "",
                    isCompleted: task.isCompleted,
                  dueAt: task.dueAt?.toISOString() ?? "",
                  assignedUserId: task.assignedUserId ?? "",
                  assignedUserName: task.assignedUser?.fullName ?? null,
                  completedAtLabel: task.completedAt?.toLocaleString() ?? null,
                  events: task.events.map((event) => ({
                    id: event.id,
                    eventType: event.eventType,
                    createdAtLabel: event.createdAt.toLocaleString(),
                    changedByName: event.changedBy?.fullName ?? null,
                    previousAssigneeName: event.previousAssigneeName ?? null,
                    newAssigneeName: event.newAssigneeName ?? null,
                    previousCompleted: event.previousCompleted ?? null,
                    newCompleted: event.newCompleted ?? null,
                  })),
                }}
              />
            ))
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Service notes</h3>
              <p className="mt-1 text-sm text-slate-600">
                Capture technician findings, customer updates, and the running service narrative.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {serviceCase.notes.length} entries
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {canManageService ? <ServiceNoteForm serviceCaseId={serviceCase.id} /> : null}
            {serviceCase.notes.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                No service notes yet.
              </p>
            ) : (
              serviceCase.notes.map((note) => (
                <ServiceNoteItem
                  key={note.id}
                  serviceCaseId={serviceCase.id}
                  canManage={canManageService}
                  note={{
                    id: note.id,
                    body: note.body,
                    createdAtLabel: note.createdAt.toLocaleString(),
                    updatedAtLabel: note.updatedAt.toLocaleString(),
                    authorName: note.author ? note.author.fullName : "Unknown author",
                    isEdited:
                      note.updatedAt.getTime() - note.createdAt.getTime() > 1000,
                  }}
                />
              ))
            )}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Activity timeline</h3>
              <p className="mt-1 text-sm text-slate-600">
                A single chronological view of case creation, note updates, and attachment activity.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {activityEntries.length} events
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {activityEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      entry.kind === "case"
                        ? "bg-slate-900 text-white"
                        : entry.kind === "note"
                          ? "bg-sky-100 text-sky-700"
                          : entry.kind === "attachment"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {entry.kind === "case"
                      ? "Case"
                      : entry.kind === "note"
                        ? "Note"
                        : entry.kind === "attachment"
                          ? "Attachment"
                          : "Assignment"}
                  </span>
                  <p className="text-sm font-semibold text-slate-950">{entry.title}</p>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {entry.description}
                </p>
                <p className="mt-3 text-xs text-slate-500">{entry.meta}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-semibold text-slate-950">
            Service attachments
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Upload photos, reports, signed sheets, or vendor files so the service history stays with the case.
          </p>
          <div className="mt-5 space-y-3">
            {serviceCase.attachments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                No attachments uploaded yet.
              </p>
            ) : (
              serviceCase.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <a
                      href={`/api/service-cases/${serviceCase.id}/attachments/${attachment.id}`}
                      className="text-sm font-semibold text-sky-700 hover:underline"
                    >
                      {attachment.fileName}
                    </a>
                    <p className="mt-1 text-xs text-slate-500">
                      {getAttachmentSizeLabel(attachment.sizeBytes)} - Uploaded{" "}
                      {attachment.createdAt.toLocaleString()} -{" "}
                      {attachment.uploadedBy
                        ? attachment.uploadedBy.fullName
                        : "Unknown uploader"}
                    </p>
                  </div>
                  {canManageService ? (
                    <DeleteServiceAttachmentButton
                      serviceCaseId={serviceCase.id}
                      attachmentId={attachment.id}
                    />
                  ) : null}
                </div>
              ))
            )}
          </div>

          {canManageService ? (
            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
              <ServiceAttachmentUploadForm serviceCaseId={serviceCase.id} />
            </div>
          ) : null}
        </article>
      </section>
    </div>
  );
}
