import { createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'

const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#646cff' : '#535bf2',
      light: '#7c84ff',
      dark: '#4c54cc',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'dark' ? '#61dafb' : '#0891b2',
      light: '#8ee4fd',
      dark: '#0891b2',
      contrastText: mode === 'dark' ? '#0b1220' : '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
      paper: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : '#213547',
      secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    error: {
      main: '#ff4444',
      light: '#ff6666',
      dark: '#cc0000',
    },
    warning: {
      main: '#ffa500',
      light: '#ffb733',
      dark: '#ff8c00',
    },
    info: {
      main: mode === 'dark' ? '#61dafb' : '#0891b2',
    },
    success: {
      main: '#4caf50',
      light: '#66bb6a',
      dark: '#388e3c',
    },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    mode === 'dark'
      ? '0 2px 4px rgba(0,0,0,0.2)'
      : '0 2px 4px rgba(0,0,0,0.1)',
    mode === 'dark'
      ? '0 4px 8px rgba(0,0,0,0.3)'
      : '0 4px 8px rgba(0,0,0,0.1)',
    mode === 'dark'
      ? '0 8px 16px rgba(0,0,0,0.3)'
      : '0 8px 16px rgba(0,0,0,0.1)',
    mode === 'dark'
      ? '0 12px 24px rgba(0,0,0,0.4)'
      : '0 12px 24px rgba(0,0,0,0.15)',
    mode === 'dark'
      ? '0 16px 32px rgba(0,0,0,0.4)'
      : '0 16px 32px rgba(0,0,0,0.15)',
    mode === 'dark'
      ? '0 20px 40px rgba(0,0,0,0.5)'
      : '0 20px 40px rgba(0,0,0,0.2)',
    mode === 'dark'
      ? '0 24px 48px rgba(0,0,0,0.5)'
      : '0 24px 48px rgba(0,0,0,0.2)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          border: mode === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'dark'
              ? '0 8px 24px rgba(100, 108, 255, 0.3)'
              : '0 8px 24px rgba(100, 108, 255, 0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.5rem 1.5rem',
          fontWeight: 500,
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 4px 12px rgba(100, 108, 255, 0.4)'
              : '0 4px 12px rgba(100, 108, 255, 0.3)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.2s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'dark' ? '#646cff' : '#535bf2',
              },
            },
          },
        },
      },
    },
  },
})

export const createAppTheme = (mode: 'light' | 'dark') => {
  return createTheme(getThemeOptions(mode))
}
