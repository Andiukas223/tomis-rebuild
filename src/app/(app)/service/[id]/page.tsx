import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { PageHeader } from "@/components/app/page-header";
import { DeleteServiceAttachmentButton } from "@/components/service/delete-service-attachment-button";
import { DeleteServiceCaseButton } from "@/components/service/delete-service-case-button";
import { ServiceAttachmentUploadForm } from "@/components/service/service-attachment-upload-form";
import { ServiceCaseStatusActions } from "@/components/service/service-case-status-actions";
import { ServiceNoteForm } from "@/components/service/service-note-form";
import { ServiceTaskToggle } from "@/components/service/service-task-toggle";
import { getAttachmentSizeLabel } from "@/lib/service-attachments";

type ServiceCaseDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ServiceCaseDetailPage({
  params,
}: ServiceCaseDetailPageProps) {
  const user = await getServerSessionUser();

  if (!user) {
    notFound();
  }

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
      },
    },
  });

  if (!serviceCase) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service"
        title={serviceCase.title}
        description="Operational service detail view connected to the system backbone, technician assignment, task execution, notes, and stored service evidence."
        actions={
          <>
            <Link
              href="/service"
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back to service
            </Link>
            <Link
              href={`/service/${serviceCase.id}/edit`}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Edit case
            </Link>
            <DeleteServiceCaseButton id={serviceCase.id} />
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
              ? `${serviceCase.assignedUser.fullName} · ${serviceCase.assignedUser.role}`
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
            Notes
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {serviceCase.notes.length}
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
            <ServiceCaseStatusActions
              id={serviceCase.id}
              currentStatus={serviceCase.status}
            />
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
                {serviceCase.system.code} · {serviceCase.system.name}
              </Link>
              <p className="mt-1">
                {serviceCase.system.hospital.name}
                {serviceCase.system.hospital.city
                  ? ` · ${serviceCase.system.hospital.city}`
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
                    {serviceCase.equipment.code} · {serviceCase.equipment.name}
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
              <h3 className="text-lg font-semibold text-slate-950">Task checklist</h3>
              <p className="mt-1 text-sm text-slate-600">
                Progress can now be tracked task by task directly from the service case.
                {" "}
                {serviceCase.tasks.filter((task) => task.isCompleted).length}/
                {serviceCase.tasks.length} complete.
              </p>
            </div>
            <Link
              href={`/service/${serviceCase.id}/edit`}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Edit checklist
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {serviceCase.tasks.length === 0 ? (
              <p className="text-sm text-slate-600">No tasks defined for this case yet.</p>
            ) : (
              serviceCase.tasks.map((task) => (
                <div
                  key={task.id}
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-[auto_minmax(0,1fr)_auto]"
                >
                  <ServiceTaskToggle taskId={task.id} checked={task.isCompleted} />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        task.isCompleted ? "text-slate-500 line-through" : "text-slate-900"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {task.isCompleted && task.completedAt
                        ? `Completed ${task.completedAt.toLocaleString()}`
                        : "Pending"}
                    </p>
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    Step {task.sortOrder + 1}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

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
            <ServiceNoteForm serviceCaseId={serviceCase.id} />
            {serviceCase.notes.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                No service notes yet.
              </p>
            ) : (
              serviceCase.notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {note.body}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    {note.author ? note.author.fullName : "Unknown author"}
                    {" · "}
                    {note.createdAt.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Service attachments
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Upload photos, reports, signed sheets, or vendor files so the
              service history stays with the case.
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
                        {getAttachmentSizeLabel(attachment.sizeBytes)}
                        {" · "}
                        Uploaded {attachment.createdAt.toLocaleString()}
                        {" · "}
                        {attachment.uploadedBy
                          ? attachment.uploadedBy.fullName
                          : "Unknown uploader"}
                      </p>
                    </div>
                    <DeleteServiceAttachmentButton
                      serviceCaseId={serviceCase.id}
                      attachmentId={attachment.id}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
            <ServiceAttachmentUploadForm serviceCaseId={serviceCase.id} />
          </div>
        </div>
      </section>
    </div>
  );
}
