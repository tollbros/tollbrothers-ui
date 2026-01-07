import React from 'react'
import styles from './ProductsList.module.scss'
import { CommunityCard } from './CommunityCard'
import { HorizontalScroller } from '../HorizontalScroller'

export const ProductsList = ({ products }) => {
  if (!products || products.length === 0) {
    return null
  }

  console.log(products)

  return (
    <div className={styles.productsContainer}>
      <HorizontalScroller
        showArrows
        useContainerWidth
        classes={{
          scrollWrap: styles.scrollWrap,
          scrollItem: styles.scrollItem,
          controls: styles.controls
        }}
      >
        {products.map((product, index) => (
          <CommunityCard
            key={product.communityId || index}
            community={product}
          />
        ))}
      </HorizontalScroller>
    </div>
  )
}
