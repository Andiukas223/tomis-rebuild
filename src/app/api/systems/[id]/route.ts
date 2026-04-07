import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getServerSessionUser,
  requireServerCapability,
} from "@/lib/server-session";
import { normalizeSystemInput, validateSystemInput } from "@/lib/system-input";

type SystemRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateSystemBody = {
  code?: string;
  name?: string;
  serialNumber?: string | null;
  hospitalId?: string;
  status?: string;
  equipmentIds?: string[];
};

export async function GET(_: Request, { params }: SystemRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const system = await db.system.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      hospital: true,
      equipment: {
        include: {
          manufacturer: true,
        },
      },
    },
  });

  if (!system) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ system }, { status: 200 });
}

export async function PATCH(request: Request, { params }: SystemRouteProps) {
  const { user, response } = await requireServerCapability("catalog.manage");

  if (response || !user) {
    return response!;
  }

  const { id } = await params;

  const existing = await db.system.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as UpdateSystemBody;
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

  const duplicate = await db.system.findFirst({
    where: {
      code: input.code,
      NOT: {
        id,
      },
    },
  });

  if (duplicate) {
    return NextResponse.json(
      { message: "A system with this code already exists." },
      { status: 409 },
    );
  }

  const system = await db.system.update({
    where: { id },
    data: {
      code: input.code,
      name: input.name,
      serialNumber: input.serialNumber,
      hospitalId: input.hospitalId,
      status: input.status,
    },
    include: {
      hospital: true,
    },
  });

  const selectedEquipment = await db.equipment.findMany({
    where: {
      id: { in: input.equipmentIds },
      organizationId: user.organizationId,
    },
    select: {
      id: true,
    },
  });

  if (selectedEquipment.length !== input.equipmentIds.length) {
    return NextResponse.json(
      { message: "One or more selected equipment records were not found." },
      { status: 400 },
    );
  }

  await db.equipment.updateMany({
    where: {
      systemId: id,
      id: { notIn: input.equipmentIds.length ? input.equipmentIds : undefined },
    },
    data: {
      systemId: null,
    },
  });

  if (input.equipmentIds.length > 0) {
    await db.equipment.updateMany({
      where: {
        id: { in: input.equipmentIds },
      },
      data: {
        systemId: id,
      },
    });
  }

  return NextResponse.json({ system }, { status: 200 });
}

export async function DELETE(_: Request, { params }: SystemRouteProps) {
  const { user, response } = await requireServerCapability("catalog.manage");

  if (response || !user) {
    return response!;
  }

  const { id } = await params;

  const existing = await db.system.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await db.system.delete({
    where: { id },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
