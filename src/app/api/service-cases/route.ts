import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import {
  normalizeServiceCaseInput,
  validateServiceCaseInput,
} from "@/lib/service-case-input";

type CreateServiceCaseBody = {
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

export async function GET(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const status = url.searchParams.get("status")?.trim() ?? "";
  const priority = url.searchParams.get("priority")?.trim() ?? "";
  const systemId = url.searchParams.get("systemId")?.trim() ?? "";
  const equipmentId = url.searchParams.get("equipmentId")?.trim() ?? "";

  const serviceCases = await db.serviceCase.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status && status !== "all" ? { status } : {}),
      ...(priority && priority !== "all" ? { priority } : {}),
      ...(systemId ? { systemId } : {}),
      ...(equipmentId ? { equipmentId } : {}),
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: "insensitive" } },
              { title: { contains: q, mode: "insensitive" } },
              { summary: { contains: q, mode: "insensitive" } },
              {
                system: {
                  code: { contains: q, mode: "insensitive" },
                },
              },
              {
                system: {
                  name: { contains: q, mode: "insensitive" },
                },
              },
              {
                equipment: {
                  code: { contains: q, mode: "insensitive" },
                },
              },
              {
                equipment: {
                  name: { contains: q, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
    include: {
      system: true,
      equipment: true,
    },
  });

  return NextResponse.json({ serviceCases }, { status: 200 });
}

export async function POST(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateServiceCaseBody;
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

  const existing = await db.serviceCase.findUnique({
    where: {
      code: input.code,
    },
  });

  if (existing) {
    return NextResponse.json(
      { message: "A service case with this code already exists." },
      { status: 409 },
    );
  }

  const serviceCase = await db.serviceCase.create({
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
      organizationId: user.organizationId,
      assignedUserId: input.assignedUserId,
      tasks: {
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
      tasks: {
        orderBy: [{ sortOrder: "asc" }],
      },
    },
  });

  return NextResponse.json({ serviceCase }, { status: 201 });
}
