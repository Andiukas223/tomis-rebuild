import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireServerCapability } from "@/lib/server-session";

type ServiceCaseCompletionRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type CompletionBody = {
  workPerformed?: string | null;
  resolution?: string | null;
  followUpRequired?: boolean;
  followUpActions?: string | null;
};

export async function PATCH(
  request: Request,
  { params }: ServiceCaseCompletionRouteProps,
) {
  const { user, response } = await requireServerCapability("service.manage");

  if (!user) {
    return response!;
  }

  const { id } = await params;
  const body = (await request.json()) as CompletionBody;
  const workPerformed = body.workPerformed?.trim() || null;
  const resolution = body.resolution?.trim() || null;
  const followUpRequired = Boolean(body.followUpRequired);
  const followUpActions = body.followUpActions?.trim() || null;

  if (followUpRequired && !followUpActions) {
    return NextResponse.json(
      { message: "Follow-up actions are required when follow-up is marked as needed." },
      { status: 400 },
    );
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

  const serviceCase = await db.serviceCase.update({
    where: { id },
    data: {
      workPerformed,
      resolution,
      followUpRequired,
      followUpActions,
    },
    select: {
      id: true,
      workPerformed: true,
      resolution: true,
      followUpRequired: true,
      followUpActions: true,
    },
  });

  return NextResponse.json({ serviceCase }, { status: 200 });
}
