# Tomis Rebuild App

This repository is the active rebuild workspace for the Tomis business platform.  
The goal is to replace the current app with a cleaner, safer, and more maintainable system while preserving the core business workflows.

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
- real `catalog/systems` CRUD
- real `registry/hospitals` CRUD
- normalized relation from systems to hospitals
- search, status filtering, and CSV export for systems

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
- `/api/systems`
- `/api/systems/[id]`
- `/api/systems/export`

### Registry

- `/registry`
- `/registry/hospitals`
- `/registry/hospitals/new`
- `/registry/hospitals/[id]`
- `/registry/hospitals/[id]/edit`
- `/api/hospitals`
- `/api/hospitals/[id]`

## Data Model

The current Prisma schema includes:

- `Organization`
- `User`
- `Session`
- `Hospital`
- `System`

`System` now references `Hospital` through `hospitalId` instead of storing a free-text hospital name.

## Local Setup

Create a local environment file from the example:

```bash
copy .env.example .env
```

Run locally:

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
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

You can also use the Windows control menu:

```bat
tomis-control.cmd
```

## Seeded Access

Default seeded admin account:

- username: `anlo`
- password: `dev-admin-pass`

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
```

## Current Priorities

Recommended next implementation slices:

1. registry companies
2. stronger role and permission enforcement
3. more normalized catalog entities
4. tasks and service workflows
5. test coverage for critical CRUD and auth flows

## Notes

- `.playwright-cli`, `.next`, and `node_modules` are generated artifacts and should not be committed
- `.env.example` is safe to commit; real `.env` values should stay local
- linked hospitals cannot be deleted until dependent systems are reassigned or removed
