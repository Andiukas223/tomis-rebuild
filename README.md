# Tomis Rebuild App

This repository is the active rebuild workspace for the Tomis business platform.
The goal is to replace the current app with a cleaner, safer, and more maintainable system while preserving the core operational workflows.

## Current Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Docker

## Current State

The rebuild now includes:

- real login, logout, session lookup, and protected routes
- HTTP-only cookie auth with database-backed sessions
- Dockerized web + PostgreSQL setup
- protected shell with sidebar, topbar, dashboard, and module routing
- registry master data for hospitals, companies, and manufacturers
- catalog modules for systems, products, and equipment
- service operations with assignment, task checklists, attachments, notes, completion records, dispatch actions, and reporting
- organization-scoped APIs and server-rendered detail pages

Planning and reverse-engineering notes live one level above this app in the parent workspace documentation.

## Working Modules

### Auth and Shell

- `GET /api/auth/session`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- middleware protection for private routes
- `/dashboard`
- `/login`

### Catalog

- `/catalog`
- `/catalog/systems`
- `/catalog/systems/new`
- `/catalog/systems/[id]`
- `/catalog/systems/[id]/edit`
- `/catalog/products`
- `/catalog/products/new`
- `/catalog/products/[id]`
- `/catalog/products/[id]/edit`
- `/catalog/equipment`
- `/catalog/equipment/new`
- `/catalog/equipment/[id]`
- `/catalog/equipment/[id]/edit`
- `/api/systems`
- `/api/systems/[id]`
- `/api/systems/export`
- `/api/products`
- `/api/products/[id]`
- `/api/products/export`
- `/api/equipment`
- `/api/equipment/[id]`
- `/api/equipment/export`

### Registry

- `/registry`
- `/registry/hospitals`
- `/registry/hospitals/new`
- `/registry/hospitals/[id]`
- `/registry/hospitals/[id]/edit`
- `/registry/companies`
- `/registry/companies/new`
- `/registry/companies/[id]`
- `/registry/companies/[id]/edit`
- `/registry/manufacturers`
- `/registry/manufacturers/new`
- `/registry/manufacturers/[id]`
- `/registry/manufacturers/[id]/edit`
- `/api/hospitals`
- `/api/hospitals/[id]`
- `/api/companies`
- `/api/companies/[id]`
- `/api/manufacturers`
- `/api/manufacturers/[id]`

### Service

- `/service`
- `/service/reports`
- `/service/new`
- `/service/[id]`
- `/service/[id]/edit`
- `/api/service-cases`
- `/api/service-cases/[id]`
- `/api/service-cases/[id]/assignment`
- `/api/service-cases/[id]/completion`
- `/api/service-cases/[id]/status`
- `/api/service-cases/[id]/attachments`
- `/api/service-cases/[id]/attachments/[attachmentId]`
- `/api/service-cases/[id]/notes`
- `/api/service-cases/[id]/notes/[noteId]`
- `/api/service-cases/export`
- `/api/service-tasks/[id]`

## Data Model

The current Prisma schema includes:

- `Organization`
- `User`
- `Session`
- `Hospital`
- `Company`
- `Manufacturer`
- `System`
- `Product`
- `Equipment`
- `ServiceCase`
- `ServiceTask`
- `ServiceAttachment`
- `ServiceNote`
- `ServiceAssignmentEvent`

Key relationships:

- `System` references `Hospital`
- `Product` references `Manufacturer`
- `Equipment` references `Manufacturer` and can link to `System`
- `ServiceCase` references `System`, optional `Equipment`, and optional assigned `User`
- `ServiceTask`, `ServiceAttachment`, and `ServiceNote` all belong to `ServiceCase`
- `ServiceAssignmentEvent` captures assignment ownership changes for `ServiceCase`

## Local Setup

Create a local environment file from the example:

```bash
copy .env.example .env
```

Run locally:

```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

## Docker

Start the full stack:

```bash
docker compose up --build
```

Services:

- app: `http://localhost:3002`
- postgres host: `localhost`
- postgres port: `5433`
- postgres database: `tomis_rebuild`
- postgres user: `tomis`

Uploaded service attachments are stored in `storage/service-attachments` and mounted into the container.

You can also use the Windows control menu:

```bat
tomis-control.cmd
```

## Seeded Access

Default seeded admin account:

- username: `anlo`
- password: `dev-admin-pass`

Additional seeded service users:

- `marius`
- `ievag`

Override the seed password with `SEED_ADMIN_PASSWORD` if needed.

## Useful Commands

```bash
npm run dev
npm run lint
npm run build
npm run prisma:generate
npm run prisma:deploy
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
docker compose up -d --build web
docker compose up -d db
```

## Current Priorities

Recommended next implementation slices:

1. grouped KPI views and deeper slicing on service reports
2. generated operational report output or printable summaries
3. stronger role and permission enforcement
4. test coverage for auth and critical service/catalog flows
5. broader module expansion beyond service, catalog, and registry

## Notes

- `.playwright-cli`, `.next`, and `node_modules` are generated artifacts and should not be committed
- `.env.example` is safe to commit; real `.env` values should stay local
- service attachments persist under `storage/service-attachments`
- linked registry records are protected from destructive actions when in active use
- service reporting now supports technician, status, and date-range filtered review plus matching CSV export
