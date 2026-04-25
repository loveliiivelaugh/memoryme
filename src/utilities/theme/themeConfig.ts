import { alpha } from '@mui/material/styles';

const sharedTypography = {
  fontFamily: '"Avenir Next", "SF Pro Display", "IBM Plex Sans", "Segoe UI", sans-serif',
  h1: {
    fontWeight: 700,
    fontSize: '3rem',
    letterSpacing: '-0.05em',
  },
  h2: {
    fontWeight: 700,
    fontSize: '2.35rem',
    letterSpacing: '-0.045em',
  },
  h3: {
    fontWeight: 650,
    fontSize: '1.9rem',
    letterSpacing: '-0.04em',
  },
  h4: {
    fontWeight: 650,
    fontSize: '1.55rem',
    letterSpacing: '-0.03em',
  },
  h5: {
    fontWeight: 625,
    fontSize: '1.22rem',
    letterSpacing: '-0.02em',
  },
  h6: {
    fontWeight: 625,
    fontSize: '1rem',
    letterSpacing: '-0.015em',
  },
  subtitle1: {
    fontWeight: 500,
    fontSize: '0.98rem',
  },
  body1: {
    fontSize: '0.98rem',
    lineHeight: 1.65,
  },
  body2: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
};

const darkBorder = alpha('#ffffff', 0.12);
const lightBorder = alpha('#111111', 0.08);

const themeConfig = {
  light: {
    palette: {
      mode: 'light',
      background: {
        default: '#f6f5f2',
        paper: '#ffffff',
      },
      primary: {
        main: '#111111',
        light: '#2a2a2a',
        dark: '#000000',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#6e6e73',
        contrastText: '#111111',
      },
      success: {
        main: '#1e9a57',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#b7791f',
        contrastText: '#ffffff',
      },
      error: {
        main: '#d14343',
        contrastText: '#ffffff',
      },
      info: {
        main: '#111111',
        contrastText: '#ffffff',
      },
      text: {
        primary: '#111111',
        secondary: '#5f6368',
        disabled: '#9ca3af',
      },
      divider: lightBorder,
      action: {
        active: '#111111',
        hover: alpha('#111111', 0.04),
        selected: alpha('#111111', 0.07),
        disabled: '#9ca3af',
        disabledBackground: alpha('#111111', 0.06),
      },
    },
  },
  dark: {
    palette: {
      mode: 'dark',
      background: {
        default: '#0a0a0b',
        paper: '#141416',
      },
      primary: {
        main: '#f5f5f2',
        light: '#ffffff',
        dark: '#ddddda',
        contrastText: '#0a0a0b',
      },
      secondary: {
        main: '#b7b7bc',
        contrastText: '#0a0a0b',
      },
      success: {
        main: '#63d297',
        contrastText: '#050505',
      },
      warning: {
        main: '#f1c06a',
        contrastText: '#050505',
      },
      error: {
        main: '#ff7b72',
        contrastText: '#050505',
      },
      info: {
        main: '#f5f5f2',
        contrastText: '#0a0a0b',
      },
      text: {
        primary: '#f5f5f2',
        secondary: '#c4c4c8',
        disabled: '#8a8a91',
      },
      divider: darkBorder,
      action: {
        active: '#f5f5f2',
        hover: alpha('#ffffff', 0.07),
        selected: alpha('#ffffff', 0.11),
        disabled: '#8a8a91',
        disabledBackground: alpha('#ffffff', 0.08),
      },
    },
  },
  common: {
    shape: {
      borderRadius: 10,
    },
    typography: sharedTypography,
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1200,
        xl: 1920,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme: any) => ({
          ':root': {
            colorScheme: theme.palette.mode,
          },
          html: {
            width: '100%',
            minHeight: '100%',
            backgroundColor: theme.palette.background.default,
          },
          body: {
            width: '100%',
            minHeight: '100vh',
            margin: 0,
            backgroundColor: theme.palette.background.default,
            backgroundImage: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 28%)'
              : 'radial-gradient(circle at top, rgba(17,17,17,0.035), transparent 24%)',
          },
          '#root': {
            minHeight: '100vh',
            width: '100%',
          },
          '::selection': {
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.16)'
              : 'rgba(17,17,17,0.12)',
          },
        }),
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }: any) => ({
            backgroundImage: 'none',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 20px 60px rgba(0,0,0,0.28)'
              : '0 20px 60px rgba(15,23,42,0.08)',
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }: any) => ({
            backgroundImage: 'none',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
          }),
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: ({ theme }: any) => ({
            borderRadius: 10,
            minHeight: 40,
            paddingInline: 16,
          }),
          contained: ({ theme }: any) => ({
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
            },
          }),
          outlined: ({ theme }: any) => ({
            borderColor: theme.palette.divider,
            backgroundColor: theme.palette.mode === 'dark' ? alpha('#ffffff', 0.04) : '#ffffff',
            '&:hover': {
              borderColor: theme.palette.text.secondary,
              backgroundColor: theme.palette.mode === 'dark' ? alpha('#ffffff', 0.07) : alpha('#111111', 0.02),
            },
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: ({ theme }: any) => ({
            borderRadius: 999,
            fontWeight: 600,
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }: any) => ({
            borderRadius: 14,
            backgroundColor: theme.palette.mode === 'dark' ? alpha('#ffffff', 0.02) : alpha('#111111', 0.015),
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.divider,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.text.secondary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
            },
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }: any) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            overflow: 'hidden',
            height: 6,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }: any) => ({
            borderRadius: 10,
            backgroundColor: theme.palette.mode === 'dark' ? '#111111' : '#1f1f1f',
            color: '#ffffff',
          }),
        },
      },
    },
  },
};

export { themeConfig };
