import MenuBar from './MenuBar'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'blocks/MenuBar',
  component: MenuBar,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen'
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    img: 'https://cdn.tollbrothers.com/communities/masters/768/images-resized/Sterling_Grove_Clubhouse_Pool_2352_conversion1_920.jpg',
    logo: 'https://cdn.tollbrothers.com/communities/masters/768/logos/sterling_grove_mc_logo.svg',
    title: 'Sterling Grove',
    location: 'Surprise, AZ',
    county: 'Maricopa County',
    startingPrice: '$6,329,995',
    homeTypes: ['Single Family', 'Condo']
  },
  argTypes: {}
}

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {
  args: {}
}
