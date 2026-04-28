import React from 'react'
import styles from './CommunityCard.module.scss'
import { ActionButton } from './ActionButton'
import { CommunityStats } from './CommunityStats'
import { CommunityDetails } from './CommunityDetails'
import { ConditionalLink } from './ConditionalLink'
import { getProductHeroImage } from './utils/getProductHeroImage'

export const CommunityCard = ({ community, onClick = () => null, utils = {} }) => {
  const headShotImage = getProductHeroImage(community)
  const desc = community.overview?.shortDescription || community.overview?.description
  const isActiveAdult = community?.communityTypes?.some((type) => type.toLowerCase() === 'active adult')

  return (
    <div className={styles.root}>
      {headShotImage && (
        <div className={styles.communityImage}>
          <img src={headShotImage} alt={community.name || 'Community'} />
          {isActiveAdult && <span className={styles.activeAdultBadge}>&nbsp; 55+</span>}
        </div>
      )}
      <div className={styles.communityContent}>
        <div className={styles.communityHeader}>
          {community.name && (
            <ConditionalLink href={community.url} utils={utils}>
              <h3 className={styles.communityName}>{community.name}</h3>
            </ConditionalLink>
          )}
        </div>
        <CommunityStats community={community} />
        <div className={styles.info}>
          <CommunityDetails community={community} utils={utils} />
          {desc && <p className={styles.communityDescription}>{desc}</p>}
        </div>

        <div className={styles.actionButtonWrapper}>
          <ActionButton onClick={() => onClick(community)}>Learn More</ActionButton>
        </div>
      </div>
    </div>
  )
}
