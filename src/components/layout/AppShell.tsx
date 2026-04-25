import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router';
import SideNav from './SideNav';
import TopHeader from './TopHeader';

const AUTH_PATHS = ['/', '/login'];

export default function AppShell() {
    const location = useLocation();
    const isAuthPage = AUTH_PATHS.includes(location.pathname);

    if (isAuthPage) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                <Outlet />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
            <SideNav />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                <TopHeader />
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
