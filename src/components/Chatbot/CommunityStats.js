import React from 'react'
import styles from './CommunityStats.module.scss'

export const CommunityStats = ({ community }) => {
  if (!community.rangeBed && !community.rangeBath && !community.rangeSqft) {
    return null
  }

  return (
    <div className={styles.root}>
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
  )
}
