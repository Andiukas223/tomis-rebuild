import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";

type ServiceTaskRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: ServiceTaskRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { isCompleted?: boolean };
  const isCompleted = Boolean(body.isCompleted);

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

  const task = await db.serviceTask.update({
    where: { id },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
    select: {
      id: true,
      isCompleted: true,
      completedAt: true,
    },
  });

  return NextResponse.json({ task }, { status: 200 });
}
