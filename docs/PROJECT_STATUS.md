# Project Status

## Summary

The rebuild is now a working multi-module business app, not just a scaffold. The repository contains:

- protected auth and session management
- real registry master data
- catalog entities with linked relationships
- service operations with dispatch, task execution, attachments, notes, completion records, reporting, and printable summaries
- document records for saved generated service reports

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
- technician assignment from list, dashboard suggestion, and API
- assignment change audit history
- task checklists with completion toggles
- attachment upload, download, and delete
- service notes create, edit, and delete
- service completion records with follow-up tracking
- quick status transitions
- dashboard visibility for service operations and dispatch pressure
- service reports page with filtered KPIs and CSV-aligned exports
- printable service operational summary route

### Documents

- generated report records list
- generated report detail pages with saved KPI snapshots
- save-from-report workflow for service operational summaries

## Important Architecture Decisions

- sessions are stored in the database and referenced by HTTP-only cookies
- organization scoping is enforced in server queries for active modules
- destructive actions are guarded both in the API and in the UI
- service workflow data is normalized into `ServiceCase`, `ServiceTask`, `ServiceAttachment`, and `ServiceNote`
- assignment changes are normalized into `ServiceAssignmentEvent`
- generated report snapshots are normalized into `GeneratedReport`
- uploaded service files are stored on disk under a mounted Docker volume path

## Verified Behaviors

- login redirects into the protected dashboard
- stale login redirect loop was removed by simplifying middleware handling
- systems CRUD works end to end
- hospitals, companies, and manufacturers work end to end
- products and equipment render with linked manufacturer data
- service case assignment and task updates work
- service attachments upload, download, and delete work
- service note editing and deletion work and appear in the case timeline
- service completion details save and render correctly
- dispatch assignment events are written and appear in service history
- service reports render with filters and filtered CSV export
- printable service reports render correctly
- saved service reports appear in Documents and preserve snapshot data

## Known Gaps

- login page does not yet auto-forward valid sessions again after the loop fix
- the attachment route triggers a non-blocking Turbopack tracing warning during build
- generated reports do not yet support custom naming, notes, or dedicated export formats
- role-based permissions are still broad authenticated access rather than explicit capability rules

## Next Recommended Steps

1. add naming and notes to generated report records
2. let saved reports reopen into printable document views or dedicated export outputs
3. introduce role-based permissions beyond authenticated access
4. add end-to-end coverage for auth and service flows
5. expand into the next operational business modules
