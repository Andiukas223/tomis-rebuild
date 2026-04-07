export type NavigationChild = {
  label: string;
  href: string;
};

export type NavigationGroup = {
  label: string;
  href: string;
  description: string;
  children?: NavigationChild[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    description: "Overview and fast access to the main business areas.",
  },
  {
    label: "Catalog",
    href: "/catalog",
    description: "Systems, products, equipment, and category management.",
    children: [
      { label: "Systems", href: "/catalog/systems" },
      { label: "Products", href: "/catalog/products" },
      { label: "Equipment", href: "/catalog/equipment" },
      { label: "Categories", href: "/catalog/categories" },
    ],
  },
  {
    label: "Sales",
    href: "/sales",
    description: "Client requests, offers, and sales order workflows.",
  },
  {
    label: "Service",
    href: "/service",
    description: "Service operations, defect flows, contracts, and planning.",
    children: [
      { label: "Operations", href: "/service" },
      { label: "Reports", href: "/service/reports" },
    ],
  },
  {
    label: "Tasks",
    href: "/tasks",
    description: "Jobs, visits, and execution tracking.",
  },
  {
    label: "Warehouse",
    href: "/warehouse",
    description: "Stock requests, balances, movements, and reservations.",
  },
  {
    label: "Documents",
    href: "/documents",
    description: "Document records, uploads, and generated outputs.",
    children: [{ label: "Generated reports", href: "/documents" }],
  },
  {
    label: "Office",
    href: "/office",
    description: "Internal office resources such as vehicles and leave.",
  },
  {
    label: "Registry",
    href: "/registry",
    description: "Companies, hospitals, manufacturers, and addresses.",
    children: [
      { label: "Hospitals", href: "/registry/hospitals" },
      { label: "Companies", href: "/registry/companies" },
      { label: "Manufacturers", href: "/registry/manufacturers" },
    ],
  },
  {
    label: "Administration",
    href: "/administration",
    description: "Users, roles, types, and master data management.",
  },
];

export const primaryOrganization = {
  id: "tradintek-lt",
  name: "Tradintek, Lietuva, UAB",
};
