import { CssBaseline, ThemeProvider } from "@mui/material";
import { defaultTheme } from "../src/themes/default.theme";

export const withMuiTheme = (Story) => {
  return (<ThemeProvider theme={defaultTheme}>
    <CssBaseline />
    <style>
      {defaultTheme?.MuiCssBaseline?.styleOverrides}
    </style>
    <Story />
  </ThemeProvider>)
};

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        date: /Date$/i
      }
    }
  }
}

export default preview

export const decorators = [withMuiTheme];
