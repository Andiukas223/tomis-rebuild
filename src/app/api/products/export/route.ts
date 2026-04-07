import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSessionUser } from "@/lib/server-session";

function escapeCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

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
    select: {
      code: true,
      name: true,
      sku: true,
      category: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      manufacturer: {
        select: {
          name: true,
        },
      },
    },
  });

  const rows = [
    [
      "Code",
      "Name",
      "SKU",
      "Category",
      "Manufacturer",
      "Status",
      "Created At",
      "Updated At",
    ],
    ...products.map((product) => [
      product.code,
      product.name,
      product.sku ?? "",
      product.category ?? "",
      product.manufacturer.name,
      product.status,
      product.createdAt.toISOString(),
      product.updatedAt.toISOString(),
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="products-export.csv"',
    },
  });
}
