# Source Web Improvement Plan

## Audit Scope

This plan is based on a live browser audit of the current Tomis system on April 8, 2026.

Observed source routes:

- `/`
- `/services`
- `/services/service-requests`
- `/services/service-requests/[id]`
- `/registry/hospitals`
- `/catalog/systems`

Observed rebuild comparison target:

- local `tomis-rebuild` application in this repository

## What The Source Web Does Better Today

### 1. Data Density

The source web already feels alive because lists are heavily populated and linked.

Observed examples:

- `catalog/systems` shows deep pagination with `482` pages
- `registry/hospitals` shows `37` pages
- `services/service-requests` shows many linked rows with real company, hospital, and system references

Impact on our rebuild:

- our pages often prove structure, but not operational scale
- the app feels less trustworthy because users cannot see enough realistic records and linked follow-up work

### 2. Linked Detail Depth

The source service-request detail page is much richer than our current service-case detail.

Observed detail sections:

- client request details
- task information
- task status timeline
- description
- request documents
- planned visits
- completed visits
- quick-create actions for related records

Impact on our rebuild:

- our service detail is useful, but still too narrow
- users cannot move through the full operational chain from one case screen

### 3. Service Submodule Breadth

The source service area is not one list. It is a group of related workflows.

Observed service module entries:

- service requests
- defect acts
- commercial offers
- part orders
- hospital contracts
- vendor contracts
- scheduled jobs

Impact on our rebuild:

- our Service module is stronger in workflow polish than breadth
- the source product gives users more places to continue work without leaving the domain

### 4. Table-First Working Style

The source web uses compact, list-first working pages with:

- quick refresh
- export
- create
- filter/search
- status chips
- compact action buttons
- pagination
- cross-links into related records

Impact on our rebuild:

- our pages are improving visually, but many internals still feel lighter than the source
- users need more list power and more visible record relationships

### 5. Better Operational Cross-Linking

The source app repeatedly links records together:

- service request -> system
- service request -> company
- service request -> hospital
- system -> equipment
- detail page -> related documents and visits

Impact on our rebuild:

- we have some links already, but not enough downstream sections
- users should be able to continue the next logical action from the current record

## Main Gap Categories In Our Rebuild

### Gap A: Not Enough Populated Operational Data

We need much richer seed and demo data so the app behaves like a working business system, not just a shell with sample entries.

### Gap B: Service Is Not Wide Enough Yet

Service needs more connected submodules and more secondary records under each case.

### Gap C: Detail Pages Need More Related Sections

Users should see related documents, visits, tasks, and status history directly on the main record page.

### Gap D: Table Surfaces Need More Power

Tables need stronger parity in:

- filters
- status chips
- pagination
- action placement
- linked columns
- dense operational rhythm

### Gap E: Some Categories Still Feel Empty

Sales, Warehouse, Office, Tasks, and Administration still read as placeholders compared with the source system.

## Revised Priority Order

1. populate realistic linked data across Catalog, Registry, and Service
2. deepen Service detail pages and add secondary related sections
3. expand Service breadth toward source parity
4. compact and strengthen all table/filter/list internals
5. improve Catalog and Registry detail parity with richer related blocks
6. build the standalone Tasks workflow from service task data
7. begin Warehouse foundations
8. expand Documents from saved reports into operational records
9. expand Sales and commercial flows
10. stabilize, test, and harden

## Detailed Improvement Plan

### Phase 1: Data Population And Trust Building

Goal:

- make the app feel populated, connected, and believable immediately

Tasks:

- increase seed volume for hospitals, companies, manufacturers, systems, products, equipment, and service cases
- seed many-to-many style relationships through realistic linked records
- ensure every major table has enough records to exercise pagination
- add varied statuses, priorities, owners, and date ranges
- add incomplete and in-progress service records so `continue filling` always has value
- seed service documents, notes, tasks, and attachments metadata more deeply

Success criteria:

- catalog, registry, and service lists feel operational on first login
- dashboard, service, and tasks show meaningful recent and active work

### Phase 2: Service Detail Parity

Goal:

- make a service case page feel like the main control center for that job

Tasks:

- split service detail into clearer panels:
  - request details
  - workflow status
  - linked asset context
  - task execution
  - related documents
  - planned visits
  - completed visits
  - notes and attachments
- add quick-create actions for related records from the case page
- add a more visible operational timeline
- improve unfinished-case resume behavior so users always know the next step

Success criteria:

- a user can create, continue, execute, document, and review most service work from one case page

### Phase 3: Service Breadth Expansion

Goal:

- move Service closer to the source app's module breadth

Tasks:

- add `Defect Acts`
- add `Commercial Offers`
- add `Part Orders`
- add `Hospital Contracts`
- add `Vendor Contracts`
- add `Scheduled Jobs`

Implementation note:

- these can begin as focused operational modules linked to existing service cases, not fully independent ecosystems on day one

Success criteria:

- Service becomes a family of connected workflows, not only a case list

### Phase 4: Table And Filter Parity Pass

Goal:

- make working pages feel dense, efficient, and source-like

Tasks:

- standardize header actions: refresh, export, create
- standardize compact filter rows
- add stronger status-chip usage
- add denser row rhythm and consistent action columns
- add pagination everywhere a larger seed set exists
- add more linked column content instead of plain text only
- align table action buttons and hover behavior with the source logic

Priority pages:

- `catalog/systems`
- `catalog/products`
- `catalog/equipment`
- `service`
- `service/tasks`
- `service/reports`
- `documents`
- registry list pages

### Phase 5: Catalog And Registry Detail Enrichment

Goal:

- make detail pages carry more operational context and next-step actions

Tasks:

- add related service history to systems and equipment more prominently
- add related products/equipment/companies to manufacturer views
- add related systems and service work to hospital/company detail pages
- show key summary strips at the top of detail pages
- improve cross-links between registry, catalog, and service records

Success criteria:

- users can navigate through the data model naturally from any detail page

### Phase 6: Tasks Module Promotion

Goal:

- turn service-task execution into a first-class module

Tasks:

- promote `/service/tasks` logic into a fuller standalone Tasks area
- add task detail pages
- add task ownership and scheduling dashboards
- keep service-linked context visible from the task view

### Phase 7: Warehouse Foundations

Goal:

- support part usage and future stock-linked service work

Tasks:

- stock item records
- stock balance visibility
- stock movement history
- reservation to service job flow
- part order linkage

### Phase 8: Documents Expansion

Goal:

- evolve Documents from generated reports into operational record storage

Tasks:

- support saved service documents beyond report snapshots
- link documents directly to service cases, visits, and future defect acts
- add typed document categories
- improve generated print/export packages

## Recommended Build Sequence For The Next Sprints

### Sprint A

- data population upgrade
- service detail parity
- service case edit flow alignment with the wizard

### Sprint B

- defect acts
- scheduled jobs
- stronger documents inside service

### Sprint C

- table/filter parity pass
- richer catalog and registry detail blocks

### Sprint D

- standalone tasks
- warehouse foundations

## Notes For Future Decisions

- Do not chase exact one-to-one parity in every module immediately.
- First copy the source product's operational strengths:
  - populated lists
  - linked records
  - dense working pages
  - next-step actions from detail views
- Our rebuild can stay cleaner technically while still matching the practical working style of the source system.
