import axios from 'axios';
import { appConfig } from '@utilities/config/appConfig';

export type WorkspaceSummary = {
  id: string;
  name: string;
  environment: 'local' | 'staging' | 'production';
  operatorCount: number;
  activeRuns: number;
  pendingApprovals: number;
};

export type ChatThreadSummary = {
  id: string;
  title: string;
  workspaceId: string;
  status: 'ready' | 'running' | 'needs_approval' | 'paused';
  delegatedTo: string;
  updatedAt: string;
  objective: string;
};

export type AgentRegistryEntry = {
  id: string;
  name: string;
  provider: string;
  adapter: 'local' | 'openclaw' | 'cloud' | 'unified';
  status: 'online' | 'busy' | 'degraded' | 'offline';
  capabilities: string[];
  concurrency: number;
};

export type RunEvent = {
  id: string;
  runId: string;
  timestamp: string;
  kind: 'delegated' | 'run_state' | 'tool' | 'approval' | 'artifact' | 'log';
  title: string;
  detail: string;
};

export type ApprovalRequest = {
  id: string;
  label: string;
  summary: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type ArtifactSummary = {
  id: string;
  label: string;
  type: 'log' | 'plan' | 'patch' | 'report';
  sizeLabel: string;
  updatedAt: string;
};

export type RunLogEntry = {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
};

export type TaskRun = {
  id: string;
  threadId: string;
  workspaceId: string;
  operatorStatus: 'queued' | 'running' | 'paused' | 'needs_approval' | 'completed';
  assignedAgentId: string;
  goal: string;
  updatedAt: string;
  startedAt: string;
  completion: number;
  approvals: ApprovalRequest[];
  artifacts: ArtifactSummary[];
  logs: RunLogEntry[];
  events: RunEvent[];
};

export type CommandCenterSnapshot = {
  generatedAt: string;
  workspaces: WorkspaceSummary[];
  threads: ChatThreadSummary[];
  agents: AgentRegistryEntry[];
  runs: TaskRun[];
};

export type HumanControlAction = 'pause' | 'retry' | 'reassign' | 'approve';

const controlPlaneClient = axios.create({
  baseURL: appConfig.controlApiBaseUrl,
  headers: appConfig.masterApiKey
    ? {
        Authorization: `Bearer ${appConfig.masterApiKey}`,
      }
    : undefined,
});

const minutesAgo = (value: number) => new Date(Date.now() - value * 60_000).toISOString();

const FALLBACK_SNAPSHOT: CommandCenterSnapshot = {
  generatedAt: new Date().toISOString(),
  workspaces: [
    {
      id: 'workspace-memoryme',
      name: 'MemoryMe Core',
      environment: 'local',
      operatorCount: 3,
      activeRuns: 2,
      pendingApprovals: 1,
    },
    {
      id: 'workspace-customer-zero',
      name: 'Founder OS',
      environment: 'staging',
      operatorCount: 2,
      activeRuns: 1,
      pendingApprovals: 0,
    },
  ],
  threads: [
    {
      id: 'thread-triage-inbox',
      title: 'Triage noisy inbox memories',
      workspaceId: 'workspace-memoryme',
      status: 'running',
      delegatedTo: 'Atlas Operator',
      updatedAt: minutesAgo(4),
      objective: 'Review the incoming memory cluster, merge duplicates, and surface anything that needs approval.',
    },
    {
      id: 'thread-knowledge-promotion',
      title: 'Promote durable facts to knowledge',
      workspaceId: 'workspace-memoryme',
      status: 'needs_approval',
      delegatedTo: 'Canon Agent',
      updatedAt: minutesAgo(11),
      objective: 'Turn three reviewed memories into a canonical project update with supporting evidence.',
    },
    {
      id: 'thread-agent-debug',
      title: 'Debug degraded Slack ingestion',
      workspaceId: 'workspace-customer-zero',
      status: 'paused',
      delegatedTo: 'Relay Worker',
      updatedAt: minutesAgo(26),
      objective: 'Inspect recent failures, isolate auth drift, and prepare a retry plan.',
    },
  ],
  agents: [
    {
      id: 'agent-atlas',
      name: 'Atlas Operator',
      provider: 'OpenAI',
      adapter: 'local',
      status: 'busy',
      capabilities: ['triage', 'delegation', 'artifact review'],
      concurrency: 3,
    },
    {
      id: 'agent-canon',
      name: 'Canon Agent',
      provider: 'Anthropic',
      adapter: 'cloud',
      status: 'online',
      capabilities: ['knowledge merge', 'fact extraction'],
      concurrency: 2,
    },
    {
      id: 'agent-relay',
      name: 'Relay Worker',
      provider: 'OpenRouter',
      adapter: 'unified',
      status: 'degraded',
      capabilities: ['integration repair', 'retry planning'],
      concurrency: 1,
    },
    {
      id: 'agent-openclaw',
      name: 'OpenClaw Runtime',
      provider: 'OpenClaw',
      adapter: 'openclaw',
      status: 'online',
      capabilities: ['local execution', 'artifact generation'],
      concurrency: 4,
    },
  ],
  runs: [
    {
      id: 'run-001',
      threadId: 'thread-triage-inbox',
      workspaceId: 'workspace-memoryme',
      operatorStatus: 'running',
      assignedAgentId: 'agent-atlas',
      goal: 'Chat to delegate to run to inspect with explicit intervention controls.',
      updatedAt: minutesAgo(2),
      startedAt: minutesAgo(18),
      completion: 64,
      approvals: [
        {
          id: 'approval-001',
          label: 'Promote two high-signal memories',
          summary: 'Atlas wants approval to merge two inbox entries into the canonical MemoryMe roadmap record.',
          requestedBy: 'Atlas Operator',
          status: 'pending',
        },
      ],
      artifacts: [
        {
          id: 'artifact-001',
          label: 'run-plan.md',
          type: 'plan',
          sizeLabel: '6 KB',
          updatedAt: minutesAgo(9),
        },
        {
          id: 'artifact-002',
          label: 'inbox-diff.json',
          type: 'report',
          sizeLabel: '18 KB',
          updatedAt: minutesAgo(5),
        },
      ],
      logs: [
        {
          id: 'log-001',
          level: 'info',
          message: 'Loaded workspace policy and agent registry.',
          timestamp: minutesAgo(18),
        },
        {
          id: 'log-002',
          level: 'info',
          message: 'Delegated memory clustering to Atlas Operator.',
          timestamp: minutesAgo(15),
        },
        {
          id: 'log-003',
          level: 'warning',
          message: 'Approval required before canonical promotion.',
          timestamp: minutesAgo(3),
        },
      ],
      events: [
        {
          id: 'event-001',
          runId: 'run-001',
          timestamp: minutesAgo(16),
          kind: 'delegated',
          title: 'Task delegated',
          detail: 'Operator handed off the inbox triage run to Atlas Operator.',
        },
        {
          id: 'event-002',
          runId: 'run-001',
          timestamp: minutesAgo(12),
          kind: 'tool',
          title: 'Duplicate cluster resolved',
          detail: 'Four raw memories collapsed into two review-ready items.',
        },
        {
          id: 'event-003',
          runId: 'run-001',
          timestamp: minutesAgo(3),
          kind: 'approval',
          title: 'Approval requested',
          detail: 'Canonical promotion is blocked until a human operator approves.',
        },
      ],
    },
    {
      id: 'run-002',
      threadId: 'thread-knowledge-promotion',
      workspaceId: 'workspace-memoryme',
      operatorStatus: 'needs_approval',
      assignedAgentId: 'agent-canon',
      goal: 'Lift reviewed memories into durable project truth.',
      updatedAt: minutesAgo(11),
      startedAt: minutesAgo(33),
      completion: 81,
      approvals: [],
      artifacts: [
        {
          id: 'artifact-003',
          label: 'canonical-summary.md',
          type: 'patch',
          sizeLabel: '4 KB',
          updatedAt: minutesAgo(11),
        },
      ],
      logs: [
        {
          id: 'log-004',
          level: 'info',
          message: 'Fact extraction complete.',
          timestamp: minutesAgo(20),
        },
      ],
      events: [
        {
          id: 'event-004',
          runId: 'run-002',
          timestamp: minutesAgo(14),
          kind: 'run_state',
          title: 'Ready for operator review',
          detail: 'Canon Agent assembled a candidate record and is waiting for approval.',
        },
      ],
    },
    {
      id: 'run-003',
      threadId: 'thread-agent-debug',
      workspaceId: 'workspace-customer-zero',
      operatorStatus: 'paused',
      assignedAgentId: 'agent-relay',
      goal: 'Recover Slack ingestion without losing provenance.',
      updatedAt: minutesAgo(26),
      startedAt: minutesAgo(48),
      completion: 39,
      approvals: [],
      artifacts: [
        {
          id: 'artifact-004',
          label: 'slack-failure.log',
          type: 'log',
          sizeLabel: '12 KB',
          updatedAt: minutesAgo(27),
        },
      ],
      logs: [
        {
          id: 'log-005',
          level: 'error',
          message: 'Slack connector token rejected by upstream API.',
          timestamp: minutesAgo(29),
        },
      ],
      events: [
        {
          id: 'event-005',
          runId: 'run-003',
          timestamp: minutesAgo(26),
          kind: 'run_state',
          title: 'Paused by operator',
          detail: 'Run paused until fresh credentials are available.',
        },
      ],
    },
  ],
};

export async function loadCommandCenterSnapshot(): Promise<CommandCenterSnapshot> {
  try {
    const { data } = await controlPlaneClient.get<CommandCenterSnapshot>('/api/v1/control/snapshot');
    return data;
  } catch {
    return FALLBACK_SNAPSHOT;
  }
}

export async function applyHumanControlAction(runId: string, action: HumanControlAction, nextAgentId?: string) {
  try {
    await controlPlaneClient.post(`/api/v1/control/runs/${runId}/actions`, {
      action,
      nextAgentId,
    });
    return { ok: true as const, live: true as const };
  } catch {
    return { ok: true as const, live: false as const };
  }
}
