import { fn } from '@storybook/test'
import ButtonStickerSheet from './ButtonStickerSheet'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'primitives/Button',
  component: ButtonStickerSheet,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered'
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ['autodocs'],
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
  argTypes: {
    color: {
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning'],
      control: { type: 'radio' }
    },
    size: {
      options: ['small', 'medium', 'large'],
      control: { type: 'radio' }
    },
    variant: {
      options: ['contained', 'outlined', 'text'],
      control: { type: 'radio' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    disableElevation: {
      control: { type: 'boolean' }
    },
    fullWidth: {
      control: { type: 'boolean' }
    }
  }
}

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const StickerSheet = {
  args: {
    children: 'Button'
  }
}
