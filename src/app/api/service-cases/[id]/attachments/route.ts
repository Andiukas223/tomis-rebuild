import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteServiceAttachment, MAX_SERVICE_ATTACHMENT_BYTES, saveServiceAttachment } from "@/lib/service-attachments";
import { requireServerCapability } from "@/lib/server-session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { user, response } = await requireServerCapability("service.manage");

  if (!user) {
    return response!;
  }

  const { id } = await context.params;
  const serviceCase = await db.serviceCase.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!serviceCase) {
    return NextResponse.json(
      { message: "Service case was not found." },
      { status: 404 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "Choose a file to upload." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { message: "The selected file is empty." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SERVICE_ATTACHMENT_BYTES) {
    return NextResponse.json(
      { message: "Attachment exceeds the 10 MB limit." },
      { status: 400 },
    );
  }

  const savedFile = await saveServiceAttachment(file);

  try {
    const attachment = await db.serviceAttachment.create({
      data: {
        fileName: savedFile.fileName,
        storageKey: savedFile.storageKey,
        contentType: savedFile.contentType,
        sizeBytes: savedFile.sizeBytes,
        serviceCaseId: serviceCase.id,
        uploadedById: user.id,
      },
      include: {
        uploadedBy: true,
      },
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    await deleteServiceAttachment(savedFile.storageKey);
    throw error;
  }
}
