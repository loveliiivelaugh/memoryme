# MemoryMe Handoff Status

## Purpose
This file gives a build agent or implementation agent immediate context on the current state of the repo and the intended next product direction.

## Product spec
Primary specs:
- `docs/MEMORYME_PRODUCT_SPEC.md`
- `docs/MEMORYME_DESIGN_SPEC.md`

## Current implementation status
Recent hardening work completed locally:
- centralized frontend runtime config
- removed hardcoded localhost/prod redirect assumptions
- centralized GitHub OAuth redirect generation
- made auth header conditional
- fixed frontend alias resolution issues
- added Vitest + jsdom setup
- got local frontend verification passing

## Local verification completed
Run from repo root:
- `pnpm build`
- `pnpm test -- --run`

Both passed locally during the latest hardening pass.

## Important caveats
- This repo still contains generated build artifacts in `dist/`
- `tsconfig.tsbuildinfo` is being generated locally
- The product direction in the spec is intentionally more focused than the current UI
- The current UI still reflects older "playground/integrations-first" decisions

## Recommended next execution order
1. Read `docs/MEMORYME_PRODUCT_SPEC.md`
2. Replace homepage with dashboard shell
3. Build Global Memory Inbox
4. Add memory lifecycle states and provenance-rich cards
5. Add canonical knowledge layer
6. Add agent/source operations dashboard

## Notes for implementation agent
The spec should be treated as the source of truth for the next UX pass.
The main architectural shift is:
- from integrations-first admin UI
- to knowledge cockpit / memory operations dashboard
