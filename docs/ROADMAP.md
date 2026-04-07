# Product Roadmap

## Priority Order

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

## Milestone Backlog

### Milestone 1: Service Operations Upgrade

Goal:
- turn Service into the strongest day-to-day operational module

Tasks:
- refine technician execution flow
- improve checklist and task execution UX
- expand task-level history, ownership clarity, and stronger overdue visibility
- improve dispatch and planning board behavior
- extend follow-up and completion workflows

### Milestone 2: Visual Parity and Guided Intake Flow

Goal:
- capture the Tradintek prototype visual language and reuse its strongest input-flow pattern in the rebuild

Status:
- Registry rollout complete
- shared shell and compact page-level parity in progress

Tasks:
- align the rebuild color system, button hierarchy, and page-header actions with the prototype outside Registry
- restyle the shared shell to match the prototype's topbar, sidebar, border, and card density
- restyle Service, Documents, Catalog, and queued modules around the prototype's dense operational UI language
- compact table and filter surfaces so the inner working areas match the new square, list-first page shells
- reuse the shared `Guided Intake Flow` pattern for future heavy-input workflows

### Milestone 3: Stabilization Pass

Goal:
- reduce friction across the modules that already exist

Tasks:
- unify table actions and filters
- standardize form validation and error states
- clean loading states and redirects
- fix inconsistent copy and layout details
- log and resolve high-frequency user-facing bugs

### Milestone 4: Tasks Module

Goal:
- add a dedicated execution layer that complements Service

Tasks:
- task list, detail, create, edit
- assign users and due dates
- link tasks to service cases and assets
- add dashboard visibility for outstanding work

### Milestone 5: Warehouse Foundation

Goal:
- start stock and movement tracking needed by service and future sales flows

Tasks:
- stock items and stock balances
- inward and outward movements
- reservation flow for service usage
- asset and product linkage

### Milestone 6: Documents Expansion

Goal:
- evolve Documents from saved reports into a broader business module

Tasks:
- richer generated outputs
- attachment linking across modules
- better saved-report lifecycle handling
- printable and downloadable handoff quality

### Milestone 7: Master Data Expansion

Goal:
- normalize more business relationships before migration work begins

Tasks:
- additional registry entities
- shared reference data patterns
- broader search and filters across linked modules

### Milestone 8: Sales and Orders

Goal:
- extend the rebuild beyond service-led operations into commercial workflows

Tasks:
- sales requests
- offers
- orders
- company and document linkage

### Milestone 9: Migration Tooling

Goal:
- prepare controlled movement from the existing system into the rebuild

Tasks:
- map old entities to new schema
- build import scripts
- validate duplicates and broken references
- run trial migrations against safe sample data

### Milestone 10: QA Automation

Goal:
- protect critical workflows from regressions

Tasks:
- auth smoke coverage
- service workflow API coverage
- catalog and registry CRUD coverage
- permission regression checks

### Milestone 11: Production Hardening

Goal:
- make deployment and operations safe

Tasks:
- backups and restore path
- monitoring and logging
- security review
- environment separation
- deployment checklist

### Milestone 12: Administration and Roles

Goal:
- add first-class internal administration for users and permissions

Tasks:
- user list and detail
- role assignment UI
- activation and deactivation flow
- audit visibility for role changes
