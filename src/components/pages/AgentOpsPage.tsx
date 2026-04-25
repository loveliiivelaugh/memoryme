import { useState } from 'react';
import {
    Box, Typography, Grid, Chip, LinearProgress,
    Table, TableBody, TableCell, TableHead, TableRow,
    Button, Stack, Divider, Switch, FormControlLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStatus = 'healthy' | 'warning' | 'error' | 'paused';

type AgentSource = {
    id: string;
    name: string;
    source: string;
    status: AgentStatus;
    lastSync: Date;
    successRate: number;
    memoriesTotal: number;
    duplicateRate: number;
    failuresToday: number;
    highSignalRatio: number;
    autoPromote: boolean;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_AGENTS: AgentSource[] = [
    {
        id: '1', name: 'GitHub Agent', source: 'github', status: 'healthy',
        lastSync: new Date(Date.now() - 120_000), successRate: 99, memoriesTotal: 142,
        duplicateRate: 3, failuresToday: 0, highSignalRatio: 78, autoPromote: true,
    },
    {
        id: '2', name: 'Notion Sync', source: 'notion', status: 'healthy',
        lastSync: new Date(Date.now() - 2_700_000), successRate: 91, memoriesTotal: 87,
        duplicateRate: 8, failuresToday: 2, highSignalRatio: 62, autoPromote: false,
    },
    {
        id: '3', name: 'Email Agent', source: 'email', status: 'warning',
        lastSync: new Date(Date.now() - 86_400_000), successRate: 74, memoriesTotal: 23,
        duplicateRate: 22, failuresToday: 7, highSignalRatio: 31, autoPromote: false,
    },
    {
        id: '4', name: 'Slack Agent', source: 'slack', status: 'error',
        lastSync: new Date(Date.now() - 172_800_000), successRate: 0, memoriesTotal: 0,
        duplicateRate: 0, failuresToday: 48, highSignalRatio: 0, autoPromote: false,
    },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_ICON: Record<AgentStatus, React.ReactNode> = {
    healthy: <CheckCircleIcon sx={{ fontSize: '1rem', color: 'success.main' }} />,
    warning: <WarningAmberIcon sx={{ fontSize: '1rem', color: 'warning.main' }} />,
    error: <ErrorOutlineIcon sx={{ fontSize: '1rem', color: 'error.main' }} />,
    paused: <MonitorHeartIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />,
};

const STATUS_COLOR: Record<AgentStatus, 'success' | 'warning' | 'error' | 'default'> = {
    healthy: 'success',
    warning: 'warning',
    error: 'error',
    paused: 'default',
};

// ─── Summary KPI ──────────────────────────────────────────────────────────────

function SummaryKPI({ label, value, color }: { label: string; value: string | number; color?: string }) {
    return (
        <Box
            sx={{
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                p: 1.75,
                textAlign: 'center',
            }}
        >
            <Typography variant="h5" sx={{ fontWeight: 700, color: color || 'text.primary' }}>
                {value}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase', mt: 0.25 }}>
                {label}
            </Typography>
        </Box>
    );
}

// ─── Agent detail drawer ──────────────────────────────────────────────────────

function AgentDetailPanel({ agent, onClose }: { agent: AgentSource; onClose: () => void }) {
    const [autoPromote, setAutoPromote] = useState(agent.autoPromote);
    return (
        <Box
            component={motion.div}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            sx={{
                width: 320,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2.5,
                height: 'fit-content',
                position: 'sticky',
                top: 16,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {STATUS_ICON[agent.status]}
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {agent.name}
                    </Typography>
                </Box>
                <Button size="small" onClick={onClose} sx={{ fontSize: '0.7rem', py: 0.3 }}>
                    Close
                </Button>
            </Box>

            <Stack spacing={1.5}>
                <Box>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase', mb: 0.75 }}>
                        Metrics
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid size={6}>
                            <SummaryKPI label="Success Rate" value={`${agent.successRate}%`} color={agent.successRate >= 90 ? 'success.main' : agent.successRate >= 70 ? undefined : 'error.main'} />
                        </Grid>
                        <Grid size={6}>
                            <SummaryKPI label="Duplicate Rate" value={`${agent.duplicateRate}%`} color={agent.duplicateRate >= 20 ? 'warning.main' : undefined} />
                        </Grid>
                        <Grid size={6}>
                            <SummaryKPI label="Failures Today" value={agent.failuresToday} color={agent.failuresToday > 0 ? 'error.main' : undefined} />
                        </Grid>
                        <Grid size={6}>
                            <SummaryKPI label="High Signal %" value={`${agent.highSignalRatio}%`} color={agent.highSignalRatio >= 60 ? 'success.main' : undefined} />
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                <Box>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase', mb: 1 }}>
                        Policy Controls
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={autoPromote}
                                onChange={(e) => setAutoPromote(e.target.checked)}
                                size="small"
                                color="success"
                            />
                        }
                        label={
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                Auto-promote to canonical
                            </Typography>
                        }
                    />
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small" fullWidth sx={{ fontSize: '0.75rem' }}>
                        Force Sync
                    </Button>
                    <Button variant="outlined" color="error" size="small" fullWidth sx={{ fontSize: '0.75rem' }}>
                        Pause
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AgentOpsPage() {
    const [selectedAgent, setSelectedAgent] = useState<AgentSource | null>(null);

    const healthyCount = MOCK_AGENTS.filter((a) => a.status === 'healthy').length;
    const warningCount = MOCK_AGENTS.filter((a) => a.status === 'warning').length;
    const errorCount = MOCK_AGENTS.filter((a) => a.status === 'error').length;
    const totalMems = MOCK_AGENTS.reduce((s, a) => s + a.memoriesTotal, 0);

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <MonitorHeartIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Agent Operations
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Monitor ingestion health, govern agent policies, and surface noisy or failing sources.
                </Typography>
            </Box>

            {/* Summary KPIs */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryKPI label="Healthy" value={healthyCount} color="success.main" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryKPI label="Warnings" value={warningCount} color="warning.main" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryKPI label="Errors" value={errorCount} color="error.main" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryKPI label="Total Memories" value={totalMems} />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                {/* Agent table */}
                <Box
                    sx={{
                        flex: 1,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}
                >
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ '& th': { bgcolor: 'background.default', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', borderColor: 'divider' } }}>
                                <TableCell>Agent</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Last Sync</TableCell>
                                <TableCell>Success Rate</TableCell>
                                <TableCell>Memories</TableCell>
                                <TableCell>Dup Rate</TableCell>
                                <TableCell>High Signal</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {MOCK_AGENTS.map((agent) => (
                                <TableRow
                                    key={agent.id}
                                    onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                                    sx={{
                                        cursor: 'pointer',
                                        bgcolor: selectedAgent?.id === agent.id ? 'action.selected' : 'transparent',
                                        '&:hover': { bgcolor: 'action.hover' },
                                        '& td': { borderColor: 'divider', py: 1.5 },
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            {agent.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            {agent.source}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            {STATUS_ICON[agent.status]}
                                            <Chip
                                                label={agent.status}
                                                color={STATUS_COLOR[agent.status]}
                                                size="small"
                                                sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, textTransform: 'capitalize' }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                            {formatDistanceToNow(agent.lastSync, { addSuffix: true })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={agent.successRate}
                                                color={agent.successRate >= 90 ? 'success' : agent.successRate >= 70 ? 'warning' : 'error'}
                                                sx={{ width: 60, height: 4, borderRadius: 2 }}
                                            />
                                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
                                                {agent.successRate}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.primary' }}>
                                            {agent.memoriesTotal}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.75rem', color: agent.duplicateRate >= 20 ? 'warning.main' : 'text.secondary' }}>
                                            {agent.duplicateRate}%
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.75rem', color: agent.highSignalRatio >= 60 ? 'success.main' : 'text.secondary' }}>
                                            {agent.highSignalRatio}%
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="small" sx={{ fontSize: '0.7rem', py: 0.3, px: 1 }}>
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>

                {/* Detail panel */}
                {selectedAgent && (
                    <AgentDetailPanel
                        agent={selectedAgent}
                        onClose={() => setSelectedAgent(null)}
                    />
                )}
            </Box>
        </Box>
    );
}
