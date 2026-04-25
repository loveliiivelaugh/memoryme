import { useState, useEffect } from 'react';
import {
    Box, Typography, Chip, Button, Stack, IconButton,
    Tooltip, Divider, Grid, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArticleIcon from '@mui/icons-material/Article';
import EmailIcon from '@mui/icons-material/Email';
import SlackIcon from '@mui/icons-material/Tag';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MergeIcon from '@mui/icons-material/MergeType';
import ArchiveIcon from '@mui/icons-material/Archive';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@api/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

type MemoryState = 'raw' | 'needs_review' | 'canonical_candidate' | 'canonical' | 'stale' | 'archived' | 'rejected';

export type InboxMemory = {
    id: string;
    title: string;
    summary?: string;
    content?: string;
    source: string;
    agent?: string;
    confidence_score?: number;
    memory_state?: MemoryState;
    why_it_matters?: string;
    tags?: string[];
    created_at: string;
    ingested_at?: string;
};

type FilterTab = 'all' | 'needs_review' | 'high_signal' | 'duplicates';

// ─── Mock data (used as fallback / demo) ─────────────────────────────────────

const MOCK_MEMORIES: InboxMemory[] = [
    {
        id: 'mock-1',
        title: 'Merged PR #442 into production-core',
        source: 'github',
        agent: 'GitHub Agent',
        summary: 'The core memory module was updated to handle recursive logic in semantic nodes. This change affects how the knowledge graph resolves conflicting identities across multi-agent streams.',
        why_it_matters: "Crucial for resolving the current duplication errors in Project Chimera's knowledge base.",
        memory_state: 'needs_review',
        confidence_score: 98,
        created_at: new Date(Date.now() - 14_000).toISOString(),
        tags: ['production', 'memory', 'semantic'],
    },
    {
        id: 'mock-2',
        title: 'Meeting Notes: Architecture Review',
        source: 'notion',
        agent: 'Notion Sync',
        summary: 'Discussion centered on migrating to a decentralized indexing system for edge-node memories. Three action items identified for the infrastructure team.',
        why_it_matters: 'Provides context for the upcoming budget realignment in Q3.',
        memory_state: 'raw',
        confidence_score: 82,
        created_at: new Date(Date.now() - 2_700_000).toISOString(),
        tags: ['architecture', 'infra', 'Q3'],
    },
    {
        id: 'mock-3',
        title: 'Alex Rivera onboarding complete — Core Team confirmed',
        source: 'slack',
        agent: 'Slack Agent',
        summary: 'Alex Rivera has been added to the Core Team workspace. Matches existing "Core Team" cluster in knowledge graph with high confidence.',
        why_it_matters: 'New entity link candidate to Core Team project cluster.',
        memory_state: 'needs_review',
        confidence_score: 91,
        created_at: new Date(Date.now() - 9_000_000).toISOString(),
        tags: ['people', 'onboarding'],
    },
    {
        id: 'mock-4',
        title: 'Latency spike: API response times up 340%',
        source: 'github',
        agent: 'GitHub Agent',
        summary: 'Monitoring alert triggered in production-core. P99 latency increased from 120ms to 527ms following the memory-module update. Rollback candidate flagged.',
        why_it_matters: 'Related to PR #442 — direct downstream effect of memory module change.',
        memory_state: 'needs_review',
        confidence_score: 97,
        created_at: new Date(Date.now() - 300_000).toISOString(),
        tags: ['alert', 'latency', 'production'],
    },
    {
        id: 'mock-5',
        title: 'Q3 Budget Realignment — Notion Page Updated',
        source: 'notion',
        agent: 'Notion Sync',
        summary: 'Finance team updated Q3 budget allocations. Infrastructure line increased by 18%. Marketing reduced by 12%. Requires approval from board by EOW.',
        why_it_matters: 'Directly impacts infrastructure roadmap and hiring decisions through Q4.',
        memory_state: 'raw',
        confidence_score: 75,
        created_at: new Date(Date.now() - 18_000_000).toISOString(),
        tags: ['finance', 'Q3', 'budget'],
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SOURCE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    github: { label: 'GitHub Agent', icon: <DataObjectIcon sx={{ fontSize: '1rem' }} />, color: '#6e7681' },
    notion: { label: 'Notion Sync', icon: <FormatQuoteIcon sx={{ fontSize: '1rem' }} />, color: '#6e7681' },
    email: { label: 'Email Agent', icon: <EmailIcon sx={{ fontSize: '1rem' }} />, color: '#6e7681' },
    slack: { label: 'Slack Agent', icon: <SlackIcon sx={{ fontSize: '1rem' }} />, color: '#6e7681' },
};

const STATE_BADGE: Record<MemoryState, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'; variant: 'filled' | 'outlined' }> = {
    raw: { label: 'RAW', color: 'default', variant: 'outlined' },
    needs_review: { label: 'NEEDS REVIEW', color: 'warning', variant: 'filled' },
    canonical_candidate: { label: 'CANONICAL CANDIDATE', color: 'info', variant: 'filled' },
    canonical: { label: 'CANONICAL', color: 'success', variant: 'filled' },
    stale: { label: 'STALE', color: 'warning', variant: 'outlined' },
    archived: { label: 'ARCHIVED', color: 'default', variant: 'outlined' },
    rejected: { label: 'REJECTED', color: 'error', variant: 'outlined' },
};

function deriveState(mem: any): MemoryState {
    if (mem.memory_state) return mem.memory_state as MemoryState;
    return 'raw';
}

function deriveConfidence(mem: any): number | undefined {
    return mem.confidence_score ?? mem.score ?? undefined;
}

function normalizeMem(mem: any): InboxMemory {
    return {
        id: mem.id || mem.trace_id || String(Math.random()),
        title: mem.title || mem.summary || 'Untitled',
        summary: mem.summary || mem.payload?.summary || mem.content?.slice(0, 160),
        content: mem.content || mem.payload?.content,
        source: mem.source || 'unknown',
        agent: mem.agent || SOURCE_META[mem.source]?.label || mem.source || 'Unknown Agent',
        confidence_score: deriveConfidence(mem),
        memory_state: deriveState(mem),
        why_it_matters: mem.why_it_matters,
        tags: mem.tags || mem.payload?.tags || [],
        created_at: mem.created_at || mem.ingested_at || new Date().toISOString(),
        ingested_at: mem.ingested_at,
    };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LifecycleBadge({ state }: { state: MemoryState }) {
    const cfg = STATE_BADGE[state] ?? STATE_BADGE.raw;
    return (
        <Chip
            label={cfg.label}
            color={cfg.color}
            variant={cfg.variant}
            size="small"
            sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                letterSpacing: '0.06em',
                height: 22,
                borderRadius: 0.75,
            }}
        />
    );
}

function ProvenanceRow({ source, agent }: { source: string; agent?: string }) {
    const meta = SOURCE_META[source] ?? SOURCE_META.github;
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>{meta.icon}</Box>
            <Typography
                sx={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                }}
            >
                {agent || meta.label}
            </Typography>
        </Box>
    );
}

type MemoryCardProps = {
    memory: InboxMemory;
    onApprove: (id: string) => void;
    onMerge: (id: string) => void;
    onArchive: (id: string) => void;
};

function MemoryInboxCard({ memory, onApprove, onMerge, onArchive }: MemoryCardProps) {
    const state = memory.memory_state ?? 'raw';
    const confidence = memory.confidence_score;

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                mb: 1.5,
                overflow: 'hidden',
            }}
        >
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
                {/* Card header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.75 }}>
                    <ProvenanceRow source={memory.source} agent={memory.agent} />
                    <LifecycleBadge state={state} />
                </Box>

                {/* Title + confidence */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary', lineHeight: 1.3 }}
                    >
                        {memory.title}
                    </Typography>
                    {confidence !== undefined && (
                        <Typography
                            sx={{ fontSize: '0.75rem', color: 'text.secondary', flexShrink: 0, ml: 2 }}
                        >
                            Confidence:{' '}
                            <Box
                                component="span"
                                sx={{ color: confidence >= 90 ? 'success.main' : confidence >= 70 ? 'warning.main' : 'error.main', fontWeight: 600 }}
                            >
                                {confidence}%
                            </Box>
                        </Typography>
                    )}
                </Box>

                {/* Summary */}
                {memory.summary && (
                    <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 1.5 }}
                    >
                        {memory.summary}
                    </Typography>
                )}

                {/* Why it matters */}
                {memory.why_it_matters && (
                    <Box
                        sx={{
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            px: 1.5,
                            py: 1,
                            mb: 1.5,
                        }}
                    >
                        <Typography
                            sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary', mb: 0.5, textTransform: 'uppercase' }}
                        >
                            Why This Matters
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                            {memory.why_it_matters}
                        </Typography>
                    </Box>
                )}

                {/* Tags */}
                {memory.tags && memory.tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                        {memory.tags.slice(0, 5).map((tag) => (
                            <Chip
                                key={tag}
                                label={`#${tag}`}
                                size="small"
                                sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    bgcolor: 'action.selected',
                                    color: 'text.secondary',
                                    borderRadius: 0.5,
                                }}
                            />
                        ))}
                    </Box>
                )}

                {/* Actions + timestamp */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<CheckCircleOutlineIcon sx={{ fontSize: '0.85rem !important' }} />}
                            onClick={() => onApprove(memory.id)}
                            sx={{ fontSize: '0.75rem', py: 0.4, px: 1.25, borderRadius: 1 }}
                        >
                            Approve
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MergeIcon sx={{ fontSize: '0.85rem !important' }} />}
                            onClick={() => onMerge(memory.id)}
                            sx={{ fontSize: '0.75rem', py: 0.4, px: 1.25, borderRadius: 1 }}
                        >
                            Merge
                        </Button>
                        <Button
                            size="small"
                            variant="text"
                            startIcon={<ArchiveIcon sx={{ fontSize: '0.85rem !important' }} />}
                            onClick={() => onArchive(memory.id)}
                            sx={{ fontSize: '0.75rem', py: 0.4, px: 1.25, color: 'text.secondary', borderRadius: 1 }}
                        >
                            Archive
                        </Button>
                    </Box>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                        Captured{' '}
                        {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

// ─── Right rail ───────────────────────────────────────────────────────────────

const QUICK_CLUSTERS = [
    {
        id: 'c1',
        title: 'Duplicate Found',
        badge: '3 Matches',
        badgeColor: 'warning' as const,
        description: '"Project Chimera Roadmap" mentioned across Slack, GitHub, and Notion.',
    },
    {
        id: 'c2',
        title: 'Semantic Link',
        badge: 'High Signal',
        badgeColor: 'info' as const,
        description: "A new contact 'Alex Rivera' likely links to your 'Core Team' cluster.",
    },
    {
        id: 'c3',
        title: 'Trend Detected',
        badge: 'Analysis',
        badgeColor: 'default' as const,
        description: "Increasing mentions of 'Latency Issues' in performance logs over 24h.",
    },
];

function IncomingStreamStats({ memories }: { memories: InboxMemory[] }) {
    const total = memories.length;
    const pendingReview = memories.filter(
        (m) => m.memory_state === 'needs_review' || m.memory_state === 'raw'
    ).length;
    const withConfidence = memories.filter((m) => m.confidence_score !== undefined);
    const avgConfidence =
        withConfidence.length > 0
            ? Math.round(withConfidence.reduce((s, m) => s + (m.confidence_score ?? 0), 0) / withConfidence.length)
            : null;

    return (
        <Box
            sx={{
                width: 300,
                minWidth: 300,
                bgcolor: 'background.paper',
                borderLeft: '1px solid',
                borderColor: 'divider',
                height: '100%',
                overflowY: 'auto',
                px: 2.5,
                py: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            {/* Header */}
            <Box>
                <Typography
                    sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'text.secondary', textTransform: 'uppercase', mb: 1.5 }}
                >
                    Incoming Stream Stats
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1, color: 'text.primary' }}>
                        {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total}
                    </Typography>
                    {/* Mini bar chart */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.4, mb: 0.25 }}>
                        {[0.4, 0.65, 0.5, 0.8, 0.6, 0.9, 1.0].map((h, i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: 8,
                                    height: 32 * h,
                                    bgcolor: i === 6 ? 'primary.main' : 'action.selected',
                                    borderRadius: 0.5,
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        ))}
                    </Box>
                </Box>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', color: 'text.secondary', textTransform: 'uppercase' }}>
                    Total Ingested
                </Typography>
            </Box>

            {/* KPI grid */}
            <Grid container spacing={1}>
                <Grid size={6}>
                    <Box
                        sx={{
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1.5,
                            p: 1.5,
                        }}
                    >
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {pendingReview}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase', mt: 0.25 }}>
                            Pending Review
                        </Typography>
                    </Box>
                </Grid>
                <Grid size={6}>
                    <Box
                        sx={{
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1.5,
                            p: 1.5,
                        }}
                    >
                        <Typography variant="h5" sx={{ fontWeight: 700, color: avgConfidence && avgConfidence >= 80 ? 'success.main' : 'text.primary' }}>
                            {avgConfidence !== null ? `${avgConfidence}%` : 'N/A'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase', mt: 0.25 }}>
                            Avg Confidence
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            <Divider />

            {/* Quick Clusters */}
            <Box>
                <Typography
                    sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'text.secondary', textTransform: 'uppercase', mb: 1 }}
                >
                    Quick Clusters
                </Typography>
                <Stack spacing={1}>
                    {QUICK_CLUSTERS.map((cluster) => (
                        <Box
                            key={cluster.id}
                            sx={{
                                bgcolor: 'background.default',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1.5,
                                p: 1.5,
                                cursor: 'pointer',
                                transition: 'border-color 0.15s ease',
                                '&:hover': { borderColor: 'primary.main' },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8rem' }}>
                                    {cluster.title}
                                </Typography>
                                <Chip
                                    label={cluster.badge}
                                    color={cluster.badgeColor}
                                    size="small"
                                    sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, borderRadius: 0.5 }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1.4, fontStyle: 'italic' }}>
                                {cluster.description}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const FILTER_TABS: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'needs_review', label: 'Needs Review' },
    { value: 'high_signal', label: 'High Signal' },
    { value: 'duplicates', label: 'Duplicates' },
];

export default function InboxPage() {
    const [filter, setFilter] = useState<FilterTab>('needs_review');
    const [memories, setMemories] = useState<InboxMemory[]>([]);
    const [lastSynced, setLastSynced] = useState<Date>(new Date());

    // Load from Supabase, fall back to mock data
    useEffect(() => {
        (async () => {
            try {
                const { data } = await supabase
                    .from('memories')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);
                if (data && data.length > 0) {
                    setMemories(data.map(normalizeMem));
                } else {
                    setMemories(MOCK_MEMORIES);
                }
                setLastSynced(new Date());
            } catch {
                setMemories(MOCK_MEMORIES);
            }
        })();
    }, []);

    // Live subscription
    useEffect(() => {
        const channel = supabase
            .channel('inbox-memories')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memories' }, (payload) => {
                setMemories((prev) => [normalizeMem(payload.new), ...prev]);
                setLastSynced(new Date());
            })
            .subscribe();
        return () => { channel.unsubscribe(); };
    }, []);

    const filteredMemories = memories.filter((m) => {
        if (filter === 'all') return true;
        if (filter === 'needs_review') return m.memory_state === 'needs_review' || m.memory_state === 'raw';
        if (filter === 'high_signal') return (m.confidence_score ?? 0) >= 90;
        if (filter === 'duplicates') return false; // placeholder
        return true;
    });

    const handleApprove = (id: string) => {
        setMemories((prev) =>
            prev.map((m) => (m.id === id ? { ...m, memory_state: 'canonical_candidate' as MemoryState } : m))
        );
    };

    const handleMerge = (id: string) => {
        setMemories((prev) =>
            prev.map((m) => (m.id === id ? { ...m, memory_state: 'canonical' as MemoryState } : m))
        );
    };

    const handleArchive = (id: string) => {
        setMemories((prev) => prev.filter((m) => m.id !== id));
    };

    return (
        <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Main content */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
                {/* Filter toolbar */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                    <ToggleButtonGroup
                        value={filter}
                        exclusive
                        onChange={(_, val) => val && setFilter(val as FilterTab)}
                        size="small"
                        sx={{
                            '& .MuiToggleButton-root': {
                                px: 2,
                                py: 0.6,
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                borderColor: 'divider',
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: '#0d1117',
                                    fontWeight: 700,
                                    '&:hover': { bgcolor: 'primary.light' },
                                },
                            },
                        }}
                    >
                        {FILTER_TABS.map((tab) => (
                            <ToggleButton key={tab.value} value={tab.value}>
                                {tab.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <AccessTimeIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            Last synced:{' '}
                            {formatDistanceToNow(lastSynced, { addSuffix: true })}
                        </Typography>
                    </Box>
                </Box>

                {/* Memory cards */}
                <AnimatePresence initial={false}>
                    {filteredMemories.length > 0 ? (
                        filteredMemories.map((memory) => (
                            <MemoryInboxCard
                                key={memory.id}
                                memory={memory}
                                onApprove={handleApprove}
                                onMerge={handleMerge}
                                onArchive={handleArchive}
                            />
                        ))
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 8,
                                color: 'text.secondary',
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Inbox is clear
                            </Typography>
                            <Typography variant="body2">
                                No memories match this filter right now.
                            </Typography>
                        </Box>
                    )}
                </AnimatePresence>
            </Box>

            {/* Right rail */}
            <IncomingStreamStats memories={memories} />
        </Box>
    );
}
