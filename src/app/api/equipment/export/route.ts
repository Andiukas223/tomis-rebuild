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
  const system = url.searchParams.get("system")?.trim() ?? "";

  const equipment = await db.equipment.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status && status !== "all" ? { status } : {}),
      ...(system === "assigned"
        ? { systemId: { not: null } }
        : system === "unassigned"
          ? { systemId: null }
          : {}),
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { model: { contains: q, mode: "insensitive" } },
              { serialNumber: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
              {
                manufacturer: {
                  name: { contains: q, mode: "insensitive" },
                },
              },
              {
                system: {
                  code: { contains: q, mode: "insensitive" },
                },
              },
              {
                system: {
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
      model: true,
      serialNumber: true,
      category: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      manufacturer: {
        select: {
          name: true,
        },
      },
      system: {
        select: {
          code: true,
          name: true,
        },
      },
    },
  });

  const rows = [
    [
      "Code",
      "Name",
      "Model",
      "Serial Number",
      "Category",
      "Manufacturer",
      "Linked System",
      "Status",
      "Created At",
      "Updated At",
    ],
    ...equipment.map((item) => [
      item.code,
      item.name,
      item.model ?? "",
      item.serialNumber ?? "",
      item.category ?? "",
      item.manufacturer.name,
      item.system ? `${item.system.code} ${item.system.name}` : "",
      item.status,
      item.createdAt.toISOString(),
      item.updatedAt.toISOString(),
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="equipment-export.csv"',
    },
  });
}
