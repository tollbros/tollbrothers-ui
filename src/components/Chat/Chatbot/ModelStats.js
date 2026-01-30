import React from 'react'
import styles from './ModelStats.module.scss'

export const ModelStats = ({ model, isCompact, utils = {} }) => {
  const { rangeBed, rangeBath, rangeSqft, rangeHalfBath, rangeGarage } =
    utils.getModelRanges?.(model) || {}
  const sqftPlusSign = utils.getModelSqftPlusSign?.(model, false)
  const hasParkingFlag = utils.hasOption?.(
    model?.options,
    utils.OPTIONS?.PARKING_SPACES
  )

  return (
    <div className={`${styles.stats} ${isCompact ? styles.compact : ''}`}>
      <div className={styles.stat}>
        <div className={styles.statValue}>{rangeBed || 0}</div>
        <div className={styles.statLabel}>Beds</div>
      </div>

      <div className={styles.stat}>
        <div className={styles.statValue}>{rangeBath || 0}</div>
        <div className={styles.statLabel}>Baths</div>
      </div>

      <div className={styles.stat}>
        <div className={styles.statValue}>
          {rangeSqft || <>&nbsp;</>}
          {sqftPlusSign}
        </div>
        <div className={styles.statLabel}>Sq Ft</div>

        {!isCompact && <div className={styles.statDivider} />}
      </div>
      {!isCompact && (
        <>
          <div className={styles.stat}>
            <div className={styles.statValue}>{rangeHalfBath || 0}</div>
            <div className={styles.statLabel}>Half Bath</div>
          </div>

          <div className={styles.stat}>
            <div className={styles.statValue}>{rangeGarage || 0}</div>
            <div className={styles.statLabel}>
              {hasParkingFlag ? 'Parking Spaces' : 'Garages'}
            </div>
          </div>

          <div className={styles.stat}>
            <div className={styles.statValue}>{parseInt(model.stories)}</div>
            <div className={styles.statLabel}>Stories</div>
          </div>
        </>
      )}
    </div>
  )
}
