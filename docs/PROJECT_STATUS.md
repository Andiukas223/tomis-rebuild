# Project Status

## Summary

The rebuild is now a working multi-module business app, not just a scaffold. The repository contains:

- protected auth and session management
- real registry master data
- catalog entities with linked relationships
- service operations with dispatch, execution-focused task handling, attachments, notes, completion records, reporting, and printable summaries
- document records for saved generated service reports
- role-aware shell filtering plus broad route and API permission enforcement
- shared compact GUI pass across major module landing pages and queued categories

## Completed Foundations

- Next.js application scaffold
- Dockerized local runtime
- PostgreSQL database container
- Prisma schema and migrations
- seeded organization and service users
- seeded read-only operations viewer role
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
- compact page-level metric strip and indexed working-view layouts for systems, products, and equipment

### Registry

- `hospitals` list, detail, guided create/edit flow, delete when unlinked
- `companies` list, detail, guided create/edit flow, delete
- `manufacturers` list, detail, guided create/edit flow, delete when unlinked
- relation-aware deletion guards
- expanded registry fields for hospital, company, and manufacturer context
- Registry-wide Guided Intake Flow rollout is now live
- compact list-first registry landing and list-page layouts are now aligned more closely with the prototype density goals

### Service

- service case list, detail, create, edit, delete
- contextual filtering by system and equipment
- technician assignment from list, dashboard suggestion, and API
- assignment change audit history
- task checklists with per-task assignee, due date, notes, and execution updates
- task history events and technician-focused task queue views
- attachment upload, download, and delete
- service notes create, edit, and delete
- service completion records with follow-up tracking
- quick status transitions
- dashboard visibility for service operations and dispatch pressure
- service reports page with filtered KPIs and CSV-aligned exports
- printable service operational summary route
- compact page-level service operations, task queue, and reports layouts with top metric strips and indexed view blocks

### Documents

- generated report records list
- generated report detail pages with saved KPI snapshots
- save-from-report workflow for service operational summaries
- saved report print views, HTML download output, pinning, workflow status, labels, and bulk list actions
- compact documents overview layout with slim metrics and indexed history views

### Permissions

- role-aware navigation and dashboard launch points
- API-level capability checks on sensitive catalog, registry, service, and document mutations
- direct create/edit route protection for restricted roles
- detail-page action cleanup for read-only users
- seeded read-only `Operations Viewer` account for verification

## Current Delivery Focus

Priority order from highest impact to lowest:

1. service workflow refinement
2. compact GUI parity inside list and table surfaces
3. bug fixing and UX consistency pass
4. tasks module
5. warehouse foundation
6. documents expansion
7. master data expansion
8. sales and order workflows
9. migration tooling
10. automated QA coverage
11. production hardening
12. administration and role-management UI

Detailed milestone breakdown:

- see [ROADMAP.md](/c:/Users/Andrejus/Documents/PROJEKTELIAI%20VS%20CODE/T%20analysis/tomis-rebuild/docs/ROADMAP.md)
- visual reference: see [GUI_REFERENCE.md](/c:/Users/Andrejus/Documents/PROJEKTELIAI%20VS%20CODE/T%20analysis/tomis-rebuild/docs/GUI_REFERENCE.md)
- multi-step pattern reference: see [GUIDED_INTAKE_FLOW.md](/c:/Users/Andrejus/Documents/PROJEKTELIAI%20VS%20CODE/T%20analysis/tomis-rebuild/docs/GUIDED_INTAKE_FLOW.md)

## Important Architecture Decisions

- sessions are stored in the database and referenced by HTTP-only cookies
- organization scoping is enforced in server queries for active modules
- destructive actions are guarded both in the API and in the UI
- service workflow data is normalized into `ServiceCase`, `ServiceTask`, `ServiceAttachment`, and `ServiceNote`
- assignment changes are normalized into `ServiceAssignmentEvent`
- generated report snapshots are normalized into `GeneratedReport`
- uploaded service files are stored on disk under a mounted Docker volume path
- route- and action-level access is now driven by shared role capability rules

## Verified Behaviors

- login redirects into the protected dashboard
- stale login redirect loop was removed by simplifying middleware handling
- systems CRUD works end to end
- hospitals, companies, and manufacturers work end to end
- products and equipment render with linked manufacturer data
- service case assignment and task updates work
- task assignee, due date, and execution note updates work
- service attachments upload, download, and delete work
- service note editing and deletion work and appear in the case timeline
- service completion details save and render correctly
- dispatch assignment events are written and appear in service history
- service reports render with filters and filtered CSV export
- printable service reports render correctly
- saved service reports appear in Documents and preserve snapshot data
- read-only viewer flows now hide create/edit/delete shortcuts across shell, routes, and major detail pages

## Known Gaps

- login page does not yet auto-forward valid sessions again after the loop fix
- the attachment route triggers a non-blocking Turbopack tracing warning during build
- there is still no dedicated Administration UI for managing users and role assignments
- there is no standalone Tasks module yet, even though service tasks are now richer
- automated tests are still missing for most critical workflows
- the frontend still does not visually match the Tradintek prototype closely enough outside Registry
- table internals and filter bars still need a dedicated compact parity pass in Catalog, Service, and Documents
- service task queue and history are still nested under Service rather than a standalone Tasks module

## Next Recommended Steps

1. deepen service workflow with stronger planning views and broader technician execution coverage
2. compact the table, filter, and list internals in Catalog, Service, and Documents
3. run a bug and UX consistency pass across Documents, Service, Catalog, and the new permission states
4. start the dedicated Tasks module using the richer service-task model as the foundation
5. begin Warehouse foundations for service-linked stock usage

## Active GUI Work

- shared shell recoloring is underway using the prototype palette
- topbar, sidebar, page-header, and stat-card styling are being aligned to the prototype's navy, orange, border, and radius rules
- compact category pages are now live across Dashboard, Catalog, Registry, Service, Documents, and queued module placeholders
- the next GUI slice is deeper table and filter parity so the inside of working pages matches the newer shell and page-level layout
