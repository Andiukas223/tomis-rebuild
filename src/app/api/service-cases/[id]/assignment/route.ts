import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireServerCapability } from "@/lib/server-session";

type ServiceCaseAssignmentRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type AssignmentBody = {
  assignedUserId?: string | null;
};

export async function PATCH(
  request: Request,
  { params }: ServiceCaseAssignmentRouteProps,
) {
  const { user, response } = await requireServerCapability("service.dispatch");

  if (response || !user) {
    return response!;
  }

  const { id } = await params;
  const body = (await request.json()) as AssignmentBody;
  const assignedUserId = body.assignedUserId?.trim() || null;

  const existing = await db.serviceCase.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      assignedUser: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  let nextAssignedUser:
    | {
        id: string;
        fullName: string;
      }
    | null = null;

  if (assignedUserId) {
    nextAssignedUser = await db.user.findFirst({
      where: {
        id: assignedUserId,
        organizationId: user.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    if (!nextAssignedUser) {
      return NextResponse.json(
        { message: "Selected technician was not found." },
        { status: 400 },
      );
    }
  }

  if (existing.assignedUserId === assignedUserId) {
    return NextResponse.json(
      {
        serviceCase: {
          id: existing.id,
          assignedUserId: existing.assignedUserId,
          assignedUser: existing.assignedUser,
        },
      },
      { status: 200 },
    );
  }

  const serviceCase = await db.$transaction(async (tx) => {
    const updated = await tx.serviceCase.update({
      where: { id },
      data: {
        assignedUserId,
      },
      select: {
        id: true,
        assignedUserId: true,
        assignedUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    await tx.serviceAssignmentEvent.create({
      data: {
        serviceCaseId: existing.id,
        changedById: user.id,
        previousAssigneeId: existing.assignedUser?.id ?? null,
        previousAssigneeName: existing.assignedUser?.fullName ?? null,
        newAssigneeId: nextAssignedUser?.id ?? null,
        newAssigneeName: nextAssignedUser?.fullName ?? null,
      },
    });

    return updated;
  });

  return NextResponse.json({ serviceCase }, { status: 200 });
}
