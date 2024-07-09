import React from 'react'
import Hero from '../blocks/Hero'
import ContactBar from '../blocks/ContactBar'
import MenuBar from '../blocks/MenuBar'
import Overview from '../blocks/Overview'
import Amenities from '../blocks/Amenities'
import Models from '../blocks/Models'
import Gallery from '../blocks/Gallery'
import Availability from '../blocks/Availability'
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
    case 'Overview':
      return <Overview {...block.props} />
    case 'Amenities':
      return <Amenities {...block.props} />
    case 'Models':
      return <Models {...block.props} />
    case 'Gallery':
      return <Gallery {...block.props} />
    case 'CommunityAvailability':
      return <Availability {...block.props} />
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
