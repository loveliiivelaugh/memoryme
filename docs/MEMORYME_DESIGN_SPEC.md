# MemoryMe Design Spec

## Purpose
This document gives a design agent a concrete UX and visual design brief for MemoryMe.

It should be used alongside:
- `docs/MEMORYME_PRODUCT_SPEC.md`
- `docs/HANDOFF_STATUS.md`

## Design Goal
Design MemoryMe as a calm but powerful knowledge cockpit for a founder/operator managing:
- personal memory
- agent memory
- project knowledge
- distributed system knowledge
- canonical long-term context

The product should feel like a trusted operating console for memory, not a generic admin dashboard and not a consumer note-taking app.

## Core Experience Statement
"I can instantly see what my agents learned, decide what matters, and maintain a trusted long-term memory layer."

## Design Principles
1. High signal over decoration
2. Provenance is always visible
3. Triage is faster than browsing
4. Canonical knowledge feels durable and trustworthy
5. Agent operations feel operational, not abstract
6. Search is a first-class control surface
7. Dense information should still feel calm

## Product Personality
### Tone
- intelligent
- grounded
- operational
- calm
- premium
- clear

### Avoid
- crypto dashboard energy
- noisy analytics spam
- playful consumer productivity vibes
- cluttered admin-template layouts
- over-illustrated empty states
- gimmicky 3D primary workflows

## Primary User Mindset
The user is usually doing one of four things:
1. triaging fresh memories
2. looking for truth they can trust
3. inspecting what an agent/source did
4. trying to reduce confusion and duplication

The interface should optimize for those behaviors.

## UX North Star
The home screen should answer these questions within seconds:
- What changed?
- What needs my attention?
- What should I trust?
- Which agent/source needs intervention?

## Information Hierarchy
Priority order on most important screens:
1. memory content / summary
2. provenance
3. trust/confidence/freshness
4. available action
5. secondary metadata

## Primary Screens
## 1. Dashboard Home
### Purpose
Act as the mission control overview.

### Must contain
- global search / command bar
- incoming memory summary
- pending review count
- canonical updates summary
- duplicate/conflict queue summary
- failing source/agent alerts
- recent high-signal memories
- stale knowledge warnings

### Recommended layout
#### Header
- page title: `MemoryMe`
- global search / command bar centered or dominant
- quick actions on right:
  - Add Memory
  - Review Inbox
  - Open Agent Health

#### Left navigation
- Dashboard
- Inbox
- Knowledge
- Entities
- Agents
- Sources
- Search
- Settings

#### Main content
A responsive 12-column grid with:
- top row: KPI cards / state cards
- center-left: Incoming Memory Stream
- center-right: Agent Health / Alerts
- lower-left: Canonical Changes
- lower-right: Duplicate / Conflict Queue

#### Right rail
Optional on large screens:
- active filters
- recent entities
- suggested actions
- today summary

### Dashboard mood
Should feel like:
- a founder control center
- a research operations surface
- an intelligence desk

Not like:
- a backend admin panel
- a CRM
- a standard project management tool

## 2. Global Memory Inbox
### Purpose
This is the most important workflow in the product.

### Main job
Turn raw incoming memory into structured trusted memory.

### Layout recommendation
Split view.

#### Left panel
Stream/list of memory cards with:
- title/summary
- source icon + name
- agent name
- timestamp
- confidence badge
- lifecycle badge
- entity/project chips

#### Center/detail panel
Expanded memory details:
- full content
- extracted facts
- linked memories
- duplicate candidates
- related entities/projects
- source artifacts

#### Right action panel
Review actions:
- approve
- archive
- reject
- merge
- retag
- link to entity
- promote to canonical

### Interaction model
The user should be able to process many memories quickly without losing context.

Design for:
- keyboard navigation
- fast next/previous review
- multiselect / bulk operations
- inline tagging
- side-by-side duplicate comparison

### Visual emphasis
- memory state should be obvious
- provenance should never be hidden
- actions should feel fast and low-friction

## 3. Canonical Knowledge
### Purpose
Represent the durable world model.

### Mental model
This should feel more stable, curated, and trustworthy than the Inbox.

### Recommended views
- entity grid/list
- entity detail page
- relationship graph
- timeline of knowledge changes
- canonical record comparison / history

### Canonical record layout
#### Header
- entity name
- entity type
- confidence
- freshness/staleness
- last updated

#### Main section
- canonical summary
- facts / key attributes
- linked projects/entities
- relationships

#### Supporting evidence panel
- source memories
- citations/provenance
- changed by / updated from

### Visual design direction
- calmer spacing than inbox
- more structured layouts
- evidence-first detail components
- graph and timeline used sparingly and meaningfully

## 4. Agent Operations Dashboard
### Purpose
Provide visibility and control over the distributed memory system.

### Key components
- source health table
- ingestion volume chart
- failure alerts
- duplicate/noise leaderboard
- recent sync history
- policy/control drawer

### Useful metrics
- last sync
- success rate
- failures today
- duplicate rate
- promoted-to-canonical rate
- high-signal ratio
- stale source warning

### Visual direction
This page can be slightly more analytical, but still should not feel cold or generic.
Use charts where they clarify trends, not where they merely decorate.

## Global Search / Command Bar
### This should be a hero interaction
The search bar should be visible on all major screens.

### It should support
- semantic memory search
- entity lookup
- source filter shortcuts
- action commands
- quick navigation

### Suggested interactions
- `/` or `cmd+k` opens command palette
- results grouped by:
  - Memories
  - Entities
  - Agents
  - Sources
  - Commands

### Design note
This surface should feel fast, minimal, and premium.

## Design System Direction
## Layout system
- desktop-first
- responsive down to tablet
- left nav + main workspace
- optional right rail on large screens
- use split panes for primary workflows

## Component families
### Core components
- KPI / state cards
- memory cards
- provenance chips
- confidence badges
- lifecycle badges
- source icons
- filter pills
- side drawers
- split-pane detail views
- timeline rows
- evidence lists
- comparison panels

### Important reusable patterns
- compact metadata rows
- expandable evidence sections
- sticky action sidebars
- command palette modal
- saved filter bars
- conflict/duplicate compare cards

## Suggested Visual Style
### Color philosophy
Use color primarily for state and meaning, not branding overload.

#### Suggested semantic palette
- neutral base for most surfaces
- blue: informational / linked / active
- green: trusted / healthy / approved
- amber: review / warning / stale risk
- red: failure / rejected / broken source
- purple: canonical / high-value knowledge

### Surface treatment
- soft panel separation
- layered but restrained cards
- subtle borders
- minimal shadow depth
- dark mode support from the start

### Typography
- highly legible sans-serif
- strong hierarchy for titles and summaries
- compact metadata text
- avoid huge marketing-style typography in core app flows

### Density
Target medium-to-dense information density with excellent grouping.
The user should feel informed, not overwhelmed.

## Iconography
Use icons only when they add fast meaning:
- source type
- health state
- review action
- lifecycle state
- entity type

Avoid decorative icon overload.

## Motion
Use subtle motion to support understanding:
- panel transitions
- state changes
- list-to-detail continuity
- compare drawer opening

Avoid flashy animations in review workflows.

## Empty States
Empty states should be useful and intelligent.

Examples:
- no new memories: "Inbox is clear"
- no failing agents: "All sources healthy"
- no canonical records yet: explain how canonicalization works

Avoid cute illustrations.

## Key Data Visualizations
Use only where high-value.

Recommended:
- ingestion trend lines
- duplicate rate by source
- source health indicators
- memory freshness heatmap or status counts
- knowledge timeline

Be cautious with:
- large node-link graphs as default views
- overly complex dashboard charts

## Trust / Provenance Design Rules
This is critical.

Every important memory or canonical record should visibly show:
- source
- agent
- created time
- ingestion time if different
- confidence
- related evidence

The user should never wonder: "Why is this here?"

## Accessibility Expectations
- keyboard-friendly inbox workflow
- visible focus states
- sufficient contrast in dark and light themes
- badges not relying on color alone
- tables/cards readable with assistive tech

## Suggested Screen Deliverables For Design Agent
The design agent should produce mockups for at least:
1. Dashboard Home
2. Global Memory Inbox
3. Memory Detail / Review State
4. Canonical Knowledge Record
5. Entity Detail Page
6. Agent Operations Dashboard
7. Source Detail View
8. Global Search / Command Palette
9. Duplicate / Conflict Review Flow

## Suggested Fidelity Order
### First pass
- sitemap / information architecture
- low-fi wireframes
- layout system
- core workflow mapping

### Second pass
- visual system exploration
- high-fi dashboard
- high-fi inbox
- canonical knowledge views

### Third pass
- interaction states
- edge cases
- empty states
- dark mode exploration

## Suggested Design Questions To Resolve
1. Should Inbox default to list-detail or board-like review?
2. How visual should the knowledge graph be in MVP?
3. How much of agent health belongs on home vs separate Ops view?
4. Should canonical knowledge feel document-like or database-like?
5. How aggressive should color/state signals be?

## Anti-Patterns To Avoid
- making integrations the primary homepage focus
- hiding provenance under nested clicks
- forcing users through modal-heavy triage flows
- overdesigning graph views before inbox workflow is excellent
- using generic enterprise admin templates without product-specific hierarchy
- building around CRUD tables instead of review workflows

## Final Design Intent
MemoryMe should feel like the place where a person governs their distributed intelligence system.

The best design outcome is a product that feels:
- trustworthy
- fast
- clear
- information-rich
- operationally calm
- worthy of being the default memory dashboard for agents and personal knowledge
