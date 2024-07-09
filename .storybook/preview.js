import 'styles/globals.scss';
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
