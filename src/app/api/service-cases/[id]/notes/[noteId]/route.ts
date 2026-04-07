import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeServiceNoteBody, validateServiceNoteBody } from "@/lib/service-note-input";
import { getServerSessionRecord } from "@/lib/server-session";

type RouteContext = {
  params: Promise<{
    id: string;
    noteId: string;
  }>;
};

type UpdateServiceNoteBody = {
  body?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSessionRecord();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, noteId } = await context.params;
  const note = await db.serviceNote.findFirst({
    where: {
      id: noteId,
      serviceCaseId: id,
      serviceCase: {
        organizationId: session.user.organizationId,
      },
    },
  });

  if (!note) {
    return NextResponse.json({ message: "Note was not found." }, { status: 404 });
  }

  const body = (await request.json()) as UpdateServiceNoteBody;
  const normalizedBody = normalizeServiceNoteBody(body.body);
  const validationError = validateServiceNoteBody(normalizedBody);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const updatedNote = await db.serviceNote.update({
    where: {
      id: note.id,
    },
    data: {
      body: normalizedBody,
    },
    include: {
      author: true,
    },
  });

  return NextResponse.json({ note: updatedNote }, { status: 200 });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSessionRecord();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, noteId } = await context.params;
  const note = await db.serviceNote.findFirst({
    where: {
      id: noteId,
      serviceCaseId: id,
      serviceCase: {
        organizationId: session.user.organizationId,
      },
    },
  });

  if (!note) {
    return NextResponse.json({ message: "Note was not found." }, { status: 404 });
  }

  await db.serviceNote.delete({
    where: {
      id: note.id,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
