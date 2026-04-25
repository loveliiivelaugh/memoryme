import type { Provider } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useSupabaseStore } from "@store/supabaseStore";
import { useNavigate } from "react-router";
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Alert,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@api/supabase";
import { appConfig } from "@utilities/config/appConfig";
// import { AppRouter } from '@components/routes/Router'
import { GitHub, Google } from "@mui/icons-material";
// import userJson from './user.json';

const Authenticated = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={24} />
    </Box>
  );
};

const redirectTo = appConfig.frontendOrigin;

const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const handleLogin = async (provider: Provider) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) setError(error.message);
    setLoading(false);
  };

  const { session, setSession }: any = useSupabaseStore();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, setSession]);

  useEffect(() => {
    if (session) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, session]);

  if (initializing) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!session) return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2.5,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 28%),
            radial-gradient(circle at bottom, rgba(255,255,255,0.04), transparent 24%),
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: 'auto, auto, 56px 56px, 56px 56px',
          opacity: 0.42,
          pointerEvents: 'none',
        }}
      />
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 6,
            p: { xs: 3, sm: 4 },
            bgcolor: 'rgba(10, 10, 10, 0.78)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(18px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
            position: 'relative',
          }}
        >
          <Stack spacing={3.5}>
            <Stack spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #ffffff 0%, #b7b7b7 100%)',
                  display: 'grid',
                  placeItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(255,255,255,0.12)',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,0.9) 8px 12px)',
                    clipPath: 'polygon(0 48%, 100% 100%, 0 100%)',
                  }}
                />
              </Box>
              <Stack spacing={1} alignItems="center">
                <Typography variant="h4" fontWeight={600} textAlign="center" sx={{ letterSpacing: '-0.03em' }}>
                  Log in to {appConfig.appName}
                </Typography>
                <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ maxWidth: 320 }}>
                  Your memory command center for operator chat, agent runs, canonical knowledge, and human approvals.
                </Typography>
              </Stack>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              fullWidth
              variant="contained"
              onClick={() => handleLogin('google')}
              disabled={loading}
              startIcon={<Google />}
              sx={{
                minHeight: 56,
                borderRadius: 999,
                fontSize: '1rem',
              }}
            >
              Continue with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleLogin('github')}
              disabled={loading}
              startIcon={<GitHub />}
              sx={{
                minHeight: 56,
                borderRadius: 999,
                fontSize: '1rem',
              }}
            >
              Continue with GitHub
            </Button>

            <Divider flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

            <Stack spacing={1} alignItems="center">
              <Typography variant="body2" textAlign="center" color="text.secondary">
                Secure OAuth sign-in. You’ll land in your dashboard automatically after authentication.
              </Typography>
              <Typography variant="caption" textAlign="center" color="text.secondary" sx={{ opacity: 0.8 }}>
                Need another provider? Add it in Supabase and this layout can extend without changing the auth flow.
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
  else return <Authenticated />
  // else return <AppRouter />
};

export default LoginPage;
