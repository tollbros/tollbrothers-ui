import React from 'react'
import styles from './ProductsList.module.scss'
import { CommunityCard } from './CommunityCard'
import { ModelCard } from './ModelCard'
import { HorizontalScroller } from '../HorizontalScroller'

export const ProductsList = ({ products, utils }) => {
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
        {products.map((product, index) =>
          product.commPlanID ? (
            <ModelCard
              key={product.commPlanID || index}
              model={product}
              utils={utils}
            />
          ) : (
            <CommunityCard
              key={product.communityId || product.masterCommunityId || index}
              community={product}
              utils={utils}
            />
          )
        )}
      </HorizontalScroller>
    </div>
  )
}
