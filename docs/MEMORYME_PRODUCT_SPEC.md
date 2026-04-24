# MemoryMe Product Design Spec

## Product Name
MemoryMe

## Product Vision
MemoryMe is the personal operating system for global memory and distributed agent knowledge.

It should help one person:
- collect memories and knowledge from many systems and agents
- review and clean incoming information
- promote durable information into canonical knowledge
- search, inspect, and manage what their agent network knows
- understand which agents and integrations are producing signal vs noise

This is not primarily an integrations app.
This is a memory control center.

## Core Product Promise
"Give me one place to manage what my agents know, what they just learned, and what should become part of my long-term world model."

## Primary User
Founder / operator / power user managing:
- personal memory
- project memory
- agent-generated memory
- external knowledge feeds
- long-lived knowledge that must persist across sessions and systems

## Primary Jobs To Be Done
1. See what new memories entered the system
2. Quickly review, tag, merge, or archive low-quality memories
3. Promote important information into canonical long-term knowledge
4. Search across all memories regardless of source
5. Understand provenance: where did this memory come from, and which agent created it
6. Monitor ingestion health across agents and integrations
7. Reduce duplication, drift, and stale knowledge

## Product Principles
1. Dashboard first, not page first
2. Memory lifecycle is explicit
3. Provenance is visible everywhere
4. Canonical knowledge is distinct from raw memory
5. Agent operations are first-class
6. Search and triage should be faster than manual note-taking
7. The UI should feel like a knowledge cockpit, not an admin template

## Information Architecture
MemoryMe should center around 3 primary surfaces.

### 1. Global Memory Inbox
Purpose: review all newly ingested memories.

Key capabilities:
- unified stream of incoming memories from all agents and sources
- quick filters:
  - New
  - Needs review
  - High signal
  - Duplicate candidates
  - Unlinked
  - Errors / failed parses
- bulk actions:
  - approve
  - archive
  - merge
  - retag
  - assign entity/project
  - promote to canonical
- card preview fields:
  - title/summary
  - source
  - agent
  - timestamp
  - confidence
  - freshness
  - duplicate score
  - linked entities/projects

User question answered:
"What just entered my world model?"

### 2. Canonical Knowledge / Knowledge Graph
Purpose: maintain durable structured knowledge.

Key capabilities:
- entity-centric navigation:
  - people
  - projects
  - companies
  - products
  - tools
  - places
  - goals
  - concepts
- relationship graph and linked memory trail
- canonical records with:
  - summary
  - supporting memories
  - last updated time
  - confidence
  - source provenance
  - freshness/staleness state
- timeline view of how a fact or relationship evolved
- conflict review when multiple memories disagree

User question answered:
"What do I currently believe is true?"

### 3. Agent Operations Dashboard
Purpose: monitor and govern distributed agent memory behavior.

Key capabilities:
- ingestion by agent/source
- volume over time
- high-signal vs low-signal ratio
- failed ingestions / parsing / auth failures
- last sync time per integration
- duplicate rate per source
- stale source detection
- per-agent policy controls:
  - write permissions
  - namespaces
  - retention rules
  - confidence thresholds
  - auto-promote eligibility

User question answered:
"Which agents are helping, and which ones are polluting the system?"

## Secondary Surfaces
### Search + Command Bar
A global command center available everywhere.

Supports:
- semantic search
- source filters
- time filters
- entity filters
- commands like:
  - create memory
  - search project
  - show duplicates
  - open agent health
  - promote selected memory

### Entity Detail Views
Every important object should have a rich detail page:
- summary
- linked memories
- relationships
- timeline
- source references
- recent changes

### Source / Integration Views
These should exist, but they are supporting surfaces.
They should not feel like the main product.

## Memory Lifecycle Model
Every memory should move through explicit states.

### Suggested states
- Raw
- Reviewed
- Canonical Candidate
- Canonical
- Stale
- Archived
- Rejected

### State meanings
- Raw: newly ingested, unreviewed
- Reviewed: checked by user or trusted automation
- Canonical Candidate: high-signal memory eligible for promotion
- Canonical: part of durable world model
- Stale: may no longer be reliable
- Archived: kept for history, not active
- Rejected: discarded/noisy/incorrect

## Core Objects
### Memory
Fields:
- id
- title
- summary
- body/content
- source
- source_id
- agent_id
- created_at
- ingested_at
- memory_state
- confidence_score
- freshness_score
- duplicate_cluster_id
- tags
- linked_entities
- linked_projects
- supporting_artifacts
- embeddings/vector refs
- canonical_target_id (optional)

### Canonical Knowledge Record
Fields:
- id
- entity or concept type
- canonical summary
- supporting memory ids
- relationship ids
- confidence
- owner/user
- last_verified_at
- stale_at
- status

### Agent Source
Fields:
- id
- name
- type
- auth status
- last sync
- ingestion success rate
- memory count
- duplicate rate
- quality score
- write scope/policy

## Dashboard UX Recommendations
## Home Screen Layout
The home screen should feel like an operator console.

### Recommended layout
#### Top bar
- global search / command bar
- date range / filters
- quick add memory
- notifications / ingestion alerts

#### Left nav
- Dashboard
- Inbox
- Canonical Knowledge
- Entities
- Agents
- Sources
- Search
- Settings

#### Main dashboard panels
1. Incoming Memory Stream
2. Canonical Knowledge Changes
3. Agent Health
4. Duplicate / Conflict Queue
5. Recent High-Signal Memories
6. Stale Knowledge Alerts

#### Right rail
- today’s stats
- pending reviews
- failed ingestions
- suggested merges
- recently active entities/projects

## Visual Design Direction
### Design tone
- calm
- high-signal
- information dense without feeling chaotic
- dark mode friendly
- founder/operator energy, not consumer-social energy

### Visual system recommendations
- card-based review surfaces
- subtle graph/timeline visualizations
- colored status badges for lifecycle/provenance/confidence
- source avatars/icons
- entity chips
- compact table + stream hybrid layouts
- command palette inspired interaction

### Avoid
- template-y admin UI feel
- integrations as giant hero cards
- buried provenance
- overuse of forms/modals for core review actions
- decorative 3D or gimmick surfaces in primary workflows

## Key Flows
### Flow 1: Review incoming memories
1. User opens Inbox
2. Sees new memories sorted by urgency/signal
3. Opens a memory card
4. Reviews source, confidence, related memories, and suggested entity links
5. Takes one action:
   - approve
   - retag
   - merge
   - archive
   - promote to canonical

### Flow 2: Promote to canonical knowledge
1. User identifies important memory or cluster
2. Opens promote flow
3. Chooses target entity/concept or creates new one
4. Edits canonical summary
5. Links supporting evidence
6. Saves canonical record

### Flow 3: Investigate agent quality
1. User opens Agent Operations Dashboard
2. Sees noisy or failing source
3. Opens source detail
4. Reviews recent outputs, duplicate rate, failure logs
5. Adjusts policy or disables source

### Flow 4: Resolve duplicate/conflicting memories
1. System clusters likely duplicates/conflicts
2. User opens conflict queue
3. Compares memory cards side-by-side
4. Merges, rejects, or preserves multiple versions
5. Updates canonical knowledge if needed

## MVP Scope Recommendation
The next major version should focus on these deliverables.

### MVP-1: Knowledge Cockpit Foundation
- redesigned dashboard shell
- global search / command bar
- inbox stream
- memory cards with provenance and lifecycle states
- basic agent/source health panel

### MVP-2: Review Workflow
- approve/archive/tag actions
- duplicate queue
- promote-to-canonical action
- entity/project linking

### MVP-3: Canonical Knowledge Layer
- canonical records
- entity detail pages
- supporting-memory relationships
- freshness/confidence indicators

### MVP-4: Agent Governance
- source health views
- sync status
- agent quality scoring
- policy controls

## Functional Requirements
### FR-1 Memory Inbox
- system must display all incoming memories in a unified stream
- system must support filters by source, agent, state, date, entity, and project
- system must support bulk review actions

### FR-2 Provenance
- every memory must display source and agent provenance
- every canonical record must display supporting evidence

### FR-3 Canonicalization
- system must let user promote a memory or memory cluster into canonical knowledge
- system must preserve links back to supporting raw memories

### FR-4 Search
- system must provide global search across memories, entities, and canonical records
- search should support semantic retrieval and metadata filters

### FR-5 Agent Monitoring
- system must show ingestion health for each connected source/agent
- system must surface failures, stale connections, and noisy sources

### FR-6 Lifecycle State
- every memory must have a lifecycle state
- state transitions must be visible and auditable

## Non-Functional Requirements
- fast search and filtering on large memory volumes
- clear provenance and explainability for trust
- easy review from desktop-first dashboard layouts
- architecture that supports multiple frontends and backends
- resilient to partial ingestion failures
- safe handling of sensitive memory data

## Recommended Navigation Labels
- Dashboard
- Inbox
- Knowledge
- Entities
- Agents
- Sources
- Search
- Settings

## Suggested Homepage Widgets
- New memories today
- Pending review
- Canonical changes this week
- Duplicate candidates
- Stale knowledge alerts
- Failing integrations
- Top active projects
- Agent signal leaderboard

## Data/Intelligence Opportunities
Later phases can add:
- auto-clustering of similar memories
- suggested canonical summaries
- contradiction detection
- entity extraction and relationship suggestion
- auto-tagging
- trust scores by source
- memory decay / freshness modeling
- personalized briefing generation

## Implementation Guidance For Foundry Agent
### Build order recommendation
1. Replace current homepage with dashboard shell
2. Implement memory inbox as primary workflow
3. Add lifecycle state model to UI and API contracts
4. Add provenance-rich memory cards
5. Add canonical knowledge views
6. Add agent/source operations views
7. Polish integrations as supporting infrastructure

### UX heuristics
- optimize for triage speed
- minimize modal-heavy flows
- let users stay in context while reviewing
- prefer split-pane and side-panel workflows
- keep source health and provenance visible without extra clicks

### Definition of Success
MemoryMe is successful when the user can:
- immediately see what new knowledge entered the system
- quickly separate noise from signal
- maintain a trusted canonical memory layer
- understand which agents/sources are healthy
- confidently use MemoryMe as the dashboard for their distributed agent knowledge system

## Short Product Positioning
MemoryMe is the operating system for personal and agent memory: a dashboard for reviewing, governing, and promoting distributed knowledge into a trusted long-term memory layer.
