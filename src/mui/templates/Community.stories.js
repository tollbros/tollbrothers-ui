import Community from './Community'

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
        props: {
          img: 'https://cdn.tollbrothers.com/communities/masters/768/images-resized/Sterling_Grove_Clubhouse_Pool_2352_conversion1_920.jpg',
          logo: 'https://cdn.tollbrothers.com/communities/masters/768/logos/sterling_grove_mc_logo.svg',
          title: 'Sterling Grove',
          location: 'Surprise, AZ',
          county: 'Maricopa County',
          startingPrice: '$6,329,995',
          homeTypes: ['Single Family', 'Condo']
        }
      },
      {
        component: 'ContactBar',
        props: {
          primaryContactImage:
            'https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/osc_icon_with_bubble.svg',
          primaryContactTitle: 'Online Sales Team',
          primaryContacts: 'Dawn G. & Melissa M.',
          primaryPhone: '844-836-5263',
          salesImage:
            'https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/sales_icon_with_bubble.svg',
          salesTitle: 'Sales Center',
          salesStreet: '11612 N Greenwich Blvd',
          salesLocation: 'Surprise, AZ 85388'
        }
      },
      {
        component: 'MenuBar'
      },
      {
        component: 'CommunityOverview'
      },
      {
        component: 'CommunityAmenities'
      },
      {
        component: 'CommunityModels'
      },
      {
        component: 'CommunityGallery'
      },
      {
        component: 'CommunityAvailability'
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
