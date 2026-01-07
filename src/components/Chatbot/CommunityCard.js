import React from 'react'
import styles from './CommunityCard.module.scss'
import { ActionButton } from './ActionButton'

const displayPricing = (priceData) => {
  const pricedFrom = priceData || 0
  const pricedFromFormatted = pricedFrom.toLocaleString('en-US')

  if (
    !pricedFromFormatted ||
    pricedFromFormatted === '0' ||
    pricedFromFormatted === 'null' ||
    priceData === 999999999999
  ) {
    return null // no breaking space
  }

  let moneySign = '$'

  if (Number.isNaN(parseInt(pricedFromFormatted))) {
    moneySign = ''
  }

  return `${moneySign}${pricedFromFormatted}`
}

const getPriceLabelText = (isFuture, toLowerCase) => {
  let label = isFuture ? 'anticipated from' : 'starting at'

  if (toLowerCase) {
    label = label.toLowerCase()
  }

  return label
}

export const CommunityCard = ({ community }) => {
  const headShotImage = community.headShot?.media?.url
  const desc =
    community.overview?.shortDescription || community.overview?.description

  return (
    <div className={styles.communityCard}>
      {headShotImage && (
        <div className={styles.communityImage}>
          <img src={headShotImage} alt={community.name || 'Community'} />
        </div>
      )}
      <div className={styles.communityContent}>
        <div className={styles.communityHeader}>
          {community.name && (
            <h3 className={styles.communityName}>{community.name}</h3>
          )}
        </div>

        {(community.rangeBed || community.rangeBath || community.sqft) && (
          <div className={styles.communityStats}>
            {community.rangeBed && (
              <div className={styles.stat}>
                <div className={styles.statValue}>{community.rangeBed}</div>
                <div className={styles.statLabel}>Beds</div>
              </div>
            )}
            {community.rangeBath && (
              <div className={styles.stat}>
                <div className={styles.statValue}>{community.rangeBath}</div>
                <div className={styles.statLabel}>Baths</div>
              </div>
            )}
            {community.rangeSqft && (
              <div className={styles.stat}>
                <div className={styles.statValue}>{community.rangeSqft}</div>
                <div className={styles.statLabel}>Square Feet</div>
              </div>
            )}
          </div>
        )}

        <div className={styles.communityInfo}>
          {community.pricedFrom && (
            <p className={styles.communityPrice}>
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
              {`${getPriceLabelText(community.isFuture)} ${displayPricing(
                community.pricedFrom
              )}`}
            </p>
          )}
          {desc && <p className={styles.communityDescription}>{desc}</p>}
        </div>

        {community.url && (
          <div className={styles.actionButtonWrapper}>
            <ActionButton onClick={() => null}>Tell Me More</ActionButton>
          </div>
        )}
      </div>
    </div>
  )
}
