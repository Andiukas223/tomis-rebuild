import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

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

  const serviceUsers = [
    {
      username: "marius",
      email: "marius@tradintek.local",
      fullName: "Marius Petrauskas",
      role: "Field Engineer",
    },
    {
      username: "ievag",
      email: "ieva@tradintek.local",
      fullName: "Ieva Grigaite",
      role: "Service Coordinator",
    },
    {
      username: "ritag",
      email: "rita@tradintek.local",
      fullName: "Rita Giedraite",
      role: "Operations Viewer",
    },
  ];

  for (const serviceUser of serviceUsers) {
    await db.user.upsert({
      where: { username: serviceUser.username },
      update: {
        ...serviceUser,
        organizationId: organization.id,
        isActive: true,
        passwordHash: hashPassword(adminPassword),
      },
      create: {
        ...serviceUser,
        organizationId: organization.id,
        isActive: true,
        passwordHash: hashPassword(adminPassword),
      },
    });
  }

  const companies = [
    {
      name: "Tradintek, Lietuva, UAB",
      code: "302512994",
      city: "Vilnius",
      country: "Lithuania",
    },
    {
      name: "Baltic Medical Solutions",
      code: "305001245",
      city: "Kaunas",
      country: "Lithuania",
    },
    {
      name: "Nordic Imaging Partners",
      code: "556781230",
      city: "Riga",
      country: "Latvia",
    },
  ];

  for (const company of companies) {
    await db.company.upsert({
      where: {
        organizationId_name: {
          organizationId: organization.id,
          name: company.name,
        },
      },
      update: company,
      create: {
        ...company,
        organizationId: organization.id,
      },
    });
  }

  const manufacturers = [
    {
      name: "GE Healthcare",
      code: "GEH",
      country: "United States",
      website: "https://www.gehealthcare.com",
    },
    {
      name: "Siemens Healthineers",
      code: "SHL",
      country: "Germany",
      website: "https://www.siemens-healthineers.com",
    },
    {
      name: "Olympus Medical",
      code: "OLY",
      country: "Japan",
      website: "https://medical.olympusamerica.com",
    },
  ];

  for (const manufacturer of manufacturers) {
    await db.manufacturer.upsert({
      where: {
        organizationId_name: {
          organizationId: organization.id,
          name: manufacturer.name,
        },
      },
      update: manufacturer,
      create: {
        ...manufacturer,
        organizationId: organization.id,
      },
    });
  }

  const productDefinitions = [
    {
      code: "PRD-1001",
      name: "Ultrasound Probe Kit",
      sku: "USP-2200",
      category: "Imaging",
      status: "Active",
      manufacturerName: "GE Healthcare",
    },
    {
      code: "PRD-1002",
      name: "Contrast Injector Set",
      sku: "CIS-4100",
      category: "Radiology",
      status: "Active",
      manufacturerName: "Siemens Healthineers",
    },
    {
      code: "PRD-1003",
      name: "Endoscopy Light Source",
      sku: "ELS-5500",
      category: "Endoscopy",
      status: "Maintenance",
      manufacturerName: "Olympus Medical",
    },
  ];

  for (const product of productDefinitions) {
    const manufacturer = await db.manufacturer.findFirstOrThrow({
      where: {
        organizationId: organization.id,
        name: product.manufacturerName,
      },
    });

    await db.product.upsert({
      where: { code: product.code },
      update: {
        code: product.code,
        name: product.name,
        sku: product.sku,
        category: product.category,
        status: product.status,
        manufacturerId: manufacturer.id,
        organizationId: organization.id,
      },
      create: {
        code: product.code,
        name: product.name,
        sku: product.sku,
        category: product.category,
        status: product.status,
        manufacturerId: manufacturer.id,
        organizationId: organization.id,
      },
    });
  }

  const equipmentDefinitions = [
    {
      code: "EQ-2001",
      name: "Portable Ultrasound Console",
      model: "Vscan Air CL",
      serialNumber: "GE-ULS-88231",
      category: "Imaging",
      status: "Active",
      manufacturerName: "GE Healthcare",
    },
    {
      code: "EQ-2002",
      name: "Angio Injector Console",
      model: "Accutron HP-D",
      serialNumber: "SHL-ANG-44391",
      category: "Radiology",
      status: "Maintenance",
      manufacturerName: "Siemens Healthineers",
    },
    {
      code: "EQ-2003",
      name: "Endoscopy Camera Stack",
      model: "OTV-S500",
      serialNumber: "OLY-END-55210",
      category: "Endoscopy",
      status: "Active",
      manufacturerName: "Olympus Medical",
    },
  ];

  for (const equipment of equipmentDefinitions) {
    const manufacturer = await db.manufacturer.findFirstOrThrow({
      where: {
        organizationId: organization.id,
        name: equipment.manufacturerName,
      },
    });

    await db.equipment.upsert({
      where: { code: equipment.code },
      update: {
        code: equipment.code,
        name: equipment.name,
        model: equipment.model,
        serialNumber: equipment.serialNumber,
        category: equipment.category,
        status: equipment.status,
        manufacturerId: manufacturer.id,
        organizationId: organization.id,
      },
      create: {
        code: equipment.code,
        name: equipment.name,
        model: equipment.model,
        serialNumber: equipment.serialNumber,
        category: equipment.category,
        status: equipment.status,
        manufacturerId: manufacturer.id,
        organizationId: organization.id,
      },
    });
  }

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

  const equipmentAssignments = [
    { equipmentCode: "EQ-2001", systemCode: "1321-016" },
    { equipmentCode: "EQ-2002", systemCode: "1015-783" },
    { equipmentCode: "EQ-2003", systemCode: "1308-002" },
  ];

  for (const assignment of equipmentAssignments) {
    const system = await db.system.findUniqueOrThrow({
      where: { code: assignment.systemCode },
    });

    await db.equipment.update({
      where: { code: assignment.equipmentCode },
      data: {
        systemId: system.id,
      },
    });
  }

  const serviceCaseDefinitions = [
    {
      code: "SRV-4001",
      title: "Quarterly preventive maintenance",
      summary:
        "Complete routine checks, calibration review, and service log update for the ultrasound system.",
      workPerformed: null,
      resolution: null,
      followUpRequired: false,
      followUpActions: null,
      status: "Planned",
      priority: "Medium",
      scheduledAt: "2026-04-15T09:00:00.000Z",
      completedAt: null,
      systemCode: "1321-016",
      equipmentCode: "EQ-2001",
      assignedUsername: "marius",
      tasks: [
        {
          title: "Review maintenance history",
          assignedUsername: "marius",
          dueAt: "2026-04-14T10:00:00.000Z",
          notes: "Confirm the previous preventive maintenance log before site arrival.",
        },
        {
          title: "Run probe calibration",
          assignedUsername: "marius",
          dueAt: "2026-04-15T09:45:00.000Z",
          notes: "Use the approved calibration profile for the current probe set.",
        },
        {
          title: "Update service report",
          assignedUsername: "ievag",
          dueAt: "2026-04-15T13:00:00.000Z",
          notes: "Capture final readings and service summary for handoff.",
        },
      ],
      notes: [
        {
          authorUsername: "ievag",
          body: "Maintenance window confirmed with the clinical team for April 15 at 09:00.",
        },
      ],
    },
    {
      code: "SRV-4002",
      title: "Injector alarm diagnostics",
      summary:
        "Investigate intermittent pressure alarm and verify injector console stability before next patient use.",
      workPerformed:
        "Reviewed alarm logs, reproduced the issue after a warm restart, and completed a controlled injector load test.",
      resolution:
        "Pressure alarm threshold drift was corrected and the console was returned to stable operation.",
      followUpRequired: true,
      followUpActions:
        "Recheck injector alarm behavior after the next 30 operating hours.",
      status: "In Progress",
      priority: "High",
      scheduledAt: "2026-04-08T07:30:00.000Z",
      completedAt: null,
      systemCode: "1015-783",
      equipmentCode: "EQ-2002",
      assignedUsername: "marius",
      tasks: [
        {
          title: "Inspect pressure alarm logs",
          assignedUsername: "marius",
          dueAt: "2026-04-08T08:00:00.000Z",
          notes: "Export event history before cycling power.",
        },
        {
          title: "Test injector console under load",
          assignedUsername: "marius",
          dueAt: "2026-04-08T10:30:00.000Z",
          notes: "Validate alarm threshold behavior after warm restart.",
        },
        {
          title: "Confirm release to clinical use",
          assignedUsername: "ievag",
          dueAt: "2026-04-08T14:00:00.000Z",
          notes: "Notify radiology coordinator once the load test passes.",
        },
      ],
      notes: [
        {
          authorUsername: "marius",
          body: "Initial diagnostics show the pressure alarm appears after a warm restart. Keeping the case in progress until the full load test is complete.",
        },
      ],
    },
    {
      code: "SRV-4003",
      title: "Endoscopy video output verification",
      summary:
        "Validate video chain after reported signal drop and confirm image output on the clinical display.",
      workPerformed: null,
      resolution: null,
      followUpRequired: true,
      followUpActions:
        "Confirm on-site cable swap and prepare escalation package if the signal loss repeats.",
      status: "Open",
      priority: "Critical",
      scheduledAt: null,
      completedAt: null,
      systemCode: "1308-002",
      equipmentCode: "EQ-2003",
      assignedUsername: "ievag",
      tasks: [
        {
          title: "Validate video output chain",
          assignedUsername: "marius",
          dueAt: "2026-04-07T11:00:00.000Z",
          notes: "Check signal handoff between processor and display.",
        },
        {
          title: "Check display cable and connectors",
          assignedUsername: "marius",
          dueAt: "2026-04-07T12:00:00.000Z",
          notes: "Bring the spare cable kit to the first visit.",
        },
        {
          title: "Document findings for escalation",
          assignedUsername: "ievag",
          dueAt: "2026-04-07T16:00:00.000Z",
          notes: "Prepare vendor escalation package if the issue repeats.",
        },
      ],
      notes: [
        {
          authorUsername: "ievag",
          body: "Hospital reported an intermittent signal drop during the morning list. Waiting for on-site technician confirmation.",
        },
        {
          authorUsername: "marius",
          body: "Prepared spare video cable and diagnostic display for the first site visit.",
        },
      ],
    },
  ];

  for (const serviceCase of serviceCaseDefinitions) {
    const system = await db.system.findUniqueOrThrow({
      where: { code: serviceCase.systemCode },
    });

    const equipment = await db.equipment.findUniqueOrThrow({
      where: { code: serviceCase.equipmentCode },
    });

    const assignedUser = await db.user.findUniqueOrThrow({
      where: { username: serviceCase.assignedUsername },
    });

    await db.serviceCase.upsert({
      where: {
        code: serviceCase.code,
      },
      update: {
        title: serviceCase.title,
        summary: serviceCase.summary,
        workPerformed: serviceCase.workPerformed,
        resolution: serviceCase.resolution,
        followUpRequired: serviceCase.followUpRequired,
        followUpActions: serviceCase.followUpActions,
        status: serviceCase.status,
        priority: serviceCase.priority,
        scheduledAt: serviceCase.scheduledAt
          ? new Date(serviceCase.scheduledAt)
          : null,
        completedAt: serviceCase.completedAt
          ? new Date(serviceCase.completedAt)
          : null,
        systemId: system.id,
        equipmentId: equipment.id,
        organizationId: organization.id,
        assignedUserId: assignedUser.id,
      },
      create: {
        code: serviceCase.code,
        title: serviceCase.title,
        summary: serviceCase.summary,
        workPerformed: serviceCase.workPerformed,
        resolution: serviceCase.resolution,
        followUpRequired: serviceCase.followUpRequired,
        followUpActions: serviceCase.followUpActions,
        status: serviceCase.status,
        priority: serviceCase.priority,
        scheduledAt: serviceCase.scheduledAt
          ? new Date(serviceCase.scheduledAt)
          : null,
        completedAt: serviceCase.completedAt
          ? new Date(serviceCase.completedAt)
          : null,
        systemId: system.id,
        equipmentId: equipment.id,
        organizationId: organization.id,
        assignedUserId: assignedUser.id,
      },
    });

    const persistedCase = await db.serviceCase.findUniqueOrThrow({
      where: { code: serviceCase.code },
    });

    await db.serviceTask.deleteMany({
      where: {
        serviceCaseId: persistedCase.id,
      },
    });

    for (const [index, task] of serviceCase.tasks.entries()) {
      const assignedTaskUser = await db.user.findUniqueOrThrow({
        where: { username: task.assignedUsername },
      });

      await db.serviceTask.create({
        data: {
          title: task.title,
          notes: task.notes,
          sortOrder: index,
          isCompleted: false,
          completedAt: null,
          dueAt: new Date(task.dueAt),
          assignedUserId: assignedTaskUser.id,
          serviceCaseId: persistedCase.id,
        },
      });
    }

    await db.serviceNote.deleteMany({
      where: {
        serviceCaseId: persistedCase.id,
      },
    });

    for (const note of serviceCase.notes) {
      const author = await db.user.findUniqueOrThrow({
        where: { username: note.authorUsername },
      });

      await db.serviceNote.create({
        data: {
          body: note.body,
          serviceCaseId: persistedCase.id,
          authorId: author.id,
        },
      });
    }
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
