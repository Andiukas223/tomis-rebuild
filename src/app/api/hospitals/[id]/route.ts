import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import {
  normalizeHospitalInput,
  validateHospitalInput,
} from "@/lib/hospital-input";

type HospitalRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateHospitalBody = {
  name?: string;
  code?: string | null;
  city?: string | null;
};

export async function GET(_: Request, { params }: HospitalRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const hospital = await db.hospital.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      _count: {
        select: {
          systems: true,
        },
      },
    },
  });

  if (!hospital) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ hospital }, { status: 200 });
}

export async function PATCH(request: Request, { params }: HospitalRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.hospital.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as UpdateHospitalBody;
  const input = normalizeHospitalInput(body);
  const validationError = validateHospitalInput(input);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const duplicate = await db.hospital.findFirst({
    where: {
      organizationId: user.organizationId,
      name: input.name,
      NOT: {
        id,
      },
    },
  });

  if (duplicate) {
    return NextResponse.json(
      { message: "A hospital with this name already exists." },
      { status: 409 },
    );
  }

  const hospital = await db.hospital.update({
    where: { id },
    data: input,
  });

  return NextResponse.json({ hospital }, { status: 200 });
}

export async function DELETE(_: Request, { params }: HospitalRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.hospital.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      _count: {
        select: {
          systems: true,
        },
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (existing._count.systems > 0) {
    return NextResponse.json(
      {
        message:
          "This hospital is still linked to systems and cannot be deleted yet.",
      },
      { status: 409 },
    );
  }

  await db.hospital.delete({
    where: { id },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
