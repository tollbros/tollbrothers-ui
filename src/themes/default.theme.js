import { createTheme } from '@mui/material'

export const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0070CD'
    },
    secondary: {
      main: '#0C223F'
    },
    error: {
      main: '#A31F34'
    },
    warning: {
      main: '#F9CA0C'
    },
    success: {
      main: '#009D47'
    },
    info: {
      main: '#0070CD'
    }
  },
  shape: {
    borderRadius: 0
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0
        }
      }
    }
  }
})
