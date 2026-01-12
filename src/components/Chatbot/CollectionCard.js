import React from 'react'
import styles from './CollectionCard.module.scss'
import { CommunityStats } from './CommunityStats'
import { CommunityPrice } from './CommunityPrice'

export const CollectionCard = ({
  collection,
  onClick = () => null,
  utils = {}
}) => {
  let name = collection?.cleanName
  if (name && !name.toLowerCase().includes(' collection')) {
    name = `${name} Collection`
  }
  const desc =
    collection.overview?.shortDescription || collection.overview?.description

  return (
    <div className={styles.root}>
      {collection.cleanName && <h3 className={styles.name}>{name}</h3>}
      <CommunityPrice community={collection} utils={utils} />
      <CommunityStats community={collection} />

      {desc && <p className={styles.desc}>{desc}</p>}

      <div className={styles.actionButtonWrapper}>
        {/* <ActionButton onClick={() => onClick(collection)}>
            Tell Me More
          </ActionButton> */}
      </div>
    </div>
  )
}
