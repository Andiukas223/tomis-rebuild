import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import {
  DEMO_ADMIN_PASSWORD,
  DEMO_ADMIN_USERNAME,
} from "../src/lib/demo-credentials";
import { hashPassword } from "../src/lib/password";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function getSeedAttachmentRoot() {
  return path.join(process.cwd(), "storage", "service-attachments");
}

async function writeSeedAttachment(storageKey: string, content: string) {
  const root = getSeedAttachmentRoot();
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, storageKey), content, "utf8");
}

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
    process.env.SEED_ADMIN_PASSWORD ?? DEMO_ADMIN_PASSWORD;

  await db.user.upsert({
    where: { username: DEMO_ADMIN_USERNAME },
    update: {
      email: "anlo@tradintek.local",
      fullName: "Andrejus Lomovas",
      role: "Administrator",
      organizationId: organization.id,
      isActive: true,
      passwordHash: hashPassword(adminPassword),
    },
    create: {
      username: DEMO_ADMIN_USERNAME,
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
      vatCode: "LT100005129944",
      city: "Vilnius",
      country: "Lithuania",
      addressLine1: "Laisves pr. 77C",
      addressLine2: "Office 412",
      website: "https://www.tradintek.com",
      contactName: "Andrejus Lomovas",
      contactEmail: "anlo@tradintek.local",
      contactPhone: "+370 612 55001",
    },
    {
      name: "Baltic Medical Solutions",
      code: "305001245",
      vatCode: "LT100010012457",
      city: "Kaunas",
      country: "Lithuania",
      addressLine1: "Karaliaus Mindaugo pr. 14",
      addressLine2: "Commercial floor 3",
      website: "https://baltic-medical.example.com",
      contactName: "Simona Daugelaite",
      contactEmail: "simona@baltic-medical.example.com",
      contactPhone: "+370 612 55002",
    },
    {
      name: "Nordic Imaging Partners",
      code: "556781230",
      vatCode: "LV55678123011",
      city: "Riga",
      country: "Latvia",
      addressLine1: "Brivibas iela 88",
      addressLine2: "Partnership office",
      website: "https://nordic-imaging.example.com",
      contactName: "Janis Ozols",
      contactEmail: "janis@nip.example.com",
      contactPhone: "+371 2611 5503",
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

  const additionalCompanies = [
    {
      name: "Taurages ligonine",
      code: "301245780",
      vatCode: "LT100003012457",
      city: "Taurage",
      country: "Lithuania",
      addressLine1: "V. Kudirkos g. 2",
      addressLine2: "Main administration",
      website: "https://tauragesligonine.example.lt",
      contactName: "Diana Vasiliene",
      contactEmail: "administracija@tauragesligonine.example.lt",
      contactPhone: "+370 612 55011",
    },
    {
      name: "Respublikine Klaipedos ligonine",
      code: "301004562",
      vatCode: "LT100003010045",
      city: "Klaipeda",
      country: "Lithuania",
      addressLine1: "Liepojos g. 45",
      addressLine2: "Radiology administration",
      website: "https://klaipedosligonine.example.lt",
      contactName: "Mindaugas Tarvydas",
      contactEmail: "kontaktai@klaipedosligonine.example.lt",
      contactPhone: "+370 612 55012",
    },
    {
      name: "Vilniaus universiteto ligonine Santaros klinikos",
      code: "302620123",
      vatCode: "LT100003026201",
      city: "Vilnius",
      country: "Lithuania",
      addressLine1: "Santariskiu g. 2",
      addressLine2: "Central administration",
      website: "https://santarosklinika.example.lt",
      contactName: "Egle Morkuniene",
      contactEmail: "administracija@santarosklinika.example.lt",
      contactPhone: "+370 612 55013",
    },
    {
      name: "Siauliu medicinos centras",
      code: "302779214",
      vatCode: "LT100003027792",
      city: "Siauliai",
      country: "Lithuania",
      addressLine1: "Tilzes g. 65",
      addressLine2: "Operations office",
      website: "https://siauliumed.example.lt",
      contactName: "Aida Pociene",
      contactEmail: "info@siauliumed.example.lt",
      contactPhone: "+370 612 55014",
    },
    {
      name: "Panevezio diagnostikos centras",
      code: "303441267",
      vatCode: "LT100003034412",
      city: "Panevezys",
      country: "Lithuania",
      addressLine1: "Smelynes g. 25",
      addressLine2: "Diagnostics floor 2",
      website: "https://paneveziodc.example.lt",
      contactName: "Tadas Puidokas",
      contactEmail: "info@paneveziodc.example.lt",
      contactPhone: "+370 612 55015",
    },
  ];

  for (const company of additionalCompanies) {
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
      supportEmail: "support.eu@gehealthcare.example.com",
      supportPhone: "+49 69 500 7001",
      productFocus: "Imaging systems and ultrasound",
      serviceNotes:
        "Escalate advanced imaging diagnostics through the regional applications team first.",
    },
    {
      name: "Siemens Healthineers",
      code: "SHL",
      country: "Germany",
      website: "https://www.siemens-healthineers.com",
      supportEmail: "support@siemens-healthineers.example.com",
      supportPhone: "+49 89 636 7002",
      productFocus: "Radiology and diagnostic equipment",
      serviceNotes:
        "Preferred vendor coordination path for injector and radiology platform incidents.",
    },
    {
      name: "Olympus Medical",
      code: "OLY",
      country: "Japan",
      website: "https://medical.olympusamerica.com",
      supportEmail: "support@olympus-medical.example.com",
      supportPhone: "+81 3 6901 7003",
      productFocus: "Endoscopy and visualization platforms",
      serviceNotes:
        "Use the endoscopy escalation template when repeated image chain failures are reported.",
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

  const additionalManufacturers = [
    {
      name: "Drager Medical",
      code: "DRG",
      country: "Germany",
      website: "https://www.draeger.com",
      supportEmail: "support@draeger-medical.example.com",
      supportPhone: "+49 69 500 7004",
      productFocus: "Ventilation and patient monitoring",
      serviceNotes:
        "NICU and anesthesia systems require pre-visit software compatibility checks.",
    },
    {
      name: "Philips Healthcare",
      code: "PHL",
      country: "Netherlands",
      website: "https://www.philips.com/healthcare",
      supportEmail: "support@philips-healthcare.example.com",
      supportPhone: "+31 20 794 7005",
      productFocus: "Imaging, monitoring, and ultrasound",
      serviceNotes:
        "Escalate recurring imaging faults through the regional applications channel.",
    },
  ];

  for (const manufacturer of additionalManufacturers) {
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

  const additionalProductDefinitions = [
    {
      code: "PRD-1004",
      name: "NICU Ventilation Sensor Pack",
      sku: "NICU-7712",
      category: "Ventilation",
      status: "Active",
      manufacturerName: "Drager Medical",
    },
    {
      code: "PRD-1005",
      name: "Cardiac Ultrasound Probe",
      sku: "CARD-9110",
      category: "Imaging",
      status: "Active",
      manufacturerName: "Philips Healthcare",
    },
    {
      code: "PRD-1006",
      name: "Endoscope Processor Cable Set",
      sku: "ENDO-4432",
      category: "Endoscopy",
      status: "Active",
      manufacturerName: "Olympus Medical",
    },
  ];

  for (const product of additionalProductDefinitions) {
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

  const additionalEquipmentDefinitions = [
    {
      code: "EQ-2004",
      name: "Neonatal Ventilation Console",
      model: "Babylog VN600",
      serialNumber: "DRG-NICU-12044",
      category: "Ventilation",
      status: "Active",
      manufacturerName: "Drager Medical",
    },
    {
      code: "EQ-2005",
      name: "Cardiac Ultrasound Cart",
      model: "EPIQ CVx",
      serialNumber: "PHL-CARD-77812",
      category: "Imaging",
      status: "Active",
      manufacturerName: "Philips Healthcare",
    },
    {
      code: "EQ-2006",
      name: "Anesthesia Monitor Bridge",
      model: "IntelliBridge EC10",
      serialNumber: "PHL-AMB-55100",
      category: "Monitoring",
      status: "Maintenance",
      manufacturerName: "Philips Healthcare",
    },
    {
      code: "EQ-2007",
      name: "Portable Endoscopy Tower",
      model: "VISERA ELITE III",
      serialNumber: "OLY-VIS-22511",
      category: "Endoscopy",
      status: "Active",
      manufacturerName: "Olympus Medical",
    },
  ];

  for (const equipment of additionalEquipmentDefinitions) {
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
      country: "Lithuania",
      addressLine1: "Santariskiu g. 4",
      addressLine2: "Endoscopy wing, level 2",
      contactName: "Rasa Valuckiene",
      contactEmail: "rasa.valuckiene@vilniausklinika.lt",
      contactPhone: "+370 612 44001",
      serviceRegion: "Vilnius region",
      serviceNotes:
        "High-volume endoscopy site. Prefer weekday preventive service windows before 08:00.",
      status: "Active",
    },
    {
      code: "1015-783",
      name: "Accutron CT-D",
      serialNumber: "862125231",
      hospitalName: "Kauno diagnostikos centras",
      hospitalCode: "KDC",
      city: "Kaunas",
      country: "Lithuania",
      addressLine1: "Savanoriu pr. 155",
      addressLine2: "Radiology reception",
      contactName: "Tomas Juodka",
      contactEmail: "t.juodka@kdc.lt",
      contactPhone: "+370 612 44002",
      serviceRegion: "Kaunas region",
      serviceNotes:
        "Contrast injector support cases usually require same-day escalation checks.",
      status: "Active",
    },
    {
      code: "1321-016",
      name: "Logiq TOTUS",
      serialNumber: "LTO141527",
      hospitalName: "Klaipedos ligonine",
      hospitalCode: "KLL",
      city: "Klaipeda",
      country: "Lithuania",
      addressLine1: "Liepu g. 23",
      addressLine2: "Ultrasound diagnostics unit",
      contactName: "Inga Bruziene",
      contactEmail: "inga.bruziene@kll.lt",
      contactPhone: "+370 612 44003",
      serviceRegion: "Klaipeda region",
      serviceNotes:
        "Preferred service handoff through diagnostics coordinator before field engineer arrival.",
      status: "Active",
    },
    {
      code: "1072-295",
      name: "B125P",
      serialNumber: "SV325090006WA",
      hospitalName: "Siauliu medicinos centras",
      hospitalCode: "SMC",
      city: "Siauliai",
      country: "Lithuania",
      addressLine1: "Tilzes g. 88",
      addressLine2: "Main hospital campus",
      contactName: "Asta Vaitkeviciene",
      contactEmail: "asta.vaitkeviciene@smc.lt",
      contactPhone: "+370 612 44004",
      serviceRegion: "Siauliai region",
      serviceNotes:
        "Maintenance visits should be grouped with system inspections where possible.",
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
        country: system.country,
        addressLine1: system.addressLine1,
        addressLine2: system.addressLine2,
        contactName: system.contactName,
        contactEmail: system.contactEmail,
        contactPhone: system.contactPhone,
        serviceRegion: system.serviceRegion,
        serviceNotes: system.serviceNotes,
      },
      create: {
        name: system.hospitalName,
        code: system.hospitalCode,
        city: system.city,
        country: system.country,
        addressLine1: system.addressLine1,
        addressLine2: system.addressLine2,
        contactName: system.contactName,
        contactEmail: system.contactEmail,
        contactPhone: system.contactPhone,
        serviceRegion: system.serviceRegion,
        serviceNotes: system.serviceNotes,
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

  const additionalSystems = [
    {
      code: "1073-007",
      name: "Logiq TOTUS",
      serialNumber: "LTO540027",
      hospitalName: "Klaipedos ligonine",
      hospitalCode: "KLL",
      city: "Klaipeda",
      country: "Lithuania",
      addressLine1: "Liepu g. 23",
      addressLine2: "Ultrasound diagnostics unit",
      contactName: "Inga Bruziene",
      contactEmail: "inga.bruziene@kll.lt",
      contactPhone: "+370 612 44003",
      serviceRegion: "Klaipeda region",
      serviceNotes:
        "Diagnostic imaging cases should be grouped into one site plan where possible.",
      status: "Active",
    },
    {
      code: "1072-294",
      name: "B125P",
      serialNumber: "SV325280105WA",
      hospitalName: "Siauliu medicinos centras",
      hospitalCode: "SMC",
      city: "Siauliai",
      country: "Lithuania",
      addressLine1: "Tilzes g. 88",
      addressLine2: "Main hospital campus",
      contactName: "Asta Vaitkeviciene",
      contactEmail: "asta.vaitkeviciene@smc.lt",
      contactPhone: "+370 612 44004",
      serviceRegion: "Siauliai region",
      serviceNotes:
        "Combine maintenance and mandatory inspections during the same site slot.",
      status: "Active",
    },
    {
      code: "1069-706",
      name: "ZEISS SL 120 SL Cam compact",
      serialNumber: "1270792",
      hospitalName: "Panevezio diagnostikos centras",
      hospitalCode: "PDC",
      city: "Panevezys",
      country: "Lithuania",
      addressLine1: "Respublikos g. 18",
      addressLine2: "Ophthalmology diagnostics block",
      contactName: "Jurate Mockuviene",
      contactEmail: "jurate.mockuviene@pdc.lt",
      contactPhone: "+370 612 44005",
      serviceRegion: "Panevezys region",
      serviceNotes:
        "Vision systems require calibration verification after any transported intervention.",
      status: "Active",
    },
    {
      code: "1015-782",
      name: "Vivid E95",
      serialNumber: "AU90134",
      hospitalName: "Vilniaus klinika",
      hospitalCode: "VKL",
      city: "Vilnius",
      country: "Lithuania",
      addressLine1: "Santariskiu g. 4",
      addressLine2: "Cardiac diagnostics block",
      contactName: "Rasa Valuckiene",
      contactEmail: "rasa.valuckiene@vilniausklinika.lt",
      contactPhone: "+370 612 44001",
      serviceRegion: "Vilnius region",
      serviceNotes:
        "Cardiac imaging work should be scheduled before the morning patient queue when possible.",
      status: "Active",
    },
    {
      code: "1201-031",
      name: "SEER 1000",
      serialNumber: "3912641532",
      hospitalName: "Taurages ligonine",
      hospitalCode: "TRL",
      city: "Taurage",
      country: "Lithuania",
      addressLine1: "V. Kudirkos g. 2",
      addressLine2: "Cardiology office",
      contactName: "Diana Vasiliene",
      contactEmail: "administracija@tauragesligonine.example.lt",
      contactPhone: "+370 612 55011",
      serviceRegion: "Taurage region",
      serviceNotes:
        "Portable ECG-related service jobs often need same-week follow-up verification.",
      status: "Active",
    },
    {
      code: "1076-223",
      name: "Fabian HFO",
      serialNumber: "1072-223",
      hospitalName: "Vaiku ligonine, VULSK filialas",
      hospitalCode: "VAIK",
      city: "Vilnius",
      country: "Lithuania",
      addressLine1: "Santariskiu g. 7",
      addressLine2: "NICU unit",
      contactName: "Ruta Misiuniene",
      contactEmail: "ruta.misiuniene@vaikuligonine.lt",
      contactPhone: "+370 612 44006",
      serviceRegion: "Vilnius region",
      serviceNotes:
        "NICU ventilation changes require documented handoff to the ward lead before closure.",
      status: "Maintenance",
    },
  ];

  for (const system of additionalSystems) {
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
        country: system.country,
        addressLine1: system.addressLine1,
        addressLine2: system.addressLine2,
        contactName: system.contactName,
        contactEmail: system.contactEmail,
        contactPhone: system.contactPhone,
        serviceRegion: system.serviceRegion,
        serviceNotes: system.serviceNotes,
      },
      create: {
        name: system.hospitalName,
        code: system.hospitalCode,
        city: system.city,
        country: system.country,
        addressLine1: system.addressLine1,
        addressLine2: system.addressLine2,
        contactName: system.contactName,
        contactEmail: system.contactEmail,
        contactPhone: system.contactPhone,
        serviceRegion: system.serviceRegion,
        serviceNotes: system.serviceNotes,
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
    { equipmentCode: "EQ-2004", systemCode: "1076-223" },
    { equipmentCode: "EQ-2005", systemCode: "1015-782" },
    { equipmentCode: "EQ-2006", systemCode: "1201-031" },
    { equipmentCode: "EQ-2007", systemCode: "1308-002" },
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
      equipmentCode: "EQ-2006",
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

  const additionalServiceCaseDefinitions = [
    {
      code: "SRV-4004",
      title: "Follow-up visit after preventive maintenance",
      summary:
        "Return to confirm image quality stability and finalize the preventive maintenance package.",
      workPerformed:
        "Confirmed image quality readings remained stable and reviewed the maintenance handoff with the hospital team.",
      resolution: "Preventive maintenance package closed without outstanding issues.",
      followUpRequired: false,
      followUpActions: null,
      status: "Done",
      priority: "Low",
      scheduledAt: "2026-04-18T08:30:00.000Z",
      completedAt: "2026-04-18T11:40:00.000Z",
      systemCode: "1321-016",
      equipmentCode: "EQ-2001",
      assignedUsername: "marius",
      tasks: [
        {
          title: "Review previous maintenance readings",
          assignedUsername: "marius",
          dueAt: "2026-04-18T08:45:00.000Z",
          notes: "Use the previous preventive maintenance summary as the baseline.",
        },
        {
          title: "Validate image quality with clinical lead",
          assignedUsername: "marius",
          dueAt: "2026-04-18T09:30:00.000Z",
          notes: "Confirm image quality after the completed maintenance cycle.",
        },
      ],
      notes: [
        {
          authorUsername: "marius",
          body: "Follow-up visit completed successfully. No repeat issues reported after the original maintenance window.",
        },
      ],
    },
    {
      code: "SRV-4005",
      title: "Urgent ventilation alarm review",
      summary:
        "Investigate recurring alarm behavior in the NICU ventilation console and verify safe operating state.",
      workPerformed: null,
      resolution: null,
      followUpRequired: true,
      followUpActions:
        "Escalate to vendor if the alarm returns after firmware validation.",
      status: "Open",
      priority: "Critical",
      scheduledAt: "2026-04-09T07:15:00.000Z",
      completedAt: null,
      systemCode: "1076-223",
      equipmentCode: "EQ-2004",
      assignedUsername: "marius",
      tasks: [
        {
          title: "Collect alarm export",
          assignedUsername: "marius",
          dueAt: "2026-04-09T07:45:00.000Z",
          notes: "Capture the alarm event history before device restart.",
        },
        {
          title: "Confirm NICU handoff plan",
          assignedUsername: "ievag",
          dueAt: "2026-04-09T08:15:00.000Z",
          notes: "Coordinate service access window with the ward lead.",
        },
      ],
      notes: [
        {
          authorUsername: "ievag",
          body: "NICU team requested first-slot engineer arrival because the alarm appeared during the night shift.",
        },
      ],
    },
    {
      code: "SRV-4006",
      title: "Cardiac ultrasound software update",
      summary:
        "Apply validated software patch and confirm cardiac probe workflow after restart.",
      workPerformed: null,
      resolution: null,
      followUpRequired: false,
      followUpActions: null,
      status: "Planned",
      priority: "Medium",
      scheduledAt: "2026-04-11T09:30:00.000Z",
      completedAt: null,
      systemCode: "1015-782",
      equipmentCode: "EQ-2005",
      assignedUsername: "marius",
      tasks: [
        {
          title: "Backup current configuration",
          assignedUsername: "marius",
          dueAt: "2026-04-11T09:45:00.000Z",
          notes: "Take the baseline export before applying the patch.",
        },
        {
          title: "Confirm post-update cardiac workflow",
          assignedUsername: "ievag",
          dueAt: "2026-04-11T11:30:00.000Z",
          notes: "Collect clinician sign-off once image presets are verified.",
        },
      ],
      notes: [
        {
          authorUsername: "ievag",
          body: "Software package approved. Waiting for the cardiac diagnostics room slot confirmation.",
        },
      ],
    },
    {
      code: "SRV-4007",
      title: "Portable ECG calibration follow-up",
      summary:
        "Verify calibration stability after the previous portable ECG service and update the release note.",
      workPerformed:
        "Repeated calibration check, confirmed stable readings, and closed the follow-up note.",
      resolution: "Portable ECG returned to normal service with no repeat drift.",
      followUpRequired: false,
      followUpActions: null,
      status: "Done",
      priority: "Low",
      scheduledAt: "2026-04-05T10:00:00.000Z",
      completedAt: "2026-04-05T12:10:00.000Z",
      systemCode: "1201-031",
      equipmentCode: "EQ-2001",
      assignedUsername: "marius",
      tasks: [
        {
          title: "Run repeat calibration",
          assignedUsername: "marius",
          dueAt: "2026-04-05T10:30:00.000Z",
          notes: "Use the April baseline profile.",
        },
      ],
      notes: [
        {
          authorUsername: "marius",
          body: "Repeat calibration matched the expected baseline. Case can be archived as completed.",
        },
      ],
    },
    {
      code: "SRV-4008",
      title: "Second review of video signal chain",
      summary:
        "Perform return visit to verify the endoscopy signal chain after cable replacement and user retest.",
      workPerformed: null,
      resolution: null,
      followUpRequired: true,
      followUpActions:
        "If the signal issue repeats, escalate with captured display evidence and service notes.",
      status: "Planned",
      priority: "High",
      scheduledAt: "2026-04-10T13:00:00.000Z",
      completedAt: null,
      systemCode: "1308-002",
      equipmentCode: "EQ-2007",
      assignedUsername: "marius",
      tasks: [
        {
          title: "Retest display chain with spare tower",
          assignedUsername: "marius",
          dueAt: "2026-04-10T13:30:00.000Z",
          notes: "Bring both the spare display adapter and signal cable kit.",
        },
        {
          title: "Document clinician acceptance",
          assignedUsername: "ievag",
          dueAt: "2026-04-10T15:00:00.000Z",
          notes: "Collect sign-off if the repeat video test stays stable.",
        },
      ],
      notes: [
        {
          authorUsername: "marius",
          body: "Planned return visit scheduled after the first signal chain inspection. Spare tower reserved.",
        },
      ],
    },
  ];

  const allServiceCaseDefinitions = [
    ...serviceCaseDefinitions,
    ...additionalServiceCaseDefinitions,
  ];

  for (const serviceCase of allServiceCaseDefinitions) {
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

    await db.serviceAssignmentEvent.deleteMany({
      where: {
        serviceCaseId: persistedCase.id,
      },
    });

    await db.serviceAttachment.deleteMany({
      where: {
        serviceCaseId: persistedCase.id,
      },
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

    const createdTasks = await db.serviceTask.findMany({
      where: {
        serviceCaseId: persistedCase.id,
      },
      include: {
        assignedUser: true,
      },
      orderBy: [{ sortOrder: "asc" }],
    });

    for (const task of createdTasks) {
      await db.serviceTaskEvent.create({
        data: {
          serviceTaskId: task.id,
          changedById: assignedUser.id,
          eventType: "seed-created",
          newTitle: task.title,
          newNotes: task.notes,
          newDueAt: task.dueAt,
          newCompleted: task.isCompleted,
          newAssigneeId: task.assignedUserId,
          newAssigneeName: task.assignedUser?.fullName ?? null,
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

    await db.serviceAssignmentEvent.create({
      data: {
        serviceCaseId: persistedCase.id,
        changedById: assignedUser.id,
        previousAssigneeId: null,
        previousAssigneeName: null,
        newAssigneeId: assignedUser.id,
        newAssigneeName: assignedUser.fullName,
      },
    });

    const storageKey = `seed-${serviceCase.code.toLowerCase()}-summary.txt`;
    const attachmentBody = [
      `Service case: ${serviceCase.code}`,
      `Title: ${serviceCase.title}`,
      `Status: ${serviceCase.status}`,
      `Priority: ${serviceCase.priority}`,
      `System: ${serviceCase.systemCode}`,
      `Equipment: ${serviceCase.equipmentCode}`,
      `Summary:`,
      serviceCase.summary ?? "No summary provided.",
    ].join("\n");

    await writeSeedAttachment(storageKey, attachmentBody);

    await db.serviceAttachment.create({
      data: {
        fileName: `${serviceCase.code.toLowerCase()}-summary.txt`,
        storageKey,
        contentType: "text/plain",
        sizeBytes: Buffer.byteLength(attachmentBody, "utf8"),
        serviceCaseId: persistedCase.id,
        uploadedById: assignedUser.id,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin username: ${DEMO_ADMIN_USERNAME}`);
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
