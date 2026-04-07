import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeServiceNoteBody, validateServiceNoteBody } from "@/lib/service-note-input";
import { requireServerCapability } from "@/lib/server-session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type CreateServiceNoteBody = {
  body?: string;
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

  const body = (await request.json()) as CreateServiceNoteBody;
  const normalizedBody = normalizeServiceNoteBody(body.body);
  const validationError = validateServiceNoteBody(normalizedBody);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const note = await db.serviceNote.create({
    data: {
      body: normalizedBody,
      serviceCaseId: serviceCase.id,
      authorId: user.id,
    },
    include: {
      author: true,
    },
  });

  return NextResponse.json({ note }, { status: 201 });
}
