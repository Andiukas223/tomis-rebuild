import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteServiceAttachment, readServiceAttachment } from "@/lib/service-attachments";
import { getServerSessionRecord, requireServerCapability } from "@/lib/server-session";

type RouteContext = {
  params: Promise<{
    id: string;
    attachmentId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSessionRecord();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, attachmentId } = await context.params;
  const attachment = await db.serviceAttachment.findFirst({
    where: {
      id: attachmentId,
      serviceCaseId: id,
      serviceCase: {
        organizationId: session.user.organizationId,
      },
    },
  });

  if (!attachment) {
    return NextResponse.json(
      { message: "Attachment was not found." },
      { status: 404 },
    );
  }

  try {
    const file = await readServiceAttachment(attachment.storageKey);

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": attachment.contentType,
        "Content-Length": attachment.sizeBytes.toString(),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Stored attachment file is missing." },
      { status: 404 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { user, response } = await requireServerCapability("service.manage");

  if (!user) {
    return response!;
  }

  const { id, attachmentId } = await context.params;
  const attachment = await db.serviceAttachment.findFirst({
    where: {
      id: attachmentId,
      serviceCaseId: id,
      serviceCase: {
        organizationId: user.organizationId,
      },
    },
  });

  if (!attachment) {
    return NextResponse.json(
      { message: "Attachment was not found." },
      { status: 404 },
    );
  }

  await db.serviceAttachment.delete({
    where: {
      id: attachment.id,
    },
  });
  await deleteServiceAttachment(attachment.storageKey);

  return NextResponse.json({ ok: true }, { status: 200 });
}
