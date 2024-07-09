import { fn } from '@storybook/test'
import Chip from './Chip'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'primitives/Chip',
  component: Chip,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered'
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
  argTypes: {
    label: {
      control: { type: 'text' }
    },
    color: {
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning'],
      control: { type: 'radio' }
    },
    size: {
      options: ['small', 'medium'],
      control: { type: 'radio' }
    },
    variant: {
      options: ['contained', 'outlined'],
      control: { type: 'radio' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
}

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary = {
  args: {
    label: 'Chip'
  }
}

export const Secondary = {
  args: {
    color: 'secondary',
    label: 'Chip'
  }
}

export const Medium = {
  args: {
    size: 'medium',
    label: 'Chip'
  }
}

export const Small = {
  args: {
    size: 'small',
    label: 'Chip'
  }
}
