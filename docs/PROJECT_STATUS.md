# Project Status

## Summary

The rebuild is now a working multi-module business app, not just a scaffold. The repository contains:

- protected auth and session management
- real registry master data
- catalog entities with linked relationships
- service operations with task execution, attachments, and notes

## Completed Foundations

- Next.js application scaffold
- Dockerized local runtime
- PostgreSQL database container
- Prisma schema and migrations
- seeded organization and service users
- database-backed session model
- middleware route protection
- shared app shell and navigation

## Completed Business Slices

### Catalog

- `systems` list, detail, create, edit, delete
- `systems` search, filtering, and CSV export
- `products` list, detail, create, edit, delete
- `equipment` list, detail, create, edit, delete
- manufacturer-linked catalog relationships
- equipment-to-system linking

### Registry

- `hospitals` list, detail, create, edit, delete when unlinked
- `companies` list, detail, create, edit, delete
- `manufacturers` list, detail, create, edit, delete when unlinked
- relation-aware deletion guards

### Service

- service case list, detail, create, edit, delete
- contextual filtering by system and equipment
- technician assignment
- task checklists with completion toggles
- attachment upload, download, and delete
- service notes timeline and note creation
- quick status transitions
- dashboard visibility for service operations

## Important Architecture Decisions

- sessions are stored in the database and referenced by HTTP-only cookies
- organization scoping is enforced in server queries for active modules
- destructive actions are guarded both in the API and in the UI
- service workflow data is normalized into `ServiceCase`, `ServiceTask`, `ServiceAttachment`, and `ServiceNote`
- uploaded service files are stored on disk under a mounted Docker volume path

## Verified Behaviors

- login redirects into the protected dashboard
- stale login redirect loop was removed by simplifying middleware handling
- systems CRUD works end to end
- hospitals, companies, and manufacturers work end to end
- products and equipment render with linked manufacturer data
- service case assignment and task updates work
- service attachments upload, download, and delete work
- service note creation works and appears in the case timeline

## Known Gaps

- login page does not yet auto-forward valid sessions again after the loop fix
- service notes are create-only for now
- service timeline is useful but still basic
- the attachment route triggers a non-blocking Turbopack tracing warning during build

## Next Recommended Steps

1. add service note editing and deletion
2. refine the activity timeline so notes, attachment events, and status changes read as one history
3. add technician workload planning to dashboard and service operations
4. introduce role-based permissions beyond authenticated access
5. add end-to-end coverage for auth and service flows
