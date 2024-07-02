import { CssBaseline, ThemeProvider } from "@mui/material";
import { defaultTheme } from "../src/themes/default.theme";

export const withMuiTheme = (Story) => (
  <ThemeProvider theme={defaultTheme}>
    <CssBaseline />
    <Story />
  </ThemeProvider>
);

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
