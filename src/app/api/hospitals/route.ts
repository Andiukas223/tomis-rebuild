import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getServerSessionUser,
  requireServerCapability,
} from "@/lib/server-session";
import {
  normalizeHospitalInput,
  validateHospitalInput,
} from "@/lib/hospital-input";

type CreateHospitalBody = {
  name?: string;
  code?: string | null;
  city?: string | null;
};

export async function GET(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  const hospitals = await db.hospital.findMany({
    where: {
      organizationId: user.organizationId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { code: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ name: "asc" }],
    include: {
      _count: {
        select: {
          systems: true,
        },
      },
    },
  });

  return NextResponse.json({ hospitals }, { status: 200 });
}

export async function POST(request: Request) {
  const { user, response } = await requireServerCapability("registry.manage");

  if (response || !user) {
    return response!;
  }

  const body = (await request.json()) as CreateHospitalBody;
  const input = normalizeHospitalInput(body);
  const validationError = validateHospitalInput(input);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const duplicate = await db.hospital.findFirst({
    where: {
      organizationId: user.organizationId,
      name: input.name,
    },
  });

  if (duplicate) {
    return NextResponse.json(
      { message: "A hospital with this name already exists." },
      { status: 409 },
    );
  }

  const hospital = await db.hospital.create({
    data: {
      ...input,
      organizationId: user.organizationId,
    },
  });

  return NextResponse.json({ hospital }, { status: 201 });
}
