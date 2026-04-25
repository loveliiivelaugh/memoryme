import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Chip, Stack, Button, LinearProgress } from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router';
import { supabase } from '@api/supabase';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

// ─── KPI Card ─────────────────────────────────────────────────────────────────

type KPICardProps = {
    label: string;
    value: string | number;
    sub?: string;
    color?: 'default' | 'success' | 'warning' | 'error' | 'info';
    icon: React.ReactNode;
    onClick?: () => void;
};

function KPICard({ label, value, sub, color = 'default', icon, onClick }: KPICardProps) {
    const colorMap = {
        default: 'text.primary',
        success: 'success.main',
        warning: 'warning.main',
        error: 'error.main',
        info: 'primary.main',
    };

    return (
        <Box
            component={motion.div}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            onClick={onClick}
            sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2.5,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'border-color 0.15s ease',
                '&:hover': onClick ? { borderColor: 'primary.main' } : {},
                height: '100%',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ color: colorMap[color], opacity: 0.8 }}>{icon}</Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colorMap[color], lineHeight: 1 }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
                {label}
            </Typography>
            {sub && (
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.25 }}>
                    {sub}
                </Typography>
            )}
        </Box>
    );
}

// ─── Agent Health Row ─────────────────────────────────────────────────────────

const MOCK_AGENTS = [
    { name: 'GitHub Agent', source: 'github', status: 'healthy', lastSync: new Date(Date.now() - 120_000), successRate: 99, memCount: 142 },
    { name: 'Notion Sync', source: 'notion', status: 'healthy', lastSync: new Date(Date.now() - 2_700_000), successRate: 91, memCount: 87 },
    { name: 'Email Agent', source: 'email', status: 'warning', lastSync: new Date(Date.now() - 86_400_000), successRate: 74, memCount: 23 },
    { name: 'Slack Agent', source: 'slack', status: 'error', lastSync: new Date(Date.now() - 172_800_000), successRate: 0, memCount: 0 },
];

function AgentHealthRow({ agent }: { agent: typeof MOCK_AGENTS[0] }) {
    const statusColor = agent.status === 'healthy' ? 'success' : agent.status === 'warning' ? 'warning' : 'error';
    const StatusIcon = agent.status === 'healthy' ? CheckCircleIcon : agent.status === 'warning' ? WarningAmberIcon : ErrorOutlineIcon;
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.25,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
            }}
        >
            <StatusIcon sx={{ fontSize: '1rem', color: `${statusColor}.main` }} />
            <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {agent.name}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    Last sync: {formatDistanceToNow(agent.lastSync, { addSuffix: true })}
                </Typography>
            </Box>
            <Box sx={{ width: 80, textAlign: 'right' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
                    {agent.successRate}%
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={agent.successRate}
                    color={statusColor}
                    sx={{ height: 3, borderRadius: 2, mt: 0.5 }}
                />
            </Box>
            <Chip
                label={agent.memCount}
                size="small"
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, minWidth: 32 }}
            />
        </Box>
    );
}

// ─── Recent High-Signal Memories ──────────────────────────────────────────────

function RecentHighSignalCard({ title, source, confidence, capturedAt }: {
    title: string; source: string; confidence: number; capturedAt: Date;
}) {
    return (
        <Box
            sx={{
                py: 1.25,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
                cursor: 'pointer',
                '&:hover .mem-title': { color: 'primary.main' },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Typography
                    className="mem-title"
                    variant="body2"
                    sx={{ fontWeight: 500, color: 'text.primary', transition: 'color 0.15s', lineHeight: 1.4 }}
                >
                    {title}
                </Typography>
                <Chip
                    label={`${confidence}%`}
                    size="small"
                    color="success"
                    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.25 }}>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    {source}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>·</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    {formatDistanceToNow(capturedAt, { addSuffix: true })}
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const navigate = useNavigate();
    const [memCount, setMemCount] = useState<number>(0);
    const [pendingCount, setPendingCount] = useState<number>(0);

    useEffect(() => {
        (async () => {
            try {
                const { count, data } = await supabase
                    .from('memories')
                    .select('id, memory_state', { count: 'exact' });
                if (count) setMemCount(count);
                if (data) {
                    const pending = data.filter((m: any) =>
                        !m.memory_state || m.memory_state === 'raw' || m.memory_state === 'needs_review'
                    ).length;
                    setPendingCount(pending);
                }
            } catch {
                setMemCount(247);
                setPendingCount(42);
            }
        })();
    }, []);

    const kpis = [
        {
            label: 'New Memories Today',
            value: memCount > 0 ? memCount : 247,
            sub: 'across all sources',
            color: 'info' as const,
            icon: <TrendingUpIcon />,
            onClick: () => navigate('/inbox'),
        },
        {
            label: 'Pending Review',
            value: pendingCount > 0 ? pendingCount : 42,
            sub: 'needs attention',
            color: 'warning' as const,
            icon: <InboxIcon />,
            onClick: () => navigate('/inbox'),
        },
        {
            label: 'Canonical Records',
            value: 18,
            sub: 'trusted knowledge',
            color: 'success' as const,
            icon: <AccountTreeIcon />,
            onClick: () => navigate('/knowledge'),
        },
        {
            label: 'Agent Health',
            value: '3 / 4',
            sub: '1 needs attention',
            color: 'warning' as const,
            icon: <MonitorHeartIcon />,
            onClick: () => navigate('/agent-ops'),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            {/* KPI row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {kpis.map((kpi, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                        <KPICard {...kpi} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2.5}>
                {/* Agent health */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 2.5,
                            height: '100%',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Agent Health
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => navigate('/agent-ops')}
                                sx={{ fontSize: '0.75rem', py: 0.4 }}
                            >
                                View All
                            </Button>
                        </Box>
                        {MOCK_AGENTS.map((agent) => (
                            <AgentHealthRow key={agent.name} agent={agent} />
                        ))}
                    </Box>
                </Grid>

                {/* Recent high-signal */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 2.5,
                            height: '100%',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Recent High-Signal Memories
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => navigate('/inbox')}
                                sx={{ fontSize: '0.75rem', py: 0.4 }}
                            >
                                Inbox
                            </Button>
                        </Box>
                        {[
                            { title: 'Merged PR #442 into production-core', source: 'github', confidence: 98, capturedAt: new Date(Date.now() - 14_000) },
                            { title: 'Latency spike: API response times up 340%', source: 'github', confidence: 97, capturedAt: new Date(Date.now() - 300_000) },
                            { title: 'Alex Rivera onboarding complete', source: 'slack', confidence: 91, capturedAt: new Date(Date.now() - 9_000_000) },
                        ].map((mem, i) => (
                            <RecentHighSignalCard key={i} {...mem} />
                        ))}
                    </Box>
                </Grid>

                {/* Stale / conflict alerts */}
                <Grid size={12}>
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'warning.main',
                            borderRadius: 2,
                            p: 2.5,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <WarningAmberIcon sx={{ color: 'warning.main', fontSize: '1.1rem' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Stale Knowledge Alerts
                            </Typography>
                            <Chip label="3 items" color="warning" size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
                        </Box>
                        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                            {[
                                'Project Chimera Roadmap last verified 14 days ago',
                                'Core Team headcount record may be outdated',
                                'API rate limit policy unchanged since Q1',
                            ].map((alert, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        bgcolor: 'background.default',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1.5,
                                        px: 1.5,
                                        py: 1,
                                        cursor: 'pointer',
                                        '&:hover': { borderColor: 'warning.main' },
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                                        {alert}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
