import { Box, Typography, InputBase, IconButton, Avatar, Tooltip, Breadcrumbs } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useLocation, Link } from 'react-router';
import { useSupabaseStore } from '@store/supabaseStore';

const pageLabels: Record<string, string> = {
    '/command-center': 'Command Center',
    '/inbox': 'Global Inbox',
    '/dashboard': 'Dashboard',
    '/knowledge': 'Knowledge Graph',
    '/agent-ops': 'Agent Ops',
    '/settings': 'Settings',
    '/memory': 'Memory Detail',
    '/integrations': 'Integrations',
};

export default function TopHeader() {
    const location = useLocation();
    const supabaseStore = useSupabaseStore();
    const currentLabel = pageLabels[location.pathname] ?? 'Dashboard';
    const userEmail = supabaseStore?.session?.user?.email;
    const avatarLetter = userEmail ? userEmail[0].toUpperCase() : 'U';

    return (
        <Box
            sx={{
                height: 56,
                minHeight: 56,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                px: 2.5,
                gap: 2,
            }}
        >
            {/* Breadcrumb */}
            <Breadcrumbs
                separator="/"
                sx={{
                    flexShrink: 0,
                    '& .MuiBreadcrumbs-separator': { color: 'text.secondary', mx: 0.75 },
                }}
            >
                <Typography
                    variant="body2"
                    component={Link}
                    to="/dashboard"
                    sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'text.primary' } }}
                >
                    MemoryMe
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {currentLabel}
                </Typography>
            </Breadcrumbs>

            {/* Command search bar */}
            <Box
                sx={{
                    flex: 1,
                    maxWidth: 520,
                    mx: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.5,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    cursor: 'text',
                    transition: 'border-color 0.15s ease',
                    '&:hover': { borderColor: 'primary.main' },
                    '&:focus-within': { borderColor: 'primary.main' },
                }}
            >
                <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary', flexShrink: 0 }} />
                <InputBase
                    placeholder="Search memories, runs, agents, commands..."
                    fullWidth
                    sx={{
                        fontSize: '0.85rem',
                        color: 'text.secondary',
                        '& input': { p: 0 },
                    }}
                />
            </Box>

            {/* Right icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                <Tooltip title="Notifications">
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <NotificationsNoneIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Help">
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title={userEmail ?? 'Profile'}>
                    <Avatar
                        sx={{
                            width: 28,
                            height: 28,
                            bgcolor: 'primary.dark',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                        }}
                    >
                        {avatarLetter}
                    </Avatar>
                </Tooltip>
            </Box>
        </Box>
    );
}
