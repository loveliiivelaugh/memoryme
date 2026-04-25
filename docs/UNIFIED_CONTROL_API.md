# Unified Control API

MemoryMe now treats the operator UI and the execution backend as separate layers.

The frontend assumes a dedicated control API that can be deployed independently and reached through:

- `VITE_CONTROL_API_BASE_URL`
- `VITE_CONTROL_API_CHAT_PATH` with default `/api/v1/control/chat/stream`

If `VITE_CONTROL_API_BASE_URL` is not set, the app falls back to `VITE_API_BASE_URL`.

## Why this split exists

The product path we are optimizing first is:

1. chat
2. delegate task
3. run agent
4. inspect live state
5. intervene with human controls
6. complete the run

That means the frontend only needs a small control-plane surface for v1:

- auth and workspace context
- chat threads
- agent registry
- task and run state
- live event stream
- artifacts and logs
- human controls: pause, retry, reassign, approve

## Expected endpoints

### `GET /api/v1/control/snapshot`

Returns the operator snapshot used by the command center.

Suggested response shape:

```json
{
  "generatedAt": "2026-04-25T20:20:00.000Z",
  "workspaces": [],
  "threads": [],
  "agents": [],
  "runs": []
}
```

### `POST /api/v1/control/runs/:runId/actions`

Applies a human control action.

Suggested request body:

```json
{
  "action": "pause",
  "nextAgentId": "agent-canon"
}
```

Supported actions in the current frontend:

- `pause`
- `retry`
- `reassign`
- `approve`

### `POST /api/v1/control/chat/stream`

SSE endpoint for TanStack AI chat streaming.

The frontend sends a body like:

```json
{
  "workspaceId": "workspace-memoryme",
  "threadId": "thread-triage-inbox",
  "agentId": "agent-atlas",
  "messages": []
}
```

The client is wired with `@tanstack/ai-react` and `fetchServerSentEvents(...)`, so this endpoint should return a TanStack-compatible server-sent event stream.

## Frontend implementation notes

- Command center snapshot data comes from `src/utilities/api/controlPlane.ts`.
- The operator chat is implemented in `src/components/pages/CommandCenterPage.tsx`.
- The UI falls back to a local mocked control-plane snapshot when the backend is unavailable, which keeps frontend work moving while the separate service is being built.

## Recommended backend layering

Keep the backend split into:

1. Control API
2. Execution adapters
3. Memory services

That lets MemoryMe keep the operator UX stable while we iterate independently on local execution, cloud workers, OpenClaw runtime support, and future providers.
