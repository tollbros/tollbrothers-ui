import React from 'react'
import Hero from '../blocks/Hero'
import ContactBar from '../blocks/ContactBar'
import MenuBar from '../blocks/MenuBar'
import CommunityOverview from '../blocks/CommunityOverview'
import CommunityAmenities from '../blocks/CommunityAmenities'
import CommunityModels from '../blocks/CommunityModels'
import CommunityGallery from '../blocks/CommunityGallery'
import CommunityAvailability from '../blocks/CommunityAvailability'
import NeighborhoodMap from '../blocks/NeighborhoodMap'
import Financing from '../blocks/Financing'

const Block = ({ block }) => {
  switch (block.component) {
    case 'Hero':
      return <Hero {...block.props} />
    case 'ContactBar':
      return <ContactBar {...block.props} />
    case 'MenuBar':
      return <MenuBar {...block.props} />
    case 'CommunityOverview':
      return <CommunityOverview {...block.props} />
    case 'CommunityAmenities':
      return <CommunityAmenities {...block.props} />
    case 'CommunityModels':
      return <CommunityModels {...block.props} />
    case 'CommunityGallery':
      return <CommunityGallery {...block.props} />
    case 'CommunityAvailability':
      return <CommunityAvailability {...block.props} />
    case 'NeighborhoodMap':
      return <NeighborhoodMap {...block.props} />
    case 'Financing':
      return <Financing {...block.props} />
    default:
      return <div>Block {block.component} not found</div>
  }
}

const Blocks = ({ blocks }) => {
  return blocks.map((block, index) => {
    return <Block key={`block-${index}`} block={block} />
  })
}

export default Blocks
