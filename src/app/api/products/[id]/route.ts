import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";
import { normalizeProductInput, validateProductInput } from "@/lib/product-input";

type ProductRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateProductBody = {
  code?: string;
  name?: string;
  sku?: string | null;
  category?: string | null;
  status?: string;
  manufacturerId?: string;
};

export async function GET(_: Request, { params }: ProductRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const product = await db.product.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      manufacturer: true,
    },
  });

  if (!product) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ product }, { status: 200 });
}

export async function PATCH(request: Request, { params }: ProductRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.product.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as UpdateProductBody;
  const input = normalizeProductInput(body);
  const validationError = validateProductInput(input);

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

  const duplicate = await db.product.findFirst({
    where: {
      code: input.code,
      NOT: {
        id,
      },
    },
  });

  if (duplicate) {
    return NextResponse.json(
      { message: "A product with this code already exists." },
      { status: 409 },
    );
  }

  const product = await db.product.update({
    where: { id },
    data: input,
    include: {
      manufacturer: true,
    },
  });

  return NextResponse.json({ product }, { status: 200 });
}

export async function DELETE(_: Request, { params }: ProductRouteProps) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.product.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await db.product.delete({
    where: { id },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
