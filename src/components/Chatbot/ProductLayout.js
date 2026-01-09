import React from 'react'
import styles from './ProductLayout.module.scss'

export const ProductLayout = ({ product }) => {
  const headShotImage = product?.headShot?.media?.url
  const desc =
    product.overview?.shortDescription ||
    product.overview?.description ||
    product.description
  const bullets = product?.overview?.bulletPoints || product?.modelBullets
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
