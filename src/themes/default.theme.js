import { createTheme } from '@mui/material'

// const base_font_family = 'Gotham, sans-serif'
// const alt_font_family = 'Gotham Narrow, sans-serif'
// const alt_light_font_family = 'GothamSSm-ExtraLight, sans-serif'
const domaineFontFamily = 'Domaine'

export const defaultTheme = createTheme({
  MuiCssBaseline: {
    styleOverrides: `
        @import "https://use.typekit.net/loo0pmd.css";

        @font-face {
          font-family: 'Domaine';
          src: local('domaine-bold'), url('https://cdn.tollbrothers.com/fonts/domaine/domaine-bold.woff2') format('woff2'),
            url('https://cdn.tollbrothers.com/fonts/domaine/domaine-bold.woff') format('woff');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'Domaine';
          src: local('domaine-semibold'), url('https://cdn.tollbrothers.com/fonts/domaine/domaine-display-web-semibold.woff2') format('woff2'),
            url('https://cdn.tollbrothers.com/fonts/domaine/domaine-display-web-semibold.woff') format('woff');
          font-weight: 300;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "Gotham Narrow";
          src: local("GothamNarrSSm-Light"),
            url("https://cdn.tollbrothers.com/fonts/gotham/woff2/GothamNarrSSm-Light_Web.woff2") format("woff2"),
            url("https://cdn.tollbrothers.com/fonts/gotham/woff/GothamNarrSSm-Light_Web.woff") format("woff");
          font-weight: 200 400;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "Gotham Narrow";
          src: local("GothamNarrSSm-Medium"),
            url("https://cdn.tollbrothers.com/fonts/gotham/woff2/GothamNarrSSm-Medium_Web.woff2") format("woff2"),
            url("https://cdn.tollbrothers.com/fonts/gotham/woff/GothamNarrSSm-Medium_Web.woff") format("woff");
          font-weight: 500, 600;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: Gotham;
          src: local("GothamSSm-Book"),
            url("https://cdn.tollbrothers.com/fonts/gotham/woff2/GothamSSm-Book_Web.woff2") format("woff2"),
            url("https://cdn.tollbrothers.com/fonts/gotham/woff/GothamSSm-Book_Web.woff") format("woff");
          font-weight: 200 400;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: Gotham;
          src: local("GothamNarrSSm-Medium"),
            url("https://cdn.tollbrothers.com/fonts/gotham/woff2/GothamSSm-Bold_Web.woff2") format("woff2"),
            url("https://cdn.tollbrothers.com/fonts/gotham/woff/GothamSSm-Bold_Web.woff") format("woff");
          font-weight: 500;
          font-style: normal;
          font-display: swap;
        }
      `
  },
  typography: {
    h3: {
      fontFamily: domaineFontFamily,
      fontSize: '1.8rem',
      fontWeight: 600
    }
  },
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
    },
    background: {
      grey: '#f6f6f6'
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
