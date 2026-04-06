import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/password";

async function main() {
  const organization = await db.organization.upsert({
    where: { slug: "tradintek-lt" },
    update: {
      name: "Tradintek, Lietuva, UAB",
    },
    create: {
      slug: "tradintek-lt",
      name: "Tradintek, Lietuva, UAB",
    },
  });

  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? "dev-admin-pass";

  await db.user.upsert({
    where: { username: "anlo" },
    update: {
      email: "anlo@tradintek.local",
      fullName: "Andrejus Lomovas",
      role: "Administrator",
      organizationId: organization.id,
      isActive: true,
      passwordHash: hashPassword(adminPassword),
    },
    create: {
      username: "anlo",
      email: "anlo@tradintek.local",
      fullName: "Andrejus Lomovas",
      role: "Administrator",
      organizationId: organization.id,
      isActive: true,
      passwordHash: hashPassword(adminPassword),
    },
  });

  const systems = [
    {
      code: "1308-002",
      name: "Endoskopine sistema",
      serialNumber: null,
      hospitalName: "Vilniaus klinika",
      hospitalCode: "VKL",
      city: "Vilnius",
      status: "Active",
    },
    {
      code: "1015-783",
      name: "Accutron CT-D",
      serialNumber: "862125231",
      hospitalName: "Kauno diagnostikos centras",
      hospitalCode: "KDC",
      city: "Kaunas",
      status: "Active",
    },
    {
      code: "1321-016",
      name: "Logiq TOTUS",
      serialNumber: "LTO141527",
      hospitalName: "Klaipedos ligonine",
      hospitalCode: "KLL",
      city: "Klaipeda",
      status: "Active",
    },
    {
      code: "1072-295",
      name: "B125P",
      serialNumber: "SV325090006WA",
      hospitalName: "Siauliu medicinos centras",
      hospitalCode: "SMC",
      city: "Siauliai",
      status: "Maintenance",
    },
  ];

  for (const system of systems) {
    const hospital = await db.hospital.upsert({
      where: {
        organizationId_name: {
          organizationId: organization.id,
          name: system.hospitalName,
        },
      },
      update: {
        code: system.hospitalCode,
        city: system.city,
      },
      create: {
        name: system.hospitalName,
        code: system.hospitalCode,
        city: system.city,
        organizationId: organization.id,
      },
    });

    await db.system.upsert({
      where: { code: system.code },
      update: {
        code: system.code,
        name: system.name,
        serialNumber: system.serialNumber,
        status: system.status,
        hospitalId: hospital.id,
        organizationId: organization.id,
      },
      create: {
        code: system.code,
        name: system.name,
        serialNumber: system.serialNumber,
        status: system.status,
        hospitalId: hospital.id,
        organizationId: organization.id,
      },
    });
  }

  console.log("Seed complete.");
  console.log("Admin username: anlo");
  console.log(`Admin password: ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
