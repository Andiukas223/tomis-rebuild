import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { normalizeSystemInput, validateSystemInput } from "@/lib/system-input";

type CreateSystemBody = {
  code?: string;
  name?: string;
  serialNumber?: string | null;
  hospitalId?: string;
  status?: string;
};

export async function GET(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const status = url.searchParams.get("status")?.trim() ?? "";

  const systems = await db.system.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status && status !== "all" ? { status } : {}),
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { serialNumber: { contains: q, mode: "insensitive" } },
              { hospital: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: [{ code: "asc" }],
    include: {
      hospital: true,
    },
  });

  return NextResponse.json({ systems }, { status: 200 });
}

export async function POST(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateSystemBody;
  const input = normalizeSystemInput(body);
  const validationError = validateSystemInput(input);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const hospital = await db.hospital.findFirst({
    where: {
      id: input.hospitalId,
      organizationId: user.organizationId,
    },
  });

  if (!hospital) {
    return NextResponse.json(
      { message: "Selected hospital was not found." },
      { status: 400 },
    );
  }

  const existing = await db.system.findUnique({
    where: {
      code: input.code,
    },
  });

  if (existing) {
    return NextResponse.json(
      { message: "A system with this code already exists." },
      { status: 409 },
    );
  }

  const system = await db.system.create({
    data: {
      ...input,
      organizationId: user.organizationId,
    },
    include: {
      hospital: true,
    },
  });

  return NextResponse.json({ system }, { status: 201 });
}
