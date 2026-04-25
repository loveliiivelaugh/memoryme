# MemoryMe

MemoryMe is evolving from a prototype playground into a personal dashboard for global memory and distributed agent knowledge management.

## Key docs
- Product spec: `docs/MEMORYME_PRODUCT_SPEC.md`
- Design spec: `docs/MEMORYME_DESIGN_SPEC.md`
- Handoff status: `docs/HANDOFF_STATUS.md`
- Unified control API contract: `docs/UNIFIED_CONTROL_API.md`

## Current local verification
Run from the repo root:

```bash
pnpm install
pnpm build
pnpm test -- --run
```

These checks passed locally during the latest hardening pass.

## Product direction
MemoryMe should become:
- a Global Memory Inbox
- a Canonical Knowledge layer
- an Agent Operations Dashboard
- a command center for chat -> delegate -> run -> inspect -> intervene -> complete

Not just an integrations app.

## Current state
The current codebase now includes a backend-ready command center surface built around:

- workspace and thread selection
- agent registry visibility
- task/run state
- live event stream
- artifacts and logs
- human control actions
- TanStack AI chat wiring for a separate SSE backend

### Environment

The command center supports a separately deployed control backend through:

```bash
VITE_API_BASE_URL=http://localhost:5250
VITE_CONTROL_API_BASE_URL=http://localhost:5250
VITE_CONTROL_API_CHAT_PATH=/api/v1/control/chat/stream
```

If the control backend is unavailable, the app falls back to local mock snapshot data so the frontend can still be developed and reviewed.
