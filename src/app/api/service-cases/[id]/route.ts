import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import {
  normalizeServiceCaseInput,
  validateServiceCaseInput,
} from "@/lib/service-case-input";

type ServiceCaseRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateServiceCaseBody = {
  code?: string;
  title?: string;
  summary?: string | null;
  workPerformed?: string | null;
  resolution?: string | null;
  followUpRequired?: boolean;
  followUpActions?: string | null;
  status?: string;
  priority?: string;
  scheduledAt?: string | null;
  completedAt?: string | null;
  systemId?: string;
  equipmentId?: string | null;
  assignedUserId?: string | null;
  tasks?: {
    title?: string;
    isCompleted?: boolean;
    sortOrder?: number;
  }[];
};

export async function GET(_: Request, { params }: ServiceCaseRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ serviceCase }, { status: 200 });
}

export async function PATCH(request: Request, { params }: ServiceCaseRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.serviceCase.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as UpdateServiceCaseBody;
  const input = normalizeServiceCaseInput(body);
  const validationError = validateServiceCaseInput(input);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const system = await db.system.findFirst({
    where: {
      id: input.systemId,
      organizationId: user.organizationId,
    },
  });

  if (!system) {
    return NextResponse.json(
      { message: "Selected system was not found." },
      { status: 400 },
    );
  }

  if (input.equipmentId) {
    const equipment = await db.equipment.findFirst({
      where: {
        id: input.equipmentId,
        organizationId: user.organizationId,
        systemId: input.systemId,
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { message: "Selected equipment must belong to the chosen system." },
        { status: 400 },
      );
    }
  }

  if (input.assignedUserId) {
    const assignedUser = await db.user.findFirst({
      where: {
        id: input.assignedUserId,
        organizationId: user.organizationId,
        isActive: true,
      },
    });

    if (!assignedUser) {
      return NextResponse.json(
        { message: "Selected technician was not found." },
        { status: 400 },
      );
    }
  }

  const duplicate = await db.serviceCase.findFirst({
    where: {
      code: input.code,
      NOT: {
        id,
      },
    },
  });

  if (duplicate) {
    return NextResponse.json(
      { message: "A service case with this code already exists." },
      { status: 409 },
    );
  }

  const serviceCase = await db.serviceCase.update({
    where: { id },
    data: {
      code: input.code,
      title: input.title,
      summary: input.summary,
      workPerformed: input.workPerformed,
      resolution: input.resolution,
      followUpRequired: input.followUpRequired,
      followUpActions: input.followUpActions,
      status: input.status,
      priority: input.priority,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      completedAt: input.completedAt ? new Date(input.completedAt) : null,
      systemId: input.systemId,
      equipmentId: input.equipmentId,
      assignedUserId: input.assignedUserId,
      tasks: {
        deleteMany: {},
        create: input.tasks.map((task) => ({
          title: task.title,
          isCompleted: task.isCompleted,
          completedAt: task.isCompleted ? new Date() : null,
          sortOrder: task.sortOrder,
        })),
      },
    },
    include: {
      system: true,
      equipment: true,
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

  return NextResponse.json({ serviceCase }, { status: 200 });
}

export async function DELETE(_: Request, { params }: ServiceCaseRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.serviceCase.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await db.serviceCase.delete({
    where: { id },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
