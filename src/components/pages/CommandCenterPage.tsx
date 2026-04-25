import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import HubIcon from '@mui/icons-material/Hub';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import StreamOutlinedIcon from '@mui/icons-material/StreamOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react';
import { appConfig } from '@utilities/config/appConfig';
import { client } from '@api/index';
import {
  AgentRegistryEntry,
  applyHumanControlAction,
  ChatThreadSummary,
  HumanControlAction,
  loadCommandCenterSnapshot,
  TaskRun,
  WorkspaceSummary,
} from '@api/controlPlane';

type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'default';

type OperatorChatController = ReturnType<typeof useOperatorChatController>;
type FullScreenTabKey = 'space' | 'thread' | 'agent' | 'model' | 'role' | 'tools';
type ThreadConfig = {
  agentId: string;
  primaryModel: string;
  fallbackModel: string;
};

const FALLBACK_MODELS = ['guardian-v1', 'openai', 'gemini'];
const FALLBACK_THREAD_CONFIG: ThreadConfig = {
  agentId: '',
  primaryModel: FALLBACK_MODELS[0],
  fallbackModel: FALLBACK_MODELS[1],
};

function SectionCard({
  title,
  subtitle,
  action,
  children,
  minHeight,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  minHeight?: number;
}) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 2,
        minHeight,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
}

function toneForThread(status: ChatThreadSummary['status']): StatusTone {
  if (status === 'needs_approval') return 'warning';
  if (status === 'paused') return 'default';
  if (status === 'running') return 'info';
  return 'success';
}

function toneForAgent(status: AgentRegistryEntry['status']): StatusTone {
  if (status === 'offline') return 'error';
  if (status === 'degraded') return 'warning';
  if (status === 'busy') return 'info';
  return 'success';
}

function toneForRun(status: TaskRun['operatorStatus']): StatusTone {
  if (status === 'needs_approval') return 'warning';
  if (status === 'paused') return 'default';
  if (status === 'completed') return 'success';
  if (status === 'queued') return 'info';
  return 'info';
}

function labelForRun(status: TaskRun['operatorStatus']) {
  return status.replace('_', ' ').toUpperCase();
}

function useOperatorChatController({
  workspace,
  thread,
  assignedAgent,
}: {
  workspace?: WorkspaceSummary;
  thread?: ChatThreadSummary;
  assignedAgent?: AgentRegistryEntry;
}) {
  const [input, setInput] = useState('');
  const streamUrl = `${appConfig.controlApiBaseUrl}${appConfig.controlApiChatPath}`;

  const chat = useChat({
    id: thread?.id || 'memoryme-command-center',
    connection: fetchServerSentEvents(streamUrl),
    body: {
      workspaceId: workspace?.id,
      threadId: thread?.id,
      agentId: assignedAgent?.id,
    },
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || chat.isLoading) {
      return;
    }

    await chat.sendMessage(trimmed);
    setInput('');
  };

  return {
    ...chat,
    input,
    setInput,
    handleSubmit,
  };
}

function ChatMessages({ controller, compact }: { controller: OperatorChatController; compact?: boolean }) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: compact ? 280 : 420,
        maxHeight: compact ? 320 : 'none',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        pr: 0.5,
      }}
    >
      {controller.messages.length === 0 ? (
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This panel is connected with `@tanstack/ai-react` over SSE and is ready for a separate control backend at{' '}
            <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {appConfig.controlApiChatPath}
            </Box>
            . Once that endpoint is live, operator prompts here can drive runs without changing the UI contract.
          </Typography>
        </Box>
      ) : null}

      {controller.messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            alignSelf: message.role === 'user' ? 'flex-end' : 'stretch',
            maxWidth: message.role === 'user' ? (compact ? '78%' : '68%') : '100%',
            border: '1px solid',
            borderColor: message.role === 'user' ? 'text.primary' : 'divider',
            bgcolor: message.role === 'user' ? 'rgba(255,255,255,0.08)' : 'background.default',
            borderRadius: 2,
            px: compact ? 1.5 : 1.75,
            py: compact ? 1.25 : 1.5,
          }}
        >
          <Typography sx={{ fontSize: '0.65rem', letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700, mb: 0.75 }}>
            {message.role === 'user' ? 'Operator' : 'Agent'}
          </Typography>
          <Stack spacing={0.75}>
            {message.parts.map((part, index) => {
              if (part.type === 'text') {
                return (
                  <Typography key={`${message.id}-${index}`} variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                    {part.content}
                  </Typography>
                );
              }

              if (part.type === 'thinking') {
                return (
                  <Typography key={`${message.id}-${index}`} sx={{ fontSize: '0.8rem', color: 'text.secondary', fontStyle: 'italic' }}>
                    Thinking: {part.content}
                  </Typography>
                );
              }

              return null;
            })}
          </Stack>
        </Box>
      ))}
    </Box>
  );
}

function ChatComposer({ controller }: { controller: OperatorChatController }) {
  return (
    <Box component="form" onSubmit={controller.handleSubmit}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        value={controller.input}
        onChange={(event) => controller.setInput(event.target.value)}
        placeholder="Delegate the next task, ask for a status update, or request approval context..."
      />
      <Stack direction="row" spacing={1.25} sx={{ mt: 1.5, justifyContent: 'space-between' }}>
        <Button
          variant="text"
          color="inherit"
          onClick={() => controller.clear()}
          disabled={controller.isLoading || controller.messages.length === 0}
        >
          Clear Session
        </Button>
        <Button
          type="submit"
          variant="contained"
          endIcon={<LaunchOutlinedIcon />}
          disabled={!controller.input.trim() || controller.isLoading}
        >
          {controller.isLoading ? 'Running...' : 'Send to Control API'}
        </Button>
      </Stack>
    </Box>
  );
}

function FullScreenChatWorkspace({
  open,
  onClose,
  controller,
  workspace,
  thread,
  threads,
  onSelectThread,
  onCreateSession,
  agents,
  assignedAgent,
  run,
  threadConfig,
  threadConfigs,
  onThreadConfigChange,
  availableModels,
}: {
  open: boolean;
  onClose: () => void;
  controller: OperatorChatController;
  workspace?: WorkspaceSummary;
  thread?: ChatThreadSummary;
  threads: ChatThreadSummary[];
  onSelectThread: (threadId: string) => void;
  onCreateSession: () => void;
  agents: AgentRegistryEntry[];
  assignedAgent?: AgentRegistryEntry;
  run?: TaskRun;
  threadConfig?: ThreadConfig;
  threadConfigs: Record<string, ThreadConfig>;
  onThreadConfigChange: (patch: Partial<ThreadConfig>) => void;
  availableModels: string[];
}) {
  const [activeTab, setActiveTab] = useState<FullScreenTabKey>('thread');

  const metadata = [
    {
      key: 'space' as const,
      label: 'Space',
      value: workspace?.name || 'Unassigned',
      helper: 'Secure workspace boundary',
      icon: <LayersOutlinedIcon fontSize="small" />,
    },
    {
      key: 'thread' as const,
      label: 'Thread',
      value: thread?.title || 'No thread selected',
      helper: 'Focused execution stream',
      icon: <AccountTreeOutlinedIcon fontSize="small" />,
    },
    {
      key: 'agent' as const,
      label: 'Agent',
      value: assignedAgent?.name || 'No agent',
      helper: 'Assigned worker',
      icon: <PsychologyOutlinedIcon fontSize="small" />,
    },
    {
      key: 'model' as const,
      label: 'Model stack',
      value: assignedAgent ? `${assignedAgent.provider} · ${assignedAgent.adapter}` : 'Not assigned',
      helper: 'Provider and runtime',
      icon: <MemoryOutlinedIcon fontSize="small" />,
    },
    {
      key: 'role' as const,
      label: 'Role',
      value: run ? 'Operator role kit' : 'Pending',
      helper: 'Tight instructions and permissions',
      icon: <ShieldOutlinedIcon fontSize="small" />,
    },
    {
      key: 'tools' as const,
      label: 'Tools',
      value: `${assignedAgent?.capabilities.length || 0} attached capabilities`,
      helper: 'Authenticated and governed',
      icon: <BuildOutlinedIcon fontSize="small" />,
    },
  ];
  const activeMetadata = metadata.find((item) => item.key === activeTab) ?? metadata[0];
  const mockNodeTools = assignedAgent?.capabilities.length
    ? assignedAgent.capabilities
    : ['filesystem', 'shell', 'browser automation', 'document search'];

  const renderTabContent = () => {
    if (activeTab === 'thread') {
      return (
        <>
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              bgcolor: 'background.default',
              mb: 2,
            }}
          >
            <Typography sx={{ fontSize: '0.7rem', letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700 }}>
              Active objective
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.75 }}>
              {thread?.objective || 'Select a thread to start the delegate-run-inspect workflow.'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: 'wrap' }}>
              {workspace ? <Chip size="small" label={workspace.name} variant="outlined" /> : null}
              {assignedAgent ? <Chip size="small" label={`Assigned: ${assignedAgent.name}`} variant="outlined" /> : null}
              {run ? <Chip size="small" label={`Status: ${labelForRun(run.operatorStatus)}`} variant="outlined" /> : null}
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 1,
              mb: 2,
            }}
          >
            <TextField
              select
              size="small"
              label="Agent"
              value={threadConfig?.agentId || ''}
              onChange={(event) => onThreadConfigChange({ agentId: event.target.value })}
            >
              {agents.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Primary model"
              value={threadConfig?.primaryModel || ''}
              onChange={(event) => onThreadConfigChange({ primaryModel: event.target.value })}
            >
              {availableModels.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Fallback"
              value={threadConfig?.fallbackModel || ''}
              onChange={(event) => onThreadConfigChange({ fallbackModel: event.target.value })}
            >
              {availableModels.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <ChatMessages controller={controller} />

          {controller.error ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {controller.error.message}
            </Alert>
          ) : null}

          <Box sx={{ mt: 2 }}>
            <ChatComposer controller={controller} />
          </Box>
        </>
      );
    }

    if (activeTab === 'agent') {
      return (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <SectionCard
              title="Agent Environment"
              subtitle="Stubbed remote-node configuration for local or cloud execution surfaces."
            >
              <Stack spacing={2}>
                <TextField label="Environment name" value={assignedAgent?.name || 'Primary Agent Node'} fullWidth />
                <TextField select label="Runtime type" value={assignedAgent?.adapter || 'local'} fullWidth>
                  <MenuItem value="local">Local machine worker</MenuItem>
                  <MenuItem value="cloud">Cloud container worker</MenuItem>
                  <MenuItem value="openclaw">OpenClaw plugin bridge</MenuItem>
                  <MenuItem value="unified">Unified hosted worker</MenuItem>
                </TextField>
                <TextField label="Node identifier" value="node-prod-us-central-1" fullWidth />
                <TextField label="Secure tunnel / relay" value="tailscale-style worker relay (stubbed)" fullWidth />
                <TextField
                  label="Connection policy"
                  value="The web app does not connect directly to the machine. A remote worker installed on the same environment phones home to MemoryMe and exposes approved agent capabilities."
                  fullWidth
                  multiline
                  minRows={4}
                />
              </Stack>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <SectionCard
              title="Registered Capabilities"
              subtitle="These are the node-scoped capabilities that later inform tool configuration."
            >
              <Stack spacing={1}>
                {mockNodeTools.map((tool) => (
                  <Box key={tool} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.25 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                      {tool}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.45 }}>
                      Registered by the remote node and available for governed tool configuration.
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>
      );
    }

    if (activeTab === 'space') {
      return (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard
              title="Account Boundary"
              subtitle="A space is the account boundary for agents, tools, and governance."
            >
              <Stack spacing={2}>
                <TextField label="Space name" value={workspace?.name || 'MemoryMe Core'} fullWidth />
                <TextField label="Hosting environment" value={workspace?.environment || 'local'} fullWidth />
                <TextField
                  label="Registered agents"
                  value={`${agents.length} agents attached to this account`}
                  fullWidth
                />
                <TextField
                  label="Registered tools"
                  value="GitHub, filesystem, browser automation, document search, webhook relay"
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Stack>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard
              title="Governance"
              subtitle="What belongs to this account and can be assigned downstream."
            >
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip label="Agents live here" variant="outlined" />
                <Chip label="Tools register here" variant="outlined" />
                <Chip label="Provider auth here" variant="outlined" />
                <Chip label="Audit logs here" variant="outlined" />
                <Chip label="Role library here" variant="outlined" />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                Spaces define the account. Projects and threads execute inside that boundary, while agents, provider auth, tools, and policy live at the space level.
              </Typography>
            </SectionCard>
          </Grid>
        </Grid>
      );
    }

    if (activeTab === 'model') {
      return (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <SectionCard
              title="Model Stack"
              subtitle="Primary and fallback routing across hosted and local model providers."
            >
              <Stack spacing={2}>
                <TextField select label="Primary provider" value={threadConfig?.primaryModel.includes('gemini') ? 'google' : threadConfig?.primaryModel.includes('guardian') ? 'guardian' : threadConfig?.primaryModel.includes('openai') ? 'openai' : 'custom'} fullWidth>
                  <MenuItem value="guardian">Guardian / OpenWebUI</MenuItem>
                  <MenuItem value="openai">OpenAI</MenuItem>
                  <MenuItem value="anthropic">Anthropic</MenuItem>
                  <MenuItem value="google">Google</MenuItem>
                  <MenuItem value="openrouter">OpenRouter</MenuItem>
                  <MenuItem value="ollama">Ollama (local)</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Primary model"
                  value={threadConfig?.primaryModel || ''}
                  onChange={(event) => onThreadConfigChange({ primaryModel: event.target.value })}
                  fullWidth
                >
                  {availableModels.map((model) => (
                    <MenuItem key={model} value={model}>
                      {model}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField select label="Fallback provider" value={threadConfig?.fallbackModel.includes('gemini') ? 'google' : threadConfig?.fallbackModel.includes('guardian') ? 'guardian' : threadConfig?.fallbackModel.includes('openai') ? 'openai' : 'custom'} fullWidth>
                  <MenuItem value="guardian">Guardian / OpenWebUI</MenuItem>
                  <MenuItem value="anthropic">Anthropic</MenuItem>
                  <MenuItem value="google">Google</MenuItem>
                  <MenuItem value="openrouter">OpenRouter</MenuItem>
                  <MenuItem value="ollama">Ollama (local)</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Fallback model"
                  value={threadConfig?.fallbackModel || ''}
                  onChange={(event) => onThreadConfigChange({ fallbackModel: event.target.value })}
                  fullWidth
                >
                  {availableModels.map((model) => (
                    <MenuItem key={model} value={model}>
                      {model}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <SectionCard
              title="Catalog Source"
              subtitle="We can leverage models.dev as a model catalog and enrich it with local/runtime-specific entries."
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Guardian already exposes `GET /v1/models` locally, so this view can populate from real infrastructure now. `models.dev` still works well as a broader model catalog reference while we add local models and local harness registrations.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 2 }}>
                <Chip label="Primary + fallback" variant="outlined" />
                <Chip label="Provider governance" variant="outlined" />
                <Chip label="Local models" variant="outlined" />
                <Chip label="Local harnesses" variant="outlined" />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2 }}>
                Live source: `GET /v1/models`
              </Typography>
            </SectionCard>
          </Grid>
        </Grid>
      );
    }

    if (activeTab === 'role') {
      return (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <SectionCard
              title="Role Definition"
              subtitle="Permissions, instructions, context, and tools bundled into what the agent sees on every request."
            >
              <Stack spacing={2}>
                <TextField label="Role name" value="Operator role kit" fullWidth />
                <TextField
                  label="Instructions"
                  value="Act as a secure operator. Keep work scoped to the current thread, prefer approved tools, ask for approval on sensitive actions, and maintain a concise run log."
                  fullWidth
                  multiline
                  minRows={4}
                />
                <TextField
                  label="Context package"
                  value="Current project state, recent thread history, approved credentials, execution policies, and workspace memory."
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Stack>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <SectionCard
              title="Role Scope"
              subtitle="The operating outfit the agent wears."
            >
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip label="Permissions" variant="outlined" />
                <Chip label="Instructions" variant="outlined" />
                <Chip label="Context" variant="outlined" />
                <Chip label="Tools" variant="outlined" />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                Roles are not just prompts. They are reusable operating modes that define what the agent can access, how it should behave, and which tools it can call without re-authenticating.
              </Typography>
            </SectionCard>
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard
            title="Tool Configuration"
            subtitle="Tools are informed by whatever the remote node registers from the agent environment."
          >
            <Stack spacing={1.5}>
              {mockNodeTools.map((tool) => (
                <Box key={tool} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                    {tool}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.45 }}>
                    Registered by the remote node and now available for role assignment, approval policy, and scope restrictions.
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard
            title="Tool Governance"
            subtitle="What gets exposed to roles after remote-node registration."
          >
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Chip label="Node-discovered" variant="outlined" />
              <Chip label="Scoped to roles" variant="outlined" />
              <Chip label="Permission gated" variant="outlined" />
              <Chip label="Approval aware" variant="outlined" />
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
              The remote node advertises available tools from the environment. MemoryMe then decides which of those tools become usable in the space and which roles are allowed to see them.
            </Typography>
          </SectionCard>
        </Grid>
      </Grid>
    );
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: 'background.default' } }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Operator Workspace
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Space, project flow, focused thread execution, provider context, and human control in one full-screen surface.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                size="small"
                label={controller.sessionGenerating ? 'STREAMING' : controller.connectionStatus.toUpperCase()}
                color={controller.sessionGenerating ? 'info' : controller.connectionStatus === 'connected' ? 'success' : 'default'}
                variant={controller.sessionGenerating ? 'filled' : 'outlined'}
              />
              <IconButton onClick={onClose} color="inherit">
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, p: { xs: 2, md: 3 } }}>
          <Grid container spacing={1.5} sx={{ height: '100%' }}>
            <Grid size={{ xs: 12, lg: 3 }}>
              <Stack spacing={1.5} sx={{ height: '100%' }}>
                <SectionCard
                  title="Threads"
                  subtitle="Sessions in the left rail control the main chat window."
                >
                  <Stack spacing={1}>
                    <Button fullWidth variant="contained" onClick={onCreateSession}>
                      New Session
                    </Button>
                    {threads.map((item) => {
                      const active = item.id === thread?.id;
                      const itemConfig = threadConfigs[item.id];
                      const itemAgent = agents.find((agent) => agent.id === itemConfig?.agentId);
                      return (
                        <Box
                          key={item.id}
                          onClick={() => onSelectThread(item.id)}
                          sx={{
                            border: '1px solid',
                            borderColor: active ? 'text.primary' : 'divider',
                            borderRadius: 1,
                            p: 1.125,
                            cursor: 'pointer',
                            bgcolor: active ? 'rgba(255,255,255,0.06)' : 'background.default',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {item.title}
                            </Typography>
                            <Chip size="small" label={item.status.toUpperCase()} color={toneForThread(item.status)} />
                          </Box>
                          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.6 }}>
                            {item.objective}
                          </Typography>
                          {itemAgent || itemConfig?.primaryModel ? (
                            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.5 }}>
                              {(itemAgent?.name || 'Choose agent')} · {itemConfig?.primaryModel || 'Choose model'}
                            </Typography>
                          ) : null}
                        </Box>
                      );
                    })}
                  </Stack>
                </SectionCard>

                <SectionCard title="Thread Objective" subtitle="Execution containers, not just conversations.">
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {thread?.objective || 'Select a thread to start the delegate-run-inspect workflow.'}
                  </Typography>
                  {run ? (
                    <Box sx={{ mt: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Run completion</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{run.completion}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={run.completion} />
                    </Box>
                  ) : null}
                </SectionCard>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 9 }}>
                <Box
                  sx={{
                    height: '100%',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    p: { xs: 1.5, md: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }}
                >
                  <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 2 }}>
                    <Tabs
                      value={activeTab}
                      onChange={(_event, nextValue) => setActiveTab(nextValue)}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{
                        minHeight: 44,
                        '& .MuiTab-root': {
                          minHeight: 44,
                          alignItems: 'flex-start',
                          textTransform: 'none',
                          color: 'text.secondary',
                        },
                      }}
                    >
                      {metadata.map((item) => (
                        <Tab
                          key={item.key}
                          value={item.key}
                          icon={item.icon}
                          iconPosition="start"
                          label={item.label}
                        />
                      ))}
                    </Tabs>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                      <Box sx={{ color: 'text.secondary', display: 'flex' }}>{activeMetadata.icon}</Box>
                      <Typography sx={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700 }}>
                        {activeMetadata.label}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {activeMetadata.helper}
                    </Typography>
                  </Box>

                  {renderTabContent()}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
}

function OperatorChatPanel({
  workspace,
  thread,
  assignedAgent,
  run,
  controller,
  onOpenFullScreen,
}: {
  workspace?: WorkspaceSummary;
  thread?: ChatThreadSummary;
  assignedAgent?: AgentRegistryEntry;
  run?: TaskRun;
  controller: OperatorChatController;
  onOpenFullScreen: () => void;
}) {
  return (
    <SectionCard
      title="Operator Chat"
      subtitle="TanStack AI is wired for the narrow v1 path: chat, delegate, stream progress, and intervene."
      action={
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip
            size="small"
            label={controller.sessionGenerating ? 'STREAMING' : controller.connectionStatus.toUpperCase()}
            color={controller.sessionGenerating ? 'info' : controller.connectionStatus === 'connected' ? 'success' : 'default'}
            variant={controller.sessionGenerating ? 'filled' : 'outlined'}
          />
          <IconButton onClick={onOpenFullScreen} color="inherit" size="small">
            <OpenInFullIcon fontSize="small" />
          </IconButton>
        </Stack>
      }
      minHeight={540}
    >
      <Stack spacing={1}>
        <Box
          sx={{
            px: 1.25,
            py: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.default',
          }}
        >
          <Typography sx={{ fontSize: '0.7rem', letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700 }}>
            Active objective
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75 }}>
            {thread?.objective || 'Select a thread to start the delegate-run-inspect workflow.'}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: 'wrap' }}>
            {workspace ? <Chip size="small" label={workspace.name} variant="outlined" /> : null}
            {assignedAgent ? <Chip size="small" label={`Assigned: ${assignedAgent.name}`} variant="outlined" /> : null}
            {run ? null : <Chip size="small" label="Configure agent/model in Thread tab" variant="outlined" />}
            {run ? <Chip size="small" label={labelForRun(run.operatorStatus)} variant="outlined" /> : null}
          </Stack>
        </Box>

        <ChatMessages controller={controller} compact />

        {controller.error ? <Alert severity="warning">{controller.error.message}</Alert> : null}

        <ChatComposer controller={controller} />
      </Stack>
    </SectionCard>
  );
}

export default function CommandCenterPage() {
  const snapshotQuery = useQuery({
    queryKey: ['command-center-snapshot'],
    queryFn: loadCommandCenterSnapshot,
  });
  const modelsQuery = useQuery({
    queryKey: ['guardian-openwebui-models'],
    queryFn: async () => {
      try {
        const response = await client.get('/v1/models');
        const rawModels = Array.isArray(response.data?.data) ? response.data.data : [];
        const ids = rawModels
          .map((item: { id?: string }) => item.id)
          .filter((value: string | undefined): value is string => Boolean(value));

        return ids.length > 0 ? ids : FALLBACK_MODELS;
      } catch {
        return FALLBACK_MODELS;
      }
    },
  });

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>();
  const [selectedThreadId, setSelectedThreadId] = useState<string>();
  const [selectedRunId, setSelectedRunId] = useState<string>();
  const [controlMessage, setControlMessage] = useState<string>();
  const [chatFullScreenOpen, setChatFullScreenOpen] = useState(false);
  const [localThreads, setLocalThreads] = useState<ChatThreadSummary[]>([]);
  const [threadConfigs, setThreadConfigs] = useState<Record<string, ThreadConfig>>({});

  const snapshot = snapshotQuery.data;

  useEffect(() => {
    if (!snapshot) {
      return;
    }

    if (!selectedWorkspaceId && snapshot.workspaces[0]) {
      setSelectedWorkspaceId(snapshot.workspaces[0].id);
    }
  }, [snapshot, selectedWorkspaceId]);

  useEffect(() => {
    if (!snapshot || !selectedWorkspaceId) {
      return;
    }

    const workspaceThreads = snapshot.threads.filter((thread) => thread.workspaceId === selectedWorkspaceId);
    if (workspaceThreads.length > 0 && !workspaceThreads.some((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(workspaceThreads[0].id);
    }
  }, [snapshot, selectedWorkspaceId, selectedThreadId]);

  useEffect(() => {
    if (!snapshot || !selectedThreadId) {
      return;
    }

    const firstRun = snapshot.runs.find((run) => run.threadId === selectedThreadId);
    if (firstRun && firstRun.id !== selectedRunId) {
      setSelectedRunId(firstRun.id);
    }
  }, [snapshot, selectedRunId, selectedThreadId]);

  const selectedWorkspace = snapshot?.workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
  const agents = snapshot?.agents ?? [];
  const availableModels = modelsQuery.data ?? FALLBACK_MODELS;
  const workspaceThreads = useMemo(() => {
    const snapshotThreads = snapshot?.threads.filter((thread) => thread.workspaceId === selectedWorkspaceId) ?? [];
    const createdThreads = localThreads.filter((thread) => thread.workspaceId === selectedWorkspaceId);
    return [...createdThreads, ...snapshotThreads];
  }, [snapshot, selectedWorkspaceId, localThreads]);
  const selectedThread = workspaceThreads.find((thread) => thread.id === selectedThreadId) ?? snapshot?.threads[0];
  const selectedRun = snapshot?.runs.find((run) => run.id === selectedRunId)
    ?? snapshot?.runs.find((run) => run.threadId === selectedThread?.id);
  const selectedThreadConfig = selectedThread ? threadConfigs[selectedThread.id] : undefined;
  const selectedAgent = agents.find((agent) => agent.id === (selectedThreadConfig?.agentId || selectedRun?.assignedAgentId))
    ?? agents.find((agent) => agent.id === selectedRun?.assignedAgentId)
    ?? agents[0];
  const chatController = useOperatorChatController({
    workspace: selectedWorkspace,
    thread: selectedThread,
    assignedAgent: selectedAgent,
  });

  const controlMutation = useMutation({
    mutationFn: async ({ action, nextAgentId }: { action: HumanControlAction; nextAgentId?: string }) => {
      if (!selectedRun) {
        return null;
      }

      return applyHumanControlAction(selectedRun.id, action, nextAgentId);
    },
    onSuccess: (result, variables) => {
      if (!result) {
        return;
      }

      setControlMessage(
        result.live
          ? `Control action sent: ${variables.action}.`
          : `Control action previewed: ${variables.action}. The separate control backend is not reachable yet, so the UI stayed in fallback mode.`,
      );
    },
  });

  useEffect(() => {
    if (!selectedThread || agents.length === 0) {
      return;
    }

    setThreadConfigs((current) => {
      if (current[selectedThread.id]) {
        return current;
      }

      return {
        ...current,
        [selectedThread.id]: {
          agentId: selectedRun?.assignedAgentId || agents[0].id,
          primaryModel: availableModels[0] || FALLBACK_MODELS[0],
          fallbackModel: availableModels[1] || availableModels[0] || FALLBACK_MODELS[1],
        },
      };
    });
  }, [selectedRun?.assignedAgentId, selectedThread, agents, availableModels]);

  const handleCreateSession = () => {
    const workspaceId = selectedWorkspaceId || snapshot?.workspaces[0]?.id;
    if (!workspaceId) {
      return;
    }

    const nextThread: ChatThreadSummary = {
      id: `thread-local-${Date.now()}`,
      title: `New Session ${localThreads.length + 1}`,
      workspaceId,
      status: 'ready',
      delegatedTo: selectedAgent?.name || 'Unassigned',
      updatedAt: new Date().toISOString(),
      objective: 'New focused session for a distinct workstream.',
    };

    setLocalThreads((current) => [nextThread, ...current]);
    setThreadConfigs((current) => ({
      ...current,
      [nextThread.id]: {
        agentId: agents[0]?.id || '',
        primaryModel: availableModels[0] || FALLBACK_MODELS[0],
        fallbackModel: availableModels[1] || availableModels[0] || FALLBACK_MODELS[1],
      },
    }));
    setSelectedWorkspaceId(workspaceId);
    setSelectedThreadId(nextThread.id);
    setSelectedRunId(undefined);
    setControlMessage(`Created session: ${nextThread.title}. Choose an agent and model stack in the Thread tab before sending messages.`);
  };

  if (snapshotQuery.isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Command Center
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Loading the control-plane snapshot...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!snapshot) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Unable to load the command center snapshot.</Alert>
      </Box>
    );
  }

  const activeRunCount = snapshot.runs.filter((run) => run.operatorStatus === 'running').length;
  const approvalCount = snapshot.runs.reduce((sum, run) => sum + run.approvals.filter((approval) => approval.status === 'pending').length, 0);
  const onlineAgents = snapshot.agents.filter((agent) => agent.status === 'online' || agent.status === 'busy').length;

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Command Center
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, maxWidth: 860 }}>
              MemoryMe v1 is now framed around one production-credible path: chat to delegate a task, run an agent, inspect the stream, intervene with human controls, and complete the run without leaving the operator surface.
            </Typography>
          </Box>
          <Chip
            icon={<HubIcon />}
            label={`Unified backend: ${appConfig.controlApiBaseUrl}`}
            variant="outlined"
            sx={{ maxWidth: '100%' }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SectionCard title="Workspaces" subtitle="Active operator surfaces">
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{snapshot.workspaces.length}</Typography>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SectionCard title="Live Runs" subtitle="Currently executing">
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{activeRunCount}</Typography>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SectionCard title="Pending Approvals" subtitle="Human decisions waiting">
              <Typography variant="h4" sx={{ fontWeight: 800, color: approvalCount > 0 ? 'warning.main' : 'text.primary' }}>{approvalCount}</Typography>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SectionCard title="Online Agents" subtitle="Registry availability">
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{onlineAgents} / {snapshot.agents.length}</Typography>
            </SectionCard>
          </Grid>
        </Grid>

        {controlMessage ? <Alert severity="info">{controlMessage}</Alert> : null}

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 3 }}>
            <Stack spacing={2.5}>
              <SectionCard title="Workspaces" subtitle="Auth, tenancy, and operator scope">
                <Stack spacing={1}>
                  {snapshot.workspaces.map((workspace) => {
                    const active = workspace.id === selectedWorkspaceId;
                    return (
                      <Box
                        key={workspace.id}
                        onClick={() => setSelectedWorkspaceId(workspace.id)}
                        sx={{
                          border: '1px solid',
                          borderColor: active ? 'text.primary' : 'divider',
                          bgcolor: active ? 'rgba(255,255,255,0.06)' : 'background.default',
                          borderRadius: 1.5,
                          p: 1.5,
                          cursor: 'pointer',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {workspace.name}
                        </Typography>
                        <Stack direction="row" spacing={0.75} sx={{ mt: 0.75, flexWrap: 'wrap' }}>
                          <Chip size="small" label={workspace.environment.toUpperCase()} variant="outlined" />
                          <Chip size="small" label={`${workspace.activeRuns} active runs`} variant="outlined" />
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </SectionCard>

              <SectionCard title="Threads" subtitle="Delegate-ready conversations">
                <Stack spacing={1}>
                  {workspaceThreads.map((thread) => {
                    const active = thread.id === selectedThread?.id;
                    return (
                      <Box
                        key={thread.id}
                        onClick={() => setSelectedThreadId(thread.id)}
                        sx={{
                          border: '1px solid',
                          borderColor: active ? 'text.primary' : 'divider',
                          bgcolor: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                          borderRadius: 1.5,
                          p: 1.5,
                          cursor: 'pointer',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {thread.title}
                          </Typography>
                          <Chip size="small" label={thread.status.toUpperCase()} color={toneForThread(thread.status)} />
                        </Box>
                        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.75 }}>
                          {thread.objective}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </SectionCard>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <OperatorChatPanel
              workspace={selectedWorkspace}
              thread={selectedThread}
              assignedAgent={selectedAgent}
              run={selectedRun}
              controller={chatController}
              onOpenFullScreen={() => setChatFullScreenOpen(true)}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2.5}>
              <SectionCard
                title="Run State"
                subtitle="Task state, human controls, and assignment"
                action={selectedRun ? <Chip size="small" label={labelForRun(selectedRun.operatorStatus)} color={toneForRun(selectedRun.operatorStatus)} /> : null}
              >
                {selectedRun ? (
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                        Goal
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.75 }}>
                        {selectedRun.goal}
                      </Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Run completion</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{selectedRun.completion}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={selectedRun.completion} />
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      <Chip size="small" icon={<SmartToyOutlinedIcon />} label={selectedAgent?.name || 'Unassigned'} variant="outlined" />
                      <Chip size="small" label={`Thread: ${selectedThread?.title || 'Unknown'}`} variant="outlined" />
                    </Stack>
                    <Divider />
                    <Grid container spacing={1.25}>
                      <Grid size={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<PauseCircleOutlineIcon />}
                          onClick={() => controlMutation.mutate({ action: 'pause' })}
                        >
                          Pause
                        </Button>
                      </Grid>
                      <Grid size={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<AutorenewIcon />}
                          onClick={() => controlMutation.mutate({ action: 'retry' })}
                        >
                          Retry
                        </Button>
                      </Grid>
                      <Grid size={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<AssignmentTurnedInOutlinedIcon />}
                          onClick={() => controlMutation.mutate({ action: 'reassign', nextAgentId: snapshot.agents[0]?.id })}
                        >
                          Reassign
                        </Button>
                      </Grid>
                      <Grid size={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<FactCheckOutlinedIcon />}
                          onClick={() => controlMutation.mutate({ action: 'approve' })}
                        >
                          Approve
                        </Button>
                      </Grid>
                    </Grid>
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Pick a thread to inspect its current run.
                  </Typography>
                )}
              </SectionCard>

              <SectionCard title="Approvals" subtitle="Human-in-the-loop checkpoints">
                <Stack spacing={1}>
                  {selectedRun?.approvals.length ? selectedRun.approvals.map((approval) => (
                    <Box key={approval.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {approval.label}
                        </Typography>
                        <Chip size="small" color={approval.status === 'pending' ? 'warning' : 'success'} label={approval.status.toUpperCase()} />
                      </Box>
                      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.75 }}>
                        {approval.summary}
                      </Typography>
                    </Box>
                  )) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No open approvals for this run.
                    </Typography>
                  )}
                </Stack>
              </SectionCard>

              <SectionCard title="Agent Registry" subtitle="Available execution adapters">
                <Stack spacing={1}>
                  {snapshot.agents.map((agent) => (
                    <Box key={agent.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {agent.name}
                        </Typography>
                        <Chip size="small" color={toneForAgent(agent.status)} label={agent.status.toUpperCase()} />
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>
                        {agent.provider} via {agent.adapter}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </SectionCard>
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title="Live Event Stream" subtitle="What the operator needs to inspect in real time">
              <Stack spacing={1.25}>
                {selectedRun?.events.map((event) => (
                  <Box key={event.id} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                    <StreamOutlinedIcon sx={{ fontSize: '1rem', color: 'text.primary', mt: 0.25 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {event.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.25 }}>
                        {event.detail}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 3 }}>
            <SectionCard title="Artifacts" subtitle="Plans, reports, patches, and logs">
              <Stack spacing={1}>
                {selectedRun?.artifacts.map((artifact) => (
                  <Box key={artifact.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <DescriptionOutlinedIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {artifact.label}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.75 }}>
                      {artifact.type.toUpperCase()} · {artifact.sizeLabel}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 3 }}>
            <SectionCard title="Operator Logs" subtitle="Concise run diagnostics">
              <Stack spacing={1}>
                {selectedRun?.logs.map((log) => (
                  <Box key={log.id} sx={{ borderLeft: '2px solid', borderColor: log.level === 'error' ? 'error.main' : log.level === 'warning' ? 'warning.main' : 'text.primary', pl: 1.25 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                      {log.level}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.4 }}>
                      {log.message}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>

        <Alert severity="info" icon={<PlayCircleOutlineIcon />}>
          Backend contract is now separated behind `VITE_CONTROL_API_BASE_URL`. The frontend uses a unified snapshot endpoint plus a TanStack AI SSE chat stream, so we can ship the control API independently without reshaping the UI again.
        </Alert>
      </Stack>

      <FullScreenChatWorkspace
        open={chatFullScreenOpen}
        onClose={() => setChatFullScreenOpen(false)}
        controller={chatController}
        workspace={selectedWorkspace}
        thread={selectedThread}
        threads={workspaceThreads}
        onSelectThread={(threadId) => {
          setSelectedThreadId(threadId);
          const matchingRun = snapshot?.runs.find((run) => run.threadId === threadId);
          setSelectedRunId(matchingRun?.id);
        }}
        onCreateSession={handleCreateSession}
        agents={agents}
        assignedAgent={selectedAgent}
        run={selectedRun}
        threadConfig={selectedThreadConfig}
        threadConfigs={threadConfigs}
        onThreadConfigChange={(patch) => {
          if (!selectedThread) {
            return;
          }

          setThreadConfigs((current) => ({
            ...current,
            [selectedThread.id]: {
              ...(current[selectedThread.id] || FALLBACK_THREAD_CONFIG),
              ...patch,
            },
          }));
        }}
        availableModels={availableModels}
      />
    </Box>
  );
}
