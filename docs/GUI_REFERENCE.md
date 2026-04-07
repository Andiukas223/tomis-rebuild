# GUI Reference

## Goal

Capture the visual language of the local Tradintek prototype one-to-one where practical, then apply it deliberately inside the rebuild instead of drifting into a generic admin UI.

Reference source:

- `C:\Users\Andrejus\OneDrive - UAB Tradintek\Andrejaus dalykai\TOMIS\proto new\tradintek_proto#2.html`

## Core Visual Identity

### Typography

- primary font direction: compact sans with strong headings
- supporting technical font direction: mono for counts, IDs, statuses, and operational metadata
- hierarchy style:
  - strong compact page titles
  - uppercase micro-labels for sections and stats
  - dense, operational text rhythm

### Color System

Reference palette from the prototype:

- `--navy: #0f2352`
- `--navy-mid: #1a3570`
- `--navy-light: #2a4fa8`
- `--navy-pale: #e8edf8`
- `--orange: #e07020`
- `--orange-lt: #fff3e8`
- `--orange-dk: #b85a10`
- `--steel: #6b7fa8`
- `--steel-lt: #c8d0e0`
- `--bg: #f2f4f8`
- `--bg-white: #ffffff`
- `--text: #141e38`
- `--text-mid: #3a4868`
- `--text-muted: #7a88a8`
- `--border: #dde2ee`
- `--border-mid: #c8d0e0`
- `--green: #1a8a50`
- `--green-lt: #e6f5ee`
- `--red: #c82828`
- `--red-lt: #fde8e8`
- `--amber: #c88000`
- `--amber-lt: #fff8e0`

### Layout Language

- dark navy topbar
- dark navy left sidebar
- light gray app background
- white content surfaces with thin borders
- compact spacing
- low-radius corners with restrained shadows
- operational density over decorative spacing

### Component Language

- orange is the primary action color for create and start-flow actions
- navy is the structural color for navigation and emphasis
- warning states use amber
- destructive states use red
- positive states use green
- cards, tiles, and tables are dense and operational, not decorative

## Placement Logic To Preserve

### Top-Level Actions

- page-level creation actions sit in the page header on the right
- the most important action is orange
- secondary reference actions are ghost buttons next to it

Examples to preserve:

- `+ New Service Job`
- `View Process Flow`

### Navigation Structure

- topbar for brand and current user
- sidebar for major modules
- page header for local context
- content area starts with summary or alert cards, then moves into modules or records

### Dashboard Logic

- first row: operational count cards
- second layer: module tiles
- third layer: alert-oriented tiles or lists

The prototype is not trying to feel minimal. It is trying to feel operational and informative immediately.

## Component Patterns To Recreate

### Buttons

- `btn-orange`: primary create or launch action
- `btn-primary`: dark navy structural action
- `btn-ghost`: secondary view, filter, or back action
- compact small buttons for secondary list-table actions

### Status Surfaces

- left-border alert cards for important metrics
- chips for state:
  - open
  - done
  - pending
  - missed

### Tiles

- module tiles
- alert tiles
- grid layout with dense scanning behavior
- icon + title + meta

### Tables

- pale table header
- uppercase small table labels
- hover row highlight
- compact row height

## Design Goals For The Rebuild

1. Move the app closer to the prototype's navy-orange operational identity.
2. Preserve compact, information-dense layouts instead of oversized modern cards.
3. Standardize create actions so they sit in the page header and use the orange primary button.
4. Introduce the prototype's visual rhythm to Registry first, then spread it to Catalog, Service, and Documents.
5. Rebuild alert tiles and module tiles with the same placement logic, not only similar colors.

## Implementation Order

### Phase 1

- extract the prototype color palette into app-wide CSS variables
- align button variants with prototype hierarchy
- align page-header action placement
- restyle the shared shell: topbar, sidebar, page header, stat cards, and border radii

### Phase 2

- restyle Registry landing page to match prototype tile density and alerts
- restyle Registry list/detail pages to match table/card visual weight

### Phase 3

- bring Dashboard closer to prototype module-tile and alert-card logic
- align Service landing page with prototype action hierarchy

### Phase 4

- unify forms and wizard styling around the same visual system

## First Adoption Targets

Use this visual reference first in:

1. `Registry` landing page
2. `Registry / Hospitals`
3. `Registry / Companies`
4. `Registry / Manufacturers`

These are good first targets because they are data-heavy but lower risk than Service.

## Current Progress

- Registry has the first real prototype-inspired intake interaction pattern
- the prototype color system is now the target shared visual language
- shared shell parity is now established as the base GUI pass:
  - topbar
  - sidebar
  - page headers
  - stat cards
  - global border and radius treatment
- compact category and landing layouts are now live across:
  - Dashboard
  - Catalog
  - Registry
  - Service
  - Documents
  - queued placeholder modules
- the current GUI gap is deeper table and filter parity:
  - compact filter bars
  - denser table headers and row rhythm
  - more square action buttons inside working lists
