import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireServerCapability } from "@/lib/server-session";

type ServiceTaskRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: ServiceTaskRouteProps) {
  const { user, response } = await requireServerCapability("service.manage");

  if (!user) {
    return response!;
  }

  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    notes?: string | null;
    dueAt?: string | null;
    assignedUserId?: string | null;
    isCompleted?: boolean;
  };
  const title = body.title?.trim();
  const notes = body.notes?.trim() || null;
  const assignedUserId = body.assignedUserId?.trim() || null;
  const dueAt = body.dueAt?.trim() || null;
  const isCompleted = typeof body.isCompleted === "boolean" ? body.isCompleted : undefined;

  const existing = await db.serviceTask.findFirst({
    where: {
      id,
      serviceCase: {
        organizationId: user.organizationId,
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (dueAt && Number.isNaN(Date.parse(dueAt))) {
    return NextResponse.json({ message: "Due date is invalid." }, { status: 400 });
  }

  if (assignedUserId) {
    const assignee = await db.user.findFirst({
      where: {
        id: assignedUserId,
        organizationId: user.organizationId,
        isActive: true,
      },
    });

    if (!assignee) {
      return NextResponse.json(
        { message: "Selected task assignee was not found." },
        { status: 400 },
      );
    }
  }

  const task = await db.serviceTask.update({
    where: { id },
    data: {
      ...(typeof title === "string" && title.length > 0 ? { title } : {}),
      notes,
      dueAt: dueAt ? new Date(dueAt) : null,
      assignedUserId,
      ...(typeof isCompleted === "boolean"
        ? {
            isCompleted,
            completedAt: isCompleted ? existing.completedAt ?? new Date() : null,
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      notes: true,
      dueAt: true,
      assignedUserId: true,
      isCompleted: true,
      completedAt: true,
      assignedUser: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json({ task }, { status: 200 });
}
