import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import {
  normalizeEquipmentInput,
  validateEquipmentInput,
} from "@/lib/equipment-input";

type EquipmentRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateEquipmentBody = {
  code?: string;
  name?: string;
  model?: string | null;
  serialNumber?: string | null;
  category?: string | null;
  status?: string;
  manufacturerId?: string;
  systemId?: string | null;
};

export async function GET(_: Request, { params }: EquipmentRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const equipment = await db.equipment.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      manufacturer: true,
      system: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  if (!equipment) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ equipment }, { status: 200 });
}

export async function PATCH(request: Request, { params }: EquipmentRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.equipment.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as UpdateEquipmentBody;
  const input = normalizeEquipmentInput(body);
  const validationError = validateEquipmentInput(input);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const manufacturer = await db.manufacturer.findFirst({
    where: {
      id: input.manufacturerId,
      organizationId: user.organizationId,
    },
  });

  if (!manufacturer) {
    return NextResponse.json(
      { message: "Selected manufacturer was not found." },
      { status: 400 },
    );
  }

  if (input.systemId) {
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
  }

  const duplicate = await db.equipment.findFirst({
    where: {
      code: input.code,
      NOT: {
        id,
      },
    },
  });

  if (duplicate) {
    return NextResponse.json(
      { message: "Equipment with this code already exists." },
      { status: 409 },
    );
  }

  const equipment = await db.equipment.update({
    where: { id },
    data: input,
    include: {
      manufacturer: true,
      system: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ equipment }, { status: 200 });
}

export async function DELETE(_: Request, { params }: EquipmentRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.equipment.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await db.equipment.delete({
    where: { id },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
