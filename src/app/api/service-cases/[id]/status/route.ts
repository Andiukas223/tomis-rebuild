import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";

type ServiceCaseStatusRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const allowedStatuses = new Set(["Open", "Planned", "In Progress", "Done"]);

export async function PATCH(
  request: Request,
  { params }: ServiceCaseStatusRouteProps,
) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: string };
  const status = body.status?.trim() ?? "";

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ message: "Invalid status." }, { status: 400 });
  }

  const existing = await db.serviceCase.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const completedAt =
    status === "Done"
      ? existing.completedAt ?? new Date()
      : status === "Open" || status === "Planned" || status === "In Progress"
        ? null
        : existing.completedAt;

  const serviceCase = await db.serviceCase.update({
    where: { id },
    data: {
      status,
      completedAt,
    },
    select: {
      id: true,
      status: true,
      completedAt: true,
    },
  });

  return NextResponse.json({ serviceCase }, { status: 200 });
}
