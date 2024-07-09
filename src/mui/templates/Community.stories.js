import Community from './Community'
import heroMockData from '../blocks/Hero.mockData'
import overviewMockData from '../blocks/Overview.mockData'
import contactBarMockData from '../blocks/ContactBar.mockData'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'templates/Community',
  component: Community,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen'
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    blocks: [
      {
        component: 'Hero',
        props: heroMockData
      },
      {
        component: 'ContactBar',
        props: contactBarMockData
      },
      {
        component: 'MenuBar'
      },
      {
        component: 'Overview',
        props: overviewMockData
      },
      {
        component: 'Amenities'
      },
      {
        component: 'Models'
      },
      {
        component: 'Gallery'
      },
      {
        component: 'Availability'
      },
      {
        component: 'NeighborhoodMap'
      },
      {
        component: 'Financing'
      }
    ]
  },
  argTypes: {}
}

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {
  args: {}
}
