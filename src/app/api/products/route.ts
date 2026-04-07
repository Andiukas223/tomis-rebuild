import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getServerSessionUser,
  requireServerCapability,
} from "@/lib/server-session";
import { normalizeProductInput, validateProductInput } from "@/lib/product-input";

type CreateProductBody = {
  code?: string;
  name?: string;
  sku?: string | null;
  category?: string | null;
  status?: string;
  manufacturerId?: string;
};

export async function GET(request: Request) {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const status = url.searchParams.get("status")?.trim() ?? "";

  const products = await db.product.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status && status !== "all" ? { status } : {}),
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
              {
                manufacturer: {
                  name: { contains: q, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ code: "asc" }],
    include: {
      manufacturer: true,
    },
  });

  return NextResponse.json({ products }, { status: 200 });
}

export async function POST(request: Request) {
  const { user, response } = await requireServerCapability("catalog.manage");

  if (response || !user) {
    return response!;
  }

  const body = (await request.json()) as CreateProductBody;
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

  const existing = await db.product.findUnique({
    where: {
      code: input.code,
    },
  });

  if (existing) {
    return NextResponse.json(
      { message: "A product with this code already exists." },
      { status: 409 },
    );
  }

  const product = await db.product.create({
    data: {
      ...input,
      organizationId: user.organizationId,
    },
    include: {
      manufacturer: true,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
