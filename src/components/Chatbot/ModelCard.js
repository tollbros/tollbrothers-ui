import React from 'react'
import styles from './ModelCard.module.scss'
import { ActionButton } from './ActionButton'
import { displayPricing } from './utils/pricing'

const getPriceLabelText = (isQMI) => {
  const label = isQMI ? 'priced at' : 'starting at'

  return label
}

export const ModelCard = ({ model }) => {
  const headShotImage = model.headShot?.media?.url
  const desc = model?.description

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.imageContainer}>
          <img src={headShotImage} alt={model.name || 'Community'} />
        </div>
        <div className={styles.headerContent}>
          {model.name && <h3 className={styles.name}>{model.name}</h3>}

          {(model.minBed || model.minBath || model.minSqft) && (
            <div className={styles.stats}>
              {model.minBed && (
                <div className={styles.stat}>
                  <div className={styles.statValue}>{model.minBed}</div>
                  <div className={styles.statLabel}>Beds</div>
                </div>
              )}
              {model.minBath && (
                <div className={styles.stat}>
                  <div className={styles.statValue}>{model.minBath}</div>
                  <div className={styles.statLabel}>Baths</div>
                </div>
              )}
              {model.minSqft && (
                <div className={styles.stat}>
                  <div className={styles.statValue}>{model.minSqft}</div>
                  <div className={styles.statLabel}>Sq Ft</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.info}>
          {model.pricedFrom && (
            <p className={styles.price}>
              {model.homeType &&
                !model.options?.some((option) => option.id === '112') && (
                  <>{model.homeType} </>
                )}
              {`${getPriceLabelText(model.isQMI)} ${displayPricing(
                model.pricedFrom
              )}`}
            </p>
          )}
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
