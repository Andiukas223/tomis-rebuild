import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireServerCapability } from "@/lib/server-session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireServerCapability("documents.manage");

  if (response || !user) {
    return response!;
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    isPinned?: boolean;
    workflowStatus?: string;
    label?: string | null;
  };

  const hasPinUpdate = typeof body.isPinned === "boolean";
  const hasStatusUpdate = typeof body.workflowStatus === "string";
  const hasLabelUpdate =
    typeof body.label === "string" || body.label === null;

  if (!hasPinUpdate && !hasStatusUpdate && !hasLabelUpdate) {
    return NextResponse.json(
      { message: "At least one report field must be provided." },
      { status: 400 },
    );
  }

  const report = await db.generatedReport.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!report) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const updated = await db.generatedReport.update({
    where: {
      id,
    },
    data: {
      ...(hasPinUpdate ? { isPinned: body.isPinned } : {}),
      ...(hasStatusUpdate
        ? {
            workflowStatus:
              body.workflowStatus === "Shared" ||
              body.workflowStatus === "Archived"
                ? body.workflowStatus
                : "Draft",
          }
        : {}),
      ...(hasLabelUpdate
        ? {
            label:
              typeof body.label === "string" && body.label.trim().length > 0
                ? body.label.trim()
                : null,
          }
        : {}),
    },
    select: {
      id: true,
      isPinned: true,
      workflowStatus: true,
      label: true,
    },
  });

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireServerCapability("documents.manage");

  if (response || !user) {
    return response!;
  }

  const { id } = await params;
  const report = await db.generatedReport.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!report) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await db.generatedReport.delete({
    where: {
      id,
    },
  });

  return new NextResponse(null, { status: 204 });
}
