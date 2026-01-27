import React from 'react'
import styles from './CollectionCard.module.scss'
import { CommunityStats } from './CommunityStats'
import { CommunityDetails } from './CommunityDetails'
import { CommunityModels } from './CommunityModels'

export const CollectionCard = ({
  collection,
  handleProductSelect = () => null,
  utils = {}
}) => {
  let name = collection?.cleanName
  if (name && !name.toLowerCase().includes(' collection')) {
    name = `${name} Collection`
  }
  const desc =
    collection.overview?.shortDescription || collection.overview?.description
  const { communityModels, communityQMIs } = utils?.buildHomeArrays?.(
    collection?.homes,
    collection.options
  )

  return (
    <div className={styles.root}>
      {collection.cleanName && <h3 className={styles.name}>{name}</h3>}
      <CommunityDetails community={collection} utils={utils} hideLocation />
      <CommunityStats community={collection} />

      {desc && <p className={styles.desc}>{desc}</p>}

      <CommunityModels
        communityQMIs={communityQMIs}
        communityModels={communityModels}
        handleProductSelect={handleProductSelect}
        utils={utils}
      />
    </div>
  )
}
