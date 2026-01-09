import React from 'react'
import styles from './ProductLayout.module.scss'
import { ModelStats } from './ModelStats'
import { ModelPrice } from './ModelPrice'
import { QMICallout } from './QMICallout'

export const ProductLayout = ({ product, utils }) => {
  const headShotImage = product?.headShot?.media?.url
  const desc =
    product.overview?.shortDescription ||
    product.overview?.description ||
    product.description
  const bullets = product?.overview?.bulletPoints || product?.modelBullets
  const isModel = Boolean(product?.commPlanID)
  const isDesignReady =
    isModel && Boolean(product?.designReadyOptions?.length > 0)
  // const summaryBullets = product?.summary?.bullets || []

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        {product?.name && <h2 className={styles.title}>{product.name}</h2>}

        {headShotImage && (
          <div className={styles.imageWrapper}>
            <img
              src={headShotImage}
              alt={product.name || 'Community'}
              className={styles.image}
            />
          </div>
        )}
      </div>
      <div className={styles.content}>
        {isModel && <QMICallout model={product} utils={utils} />}
        {isModel && <ModelPrice model={product} utils={utils} />}
        {isModel && <ModelStats model={product} utils={utils} />}
        {isDesignReady && utils.DesignReadyTimeline && (
          <div
            className={styles.designReadyWrapper}
            id='design-ready-timeline-panel'
          >
            {React.createElement(utils.DesignReadyTimeline, {
              moveInDate: product.moveInDate,
              dates: product.designReadyOptions
            })}
          </div>
        )}
        {desc && <p className={styles.description}>{desc}</p>}

        {bullets?.length > 0 && (
          <div className={styles.summarySection}>
            <h3 className={styles.summaryTitle}>Summary</h3>
            <ul className={styles.summaryList}>
              {bullets.map((item, index) => (
                <li key={index} className={styles.bullet}>
                  {item?.text || item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
