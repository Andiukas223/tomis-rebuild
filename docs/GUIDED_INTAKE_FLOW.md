# Guided Intake Flow

## Pattern Name

Use this name in the project:

- `Guided Intake Flow`

Short reference name:

- `GIF`

Meaning:

- a structured, multi-step data-entry flow for complex operational records
- especially useful when a user must enter a lot of information in sequence with decisions, timers, and summaries

## Why This Pattern Matters

The prototype’s `+ New Service Job` flow is strong because it does not behave like one long form.
It behaves like an operational process:

- each step has a clear purpose
- conditional logic appears only when needed
- the user sees progression
- timers and decisions are embedded where the work actually happens
- the final summary gives confidence before submit

This should become the rebuild’s standard pattern for large, structured record entry.

## Prototype Step Model

From the reference prototype, the flow currently works as:

1. Job Info
2. Assign FE
3. Diagnostics
4. Contract
5. Parts
6. Repair
7. Complete
8. Summary

## Reusable Flow Principles

### Structural Rules

- modal or dedicated focused workspace
- visible stepper across the top
- one primary step goal at a time
- `Back` and `Continue` actions at the bottom
- final summary and submit checkpoint

### Input Rules

- show only the fields needed for the current step
- reveal branch fields only after a decision is made
- use decision cards instead of raw booleans when the branch matters
- use info/warn/success boxes to explain operational consequences

### Operational Rules

- time-tracking belongs inside the relevant step, not as disconnected metadata
- branch logic should mirror real-world process logic
- summary step should collect the full operational story, not only field values

## Design Goals For Guided Intake Flow In Our App

1. Reuse one consistent stepper layout for all complex input pipelines.
2. Keep users inside a guided process instead of showing a huge form.
3. Support decisions, timers, and conditional sections without overwhelming the page.
4. Make summary/review mandatory before final submit for high-impact records.
5. Keep the prototype’s dense, practical visual language rather than turning the wizard into a generic onboarding flow.

## Where To Use It

### Immediate

Registry should be the first adoption area for trial and refinement.

Best first candidates:

1. `Registry / Hospitals`
2. `Registry / Companies`
3. `Registry / Manufacturers`

Recommended first rollout idea:

- combine identity, location, commercial/contact, and quality/reference info into staged entry

### Next

- Catalog entities with heavier data requirements
- Service job creation itself
- future Tasks and Warehouse workflows

## Proposed Registry Trial Flows

### Hospitals

Suggested steps:

1. Identity
2. Address
3. Contacts
4. Service Context
5. Review

### Companies

Suggested steps:

1. Identity
2. Legal / Commercial
3. Address
4. Contacts
5. Review

### Manufacturers

Suggested steps:

1. Identity
2. Geography / Website
3. Support / Service Context
4. Review

## Engineering Plan

### Phase 1

- build a shared `Guided Intake Flow` shell component
- include:
  - stepper
  - back / next / submit actions
  - per-step validation
  - summary step support
  - optional decision cards
  - optional info boxes

### Phase 2

- implement the first real trial in `Registry / Hospitals`
- compare usability against the current single-page form

### Phase 3

- refine the shared pattern based on the hospital flow
- apply to `Companies`
- apply to `Manufacturers`

### Phase 4

- decide whether Service job creation should be migrated fully to `Guided Intake Flow`

## Implementation Notes

- do not convert every simple CRUD form into a wizard
- use `Guided Intake Flow` only when:
  - the record has many fields
  - the fields are naturally sequential
  - there is branching logic
  - the user benefits from summary/review

## Next Recommended Build Step

The first actual UI implementation should be:

1. create a shared `Guided Intake Flow` component
2. apply it to `Registry / Hospitals`
3. keep the existing simple form as fallback until the new flow is stable
