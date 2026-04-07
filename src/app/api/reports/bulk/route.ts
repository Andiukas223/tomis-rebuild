import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireServerCapability } from "@/lib/server-session";

function getValidIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
}

export async function PATCH(request: Request) {
  const { user, response } = await requireServerCapability("documents.manage");

  if (response || !user) {
    return response!;
  }

  const body = (await request.json().catch(() => ({}))) as {
    ids?: string[];
    workflowStatus?: string;
    isPinned?: boolean;
  };

  const ids = getValidIds(body.ids);

  if (ids.length === 0) {
    return NextResponse.json(
      { message: "At least one report must be selected." },
      { status: 400 },
    );
  }

  const hasStatusUpdate = typeof body.workflowStatus === "string";
  const hasPinUpdate = typeof body.isPinned === "boolean";

  if (!hasStatusUpdate && !hasPinUpdate) {
    return NextResponse.json(
      { message: "At least one bulk update field must be provided." },
      { status: 400 },
    );
  }

  const result = await db.generatedReport.updateMany({
    where: {
      id: {
        in: ids,
      },
      organizationId: user.organizationId,
    },
    data: {
      ...(hasStatusUpdate
        ? {
            workflowStatus:
              body.workflowStatus === "Shared" ||
              body.workflowStatus === "Archived"
                ? body.workflowStatus
                : "Draft",
          }
        : {}),
      ...(hasPinUpdate ? { isPinned: body.isPinned } : {}),
    },
  });

  return NextResponse.json({ count: result.count }, { status: 200 });
}

export async function DELETE(request: Request) {
  const { user, response } = await requireServerCapability("documents.manage");

  if (response || !user) {
    return response!;
  }

  const body = (await request.json().catch(() => ({}))) as {
    ids?: string[];
  };
  const ids = getValidIds(body.ids);

  if (ids.length === 0) {
    return NextResponse.json(
      { message: "At least one report must be selected." },
      { status: 400 },
    );
  }

  const result = await db.generatedReport.deleteMany({
    where: {
      id: {
        in: ids,
      },
      organizationId: user.organizationId,
    },
  });

  return NextResponse.json({ count: result.count }, { status: 200 });
}
