import React from 'react'
import styles from './ModelCard.module.scss'
import { ActionButton } from './ActionButton'
import { displayPricing } from './utils/pricing'

const getQmiDateLabelText = ({ date, isComingSoon, utils }) => {
  let text = ''
  if (utils?.isMoveInReady?.(date)) {
    text = 'Move-In Ready'
  } else if (isComingSoon) {
    text = 'Coming Soon Quick Move-In'
  } else {
    text = `Quick Move-In ${utils?.getFormattedDate?.(date, utils)}`
  }

  return text
}

const getPriceLabelText = (isQMI) => {
  const label = isQMI ? 'priced at' : 'starting at'

  return label
}

export const ModelCard = ({ model, utils = {} }) => {
  const headShotImage = model.headShot?.media?.url
  const desc = model?.description

  const { rangeBed, rangeBath, rangeSqft } = utils.getModelRanges?.(model)

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.imageContainer}>
          <img src={headShotImage} alt={model.name || 'Community'} />
        </div>
        <div className={styles.headerContent}>
          {model.name && <h3 className={styles.name}>{model.name}</h3>}

          <div className={styles.stats}>
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
                {rangeSqft}
                {utils.getModelSqftPlusSign?.(model, false)}
              </div>
              <div className={styles.statLabel}>Sq Ft</div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.info}>
          <p className={styles.price}>
            {model.isQMI && (
              <>
                {getQmiDateLabelText({
                  date: model.moveInDate,
                  isComingSoon: model.isComingSoon,
                  utils: utils
                })}{' '}
                &bull;{' '}
              </>
            )}

            {model.homeType &&
              !model.options?.some((option) => option.id === '112') && (
                <>{model.homeType} </>
              )}
            {model.pricedFrom &&
              `${getPriceLabelText(model.isQMI)} ${displayPricing(
                model.pricedFrom
              )}`}
          </p>

          {desc && <p className={styles.description}>{desc}</p>}
        </div>

        {model.url && (
          <div className={styles.actionButtonWrapper}>
            <ActionButton onClick={() => null}>Tell Me More</ActionButton>
          </div>
        )}
      </div>
    </div>
  )
}
