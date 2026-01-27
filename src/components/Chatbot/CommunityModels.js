import React from 'react'
import styles from './CommunityModels.module.scss'
import { OptionButton } from './OptionButton'
import { ProductsList } from './ProductsList'

export const CommunityModels = ({
  communityQMIs,
  communityModels,
  handleProductSelect,
  utils
}) => {
  const [showHomeTypes, setShowHomeTypes] = React.useState([])

  return (
    <>
      {showHomeTypes.map((homeType) => {
        const products = homeType === 'qmi' ? communityQMIs : communityModels
        return (
          <div key={homeType} className={styles.homesContainer}>
            <ProductsList
              products={products}
              handleProductSelect={handleProductSelect}
              utils={utils}
              hideModelLocation
            />
          </div>
        )
      })}

      <div className={styles.actionButtonsWrapper}>
        {!showHomeTypes.includes('qmi') && communityQMIs?.length > 0 && (
          <OptionButton
            onClick={() => setShowHomeTypes((prev) => [...prev, 'qmi'])}
            text='Show Quick Move-In Homes'
          />
        )}
        {!showHomeTypes.includes('homeDesigns') &&
          communityModels?.length > 0 && (
            <OptionButton
              onClick={() =>
                setShowHomeTypes((prev) => [...prev, 'homeDesigns'])
              }
              text='Show Home Designs'
            />
          )}
      </div>
    </>
  )
}
