import React from 'react'
import styles from './CollectionCard.module.scss'
import { CommunityStats } from './CommunityStats'
import { CommunityPrice } from './CommunityPrice'
import { OptionButton } from './OptionButton'
import { ProductsList } from './ProductsList'

export const CollectionCard = ({
  collection,
  handleProductSelect = () => null,
  utils = {}
}) => {
  const [showHomeTypes, setShowHomeTypes] = React.useState([])
  let name = collection?.cleanName
  if (name && !name.toLowerCase().includes(' collection')) {
    name = `${name} Collection`
  }
  const desc =
    collection.overview?.shortDescription || collection.overview?.description
  const homeDesigns = collection.homes?.models
  const homes = collection.homes?.models.filter((home) =>
    Boolean(home.communityId)
  )
  const qmis = []

  homeDesigns.map((home) => {
    if (home.qmis) {
      home.qmis.map((theQMI) => {
        qmis.push(theQMI)
      })
    }
  })

  return (
    <div className={styles.root}>
      {collection.cleanName && <h3 className={styles.name}>{name}</h3>}
      <CommunityPrice community={collection} utils={utils} />
      <CommunityStats community={collection} />

      {desc && <p className={styles.desc}>{desc}</p>}

      {showHomeTypes.map((homeType) => {
        const products = homeType === 'qmi' ? qmis : homes
        return (
          <div key={homeType} className={styles.homesContainer}>
            <ProductsList
              products={products}
              handleProductSelect={handleProductSelect}
              utils={utils}
            />
          </div>
        )
      })}

      <div className={styles.actionButtonWrapper}>
        {!showHomeTypes.includes('qmi') && qmis?.length > 0 && (
          <OptionButton
            onClick={() => setShowHomeTypes((prev) => [...prev, 'qmi'])}
            text='Show Quick Move-In Homes'
          />
        )}
        {!showHomeTypes.includes('homeDesigns') && homes?.length > 0 && (
          <OptionButton
            onClick={() => setShowHomeTypes((prev) => [...prev, 'homeDesigns'])}
            text='Show Home Designs'
          />
        )}
      </div>
    </div>
  )
}
