# Project Status

## Summary

The rebuild has moved beyond scaffolding. The repository now contains a working protected app shell, real database-backed auth, and two real business slices:

- `catalog/systems`
- `registry/hospitals`

## Completed Foundations

- Next.js application scaffold
- Dockerized local runtime
- PostgreSQL database container
- Prisma schema and migrations
- seeded organization and admin user
- database-backed session model
- middleware route protection
- shared app shell and navigation

## Completed Business Slices

### Catalog / Systems

- list
- search
- status filtering
- CSV export
- detail
- create
- edit
- delete

### Registry / Hospitals

- list
- detail
- create
- edit
- delete when unlinked
- delete protection when linked to systems

## Important Architecture Decisions

- sessions are stored in the database and referenced by HTTP-only cookies
- systems are normalized to hospitals through a foreign key
- destructive actions are guarded both in the API and in the UI
- organization scoping is enforced in server queries for active modules

## Verified Behaviors

- login redirects into the protected dashboard
- systems CRUD works end to end
- systems search and status filtering work
- systems CSV export works
- hospital CRUD works end to end
- linked hospital deletion is blocked correctly

## Next Recommended Steps

1. add `registry/companies`
2. introduce role-based permissions beyond simple authenticated access
3. add pagination/sorting conventions to shared list screens
4. normalize more registry and catalog entities
5. add end-to-end tests for auth, systems, and hospitals
