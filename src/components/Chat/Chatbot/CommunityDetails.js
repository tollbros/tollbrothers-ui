import React from 'react'
import styles from './CommunityDetails.module.scss'
import { displayPricing } from './utils/pricing'

export const CommunityDetails = ({ community, hideLocation, utils = {} }) => {
  return (
    <p className={styles.root}>
      {community.homeTypes &&
        community.homeTypes.length > 0 &&
        !community.options?.some((option) => option.id === '112') && (
          <>
            {community.homeTypes
              .map((type) =>
                type.toLowerCase() === 'single family'
                  ? `Single-Family Homes`
                  : `${type}s`
              )
              .join(', ')}{' '}
          </>
        )}
      {`${
        utils.getPriceLabelText?.(community.isFuture, true) || ''
      } ${displayPricing(community.pricedFrom)}`}
      {!hideLocation && (
        <>
          {' in '} {community.city}, {community.state}
        </>
      )}
    </p>
  )
}
