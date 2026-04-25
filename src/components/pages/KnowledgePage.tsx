import { useState } from 'react';
import {
    Box, Typography, Grid, Chip, Stack, Button,
    LinearProgress, Divider, TextField, InputAdornment, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import FolderIcon from '@mui/icons-material/Folder';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PlaceIcon from '@mui/icons-material/Place';
import TargetIcon from '@mui/icons-material/TrackChanges';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

type EntityType = 'person' | 'project' | 'company' | 'concept' | 'place' | 'goal';

type CanonicalRecord = {
    id: string;
    name: string;
    type: EntityType;
    summary: string;
    confidence: number;
    lastVerified: Date;
    memoryCount: number;
    status: 'verified' | 'stale' | 'draft';
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_RECORDS: CanonicalRecord[] = [
    { id: '1', name: 'Project Chimera', type: 'project', summary: 'Decentralized memory indexing system for edge-node agents. Primary goal: reduce latency in multi-agent memory retrieval.', confidence: 94, lastVerified: new Date(Date.now() - 86_400_000), memoryCount: 23, status: 'verified' },
    { id: '2', name: 'Alex Rivera', type: 'person', summary: 'Software engineer. Recently joined Core Team. Key contributor to infrastructure roadmap discussions.', confidence: 88, lastVerified: new Date(Date.now() - 172_800_000), memoryCount: 8, status: 'verified' },
    { id: '3', name: 'Core Team', type: 'project', summary: 'Primary engineering team for MemoryMe. Focuses on infrastructure, agent tooling, and knowledge graph maintenance.', confidence: 97, lastVerified: new Date(Date.now() - 43_200_000), memoryCount: 41, status: 'verified' },
    { id: '4', name: 'Semantic Indexing Strategy', type: 'concept', summary: 'Architecture approach for embedding-based memory retrieval across multi-agent systems. Under active development.', confidence: 76, lastVerified: new Date(Date.now() - 1_296_000_000), memoryCount: 12, status: 'stale' },
    { id: '5', name: 'Q3 Budget Realignment', type: 'goal', summary: 'Finance and infrastructure realignment to support Project Chimera roadmap. Board approval pending.', confidence: 82, lastVerified: new Date(Date.now() - 259_200_000), memoryCount: 6, status: 'draft' },
    { id: '6', name: 'Woodward Studio', type: 'company', summary: 'Organization behind MemoryMe. Focused on AI-powered knowledge tools for operators and founders.', confidence: 99, lastVerified: new Date(Date.now() - 604_800_000), memoryCount: 18, status: 'verified' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ENTITY_ICONS: Record<EntityType, React.ReactNode> = {
    person: <PersonIcon sx={{ fontSize: '1rem' }} />,
    project: <FolderIcon sx={{ fontSize: '1rem' }} />,
    company: <BusinessIcon sx={{ fontSize: '1rem' }} />,
    concept: <LightbulbIcon sx={{ fontSize: '1rem' }} />,
    place: <PlaceIcon sx={{ fontSize: '1rem' }} />,
    goal: <TargetIcon sx={{ fontSize: '1rem' }} />,
};

const ENTITY_COLORS: Record<EntityType, string> = {
    person: '#58a6ff',
    project: '#3fb950',
    company: '#d29922',
    concept: '#bc8cff',
    place: '#f0883e',
    goal: '#39d353',
};

const STATUS_CHIP: Record<CanonicalRecord['status'], { label: string; color: 'success' | 'warning' | 'default' }> = {
    verified: { label: 'Verified', color: 'success' },
    stale: { label: 'Stale', color: 'warning' },
    draft: { label: 'Draft', color: 'default' },
};

function formatRelative(date: Date): string {
    const ms = Date.now() - date.getTime();
    const days = Math.floor(ms / 86_400_000);
    if (days === 0) return 'today';
    if (days === 1) return '1d ago';
    return `${days}d ago`;
}

// ─── Entity Card ─────────────────────────────────────────────────────────────

function EntityCard({ record, onClick }: { record: CanonicalRecord; onClick: () => void }) {
    const status = STATUS_CHIP[record.status];
    const entityColor = ENTITY_COLORS[record.type];

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            onClick={onClick}
            sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                cursor: 'pointer',
                height: '100%',
                transition: 'border-color 0.15s ease',
                '&:hover': { borderColor: entityColor },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: `${entityColor}22`,
                            color: entityColor,
                        }}
                    >
                        {ENTITY_ICONS[record.type]}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                            {record.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: entityColor, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                            {record.type}
                        </Typography>
                    </Box>
                </Box>
                <Chip
                    label={status.label}
                    color={status.color}
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, borderRadius: 0.5 }}
                />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.5, mb: 1.5 }}>
                {record.summary}
            </Typography>

            <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Confidence</Typography>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: record.confidence >= 90 ? 'success.main' : record.confidence >= 70 ? 'warning.main' : 'error.main' }}>
                        {record.confidence}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={record.confidence}
                    color={record.confidence >= 90 ? 'success' : record.confidence >= 70 ? 'warning' : 'error'}
                    sx={{ height: 3, borderRadius: 2 }}
                />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                    label={`${record.memoryCount} memories`}
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'action.selected', color: 'text.secondary' }}
                />
                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                    Verified {formatRelative(record.lastVerified)}
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const ENTITY_FILTERS: { value: EntityType | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'person', label: 'People' },
    { value: 'project', label: 'Projects' },
    { value: 'company', label: 'Companies' },
    { value: 'concept', label: 'Concepts' },
    { value: 'goal', label: 'Goals' },
];

export default function KnowledgePage() {
    const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all');
    const [search, setSearch] = useState('');

    const filtered = MOCK_RECORDS.filter((r) => {
        if (typeFilter !== 'all' && r.type !== typeFilter) return false;
        if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.summary.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <AccountTreeIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Canonical Knowledge
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Trusted, durable knowledge records maintained from reviewed memories.
                </Typography>
            </Box>

            {/* Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    placeholder="Search knowledge..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 240 }}
                />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {ENTITY_FILTERS.map((f) => (
                        <Chip
                            key={f.value}
                            label={f.label}
                            size="small"
                            onClick={() => setTypeFilter(f.value as EntityType | 'all')}
                            color={typeFilter === f.value ? 'primary' : 'default'}
                            variant={typeFilter === f.value ? 'filled' : 'outlined'}
                            sx={{ cursor: 'pointer', fontWeight: typeFilter === f.value ? 700 : 400 }}
                        />
                    ))}
                </Stack>
                <Button
                    variant="outlined"
                    size="small"
                    sx={{ ml: 'auto', fontSize: '0.75rem' }}
                >
                    + New Record
                </Button>
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* Entity grid */}
            {filtered.length > 0 ? (
                <Grid container spacing={2}>
                    {filtered.map((record) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={record.id}>
                            <EntityCard record={record} onClick={() => {}} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                    <AccountTreeIcon sx={{ fontSize: '2.5rem', mb: 1, opacity: 0.4 }} />
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        No canonical records yet
                    </Typography>
                    <Typography variant="body2">
                        Approve memories from the Inbox to promote them into canonical knowledge.
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
