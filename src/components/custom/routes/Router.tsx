import { Box, Typography } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Providers from '@components/custom/providers/Providers';
import AppShell from '@components/layout/AppShell';
import LoginPage from '@components/Auth/AuthPage';
import IntegrationsPage, { IntegrationsGrid } from '@components/pages/IntegrationsPage';
import InboxPage from '@components/pages/InboxPage';
import DashboardPage from '@components/pages/DashboardPage';
import KnowledgePage from '@components/pages/KnowledgePage';
import AgentOpsPage from '@components/pages/AgentOpsPage';
import MemoryOverviewPage from '@components/pages/MemoryOverviewPage';
import { ProfileContent } from '@components/pages/SettingsPage';
import CommandCenterPage from '@components/pages/CommandCenterPage';

const routes = [
  {
    label: 'Home',
    path: '/',
    element: <LoginPage />,
  },
  {
    label: 'Login',
    path: '/login',
    element: <LoginPage />,
  },
  {
    label: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    label: 'Command Center',
    path: '/command-center',
    element: <CommandCenterPage />,
  },
  {
    label: 'Inbox',
    path: '/inbox',
    element: <InboxPage />,
  },
  {
    label: 'Knowledge',
    path: '/knowledge',
    element: <KnowledgePage />,
  },
  {
    label: 'Agent Ops',
    path: '/agent-ops',
    element: <AgentOpsPage />,
  },
  {
    label: 'Memory',
    path: '/memory',
    element: <MemoryOverviewPage />,
  },
  {
    label: 'Memory Detail',
    path: '/memory/:id',
    element: <MemoryOverviewPage />,
  },
  {
    label: 'Integrations',
    path: '/integrations',
    element: (
      <>
        <Box sx={{ p: 2 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Connect your tools
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Connect your tools to Memory.me to automatically save your memories from other apps.
          </Typography>
        </Box>
        <IntegrationsGrid />
      </>
    ),
  },
  {
    label: 'Settings',
    path: '/settings',
    element: (
      <ProfileContent
        profile={{
          id: '1',
          name: 'Michael Woodward',
          email: 'michael@woodward-studio.com',
          avatar_url: 'https://i.pravatar.cc/150?u=1',
          stripe_tier: 'free',
        }}
        setProfile={() => {}}
      />
    ),
  },
  {
    label: 'Auth Callback',
    path: '/auth/callback/:service',
    element: <IntegrationsPage />,
  },
];

function Layout() {
  return (
    <Providers>
      {() => <AppShell />}
    </Providers>
  );
}

export function AppRouter() {
  const appRouter = createBrowserRouter([
    {
      path: '/',
      id: 'root',
      element: <Layout />,
      children: routes,
    },
  ]);

  return <RouterProvider router={appRouter} />;
}
