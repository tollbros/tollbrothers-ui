import { createTheme } from '@mui/material'

const baseFontFamily = 'Gotham'
const altFontFamily = 'Gotham Narrow, sans-serif'
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
    fontFamily: baseFontFamily,
    h1: {
      fontFamily: domaineFontFamily,
      fontSize: '3rem',
      fontWeight: 600
    },
    h2: {
      fontFamily: domaineFontFamily,
      fontSize: '2.6rem',
      fontWeight: 600
    },
    h3: {
      fontFamily: domaineFontFamily,
      fontSize: '2.2rem',
      fontWeight: 600
    },
    h4: {
      fontFamily: domaineFontFamily,
      fontSize: '1.8rem',
      fontWeight: 600
    },
    h5: {
      fontFamily: domaineFontFamily,
      fontSize: '1.4rem',
      fontWeight: 600
    },
    h6: {
      fontFamily: domaineFontFamily,
      fontSize: '1rem',
      fontWeight: 600
    },
    subtitle1: {
      fontFamily: altFontFamily
    },
    subtitle2: {
      fontFamily: altFontFamily
    },
    caption: {
      fontFamily: altFontFamily,
      fontSize: '.85em'
    },
    overline: {
      fontFamily: baseFontFamily,
      fontSize: '12px',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '2px',
      lineHeight: '15px',
      color: '#8195a2'
    },
    button: {
      fontFamily: baseFontFamily,
      fontWeight: 600,
      textTransform: 'none'
    },
    body1: {
      fontFamily: baseFontFamily
    },
    body2: {
      fontFamily: baseFontFamily
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
        },
        text: {
          padding: 0
        }
      }
    }
  }
})
