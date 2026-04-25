import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import { useLocation, useNavigate } from 'react-router';
import { useUtilityStore } from '@store/index';
import { ThemeToggleButton } from '@theme/ThemeProvider';

const SIDEBAR_WIDTH = 240;

const navItems = [
    { label: 'Command Center', icon: <DashboardCustomizeIcon fontSize="small" />, path: '/command-center' },
    { label: 'Dashboard', icon: <InboxIcon fontSize="small" />, path: '/dashboard' },
    { label: 'Inbox', icon: <InboxIcon fontSize="small" />, path: '/inbox' },
    { label: 'Knowledge Graph', icon: <AccountTreeIcon fontSize="small" />, path: '/knowledge' },
    { label: 'Agent Ops', icon: <MonitorHeartIcon fontSize="small" />, path: '/agent-ops' },
    { label: 'Settings', icon: <SettingsIcon fontSize="small" />, path: '/settings' },
];

export default function SideNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const utilityStore = useUtilityStore();

    const handleNewMemory = () => {
        utilityStore.setModal({
            open: true,
            title: 'New Run',
            content: (
                <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Task/run creation from the command center is coming soon.
                    </Typography>
                </Box>
            ),
        });
    };

    return (
        <Box
            sx={{
                width: SIDEBAR_WIDTH,
                minWidth: SIDEBAR_WIDTH,
                height: '100vh',
                bgcolor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 10,
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    px: 2.5,
                    py: 2.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                }}
                onClick={() => navigate('/command-center')}
            >
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <Typography sx={{ color: '#0d1117', fontWeight: 800, fontSize: '1.1rem' }}>M</Typography>
                </Box>
                <Box>
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}
                    >
                        MemoryMe
                    </Typography>
                    <Typography
                        sx={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: 'text.secondary', textTransform: 'uppercase' }}
                    >
                        Precision OS
                    </Typography>
                </Box>
            </Box>

            {/* Nav Items */}
            <Box sx={{ flex: 1, py: 1.5 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Box
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                px: 2.5,
                                py: 1.25,
                                cursor: 'pointer',
                                position: 'relative',
                                borderLeft: isActive ? '2px solid' : '2px solid transparent',
                                borderColor: isActive ? 'primary.main' : 'transparent',
                                bgcolor: isActive ? 'action.selected' : 'transparent',
                                color: isActive ? 'text.primary' : 'text.secondary',
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    color: 'text.primary',
                                },
                            }}
                        >
                            <Box sx={{ color: isActive ? 'primary.main' : 'inherit', display: 'flex' }}>
                                {item.icon}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: isActive ? 600 : 400 }}>
                                {item.label}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Bottom section */}
            <Box
                sx={{
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <ThemeToggleButton />
                </Box>
                <Box
                    onClick={handleNewMemory}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        py: 1.25,
                        px: 2,
                        bgcolor: 'primary.main',
                        color: '#0d1117',
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        transition: 'opacity 0.15s ease',
                        '&:hover': { opacity: 0.88 },
                    }}
                >
                    <AddIcon fontSize="small" />
                    New Run
                </Box>
            </Box>
        </Box>
    );
}

export { SIDEBAR_WIDTH };
