import React from 'react'
import styles from './ProductsList.module.scss'
import { ActionButton } from './ActionButton'

const formatPrice = (price) => {
  if (!price) return null

  const priceStr = String(price).trim()
  const lowerPrice = priceStr.toLowerCase()

  console.log('formatPrice input:', price, 'type:', typeof price)

  // Check for "low", "mid", or "upper" in the price string
  const hasRange =
    lowerPrice.includes('low') ||
    lowerPrice.includes('mid') ||
    lowerPrice.includes('upper') ||
    lowerPrice.includes('the')

  // If it already has dollar signs and formatting, return as is with "from the" prefix if needed
  if (priceStr.includes('$')) {
    const result = hasRange
      ? `anticipated from ${priceStr}`
      : `starting at ${priceStr}`
    console.log('formatPrice output (already has $):', result)
    return result
  }

  // Try to parse as number and format
  const numPrice = Number(priceStr.replace(/,/g, ''))
  if (!isNaN(numPrice) && numPrice > 0) {
    const formatted = `$${numPrice.toLocaleString('en-US')}`
    const result = hasRange
      ? `anticipated from ${formatted}`
      : `starting at ${formatted}`
    console.log('formatPrice output (formatted number):', result)
    return result
  }

  // If string contains numbers, try to add $ at the beginning
  if (/\d/.test(priceStr)) {
    const result = hasRange ? `from the $${priceStr}` : `$${priceStr}`
    console.log('formatPrice output (added $):', result)
    return result
  }

  // Return original if can't format
  const result = hasRange ? `from the ${priceStr}` : priceStr
  console.log('formatPrice output (original):', result)
  return result
}

export const ProductsList = ({ products }) => {
  if (!products || products.length === 0) {
    return null
  }

  console.log(products)

  return (
    <div className={styles.productsContainer}>
      {products.map((product, index) => {
        const headShotImage = product.headShot?.media?.url
        const desc =
          product.overview?.shortDescription || product.overview?.description
        console.log('headShotImage', headShotImage)
        return (
          <div key={product.id || index} className={styles.productCard}>
            {headShotImage && (
              <div className={styles.productImage}>
                <img src={headShotImage} alt={product.name || 'Community'} />
              </div>
            )}
            <div className={styles.productContent}>
              <div className={styles.productHeader}>
                {product.name && (
                  <h3 className={styles.productName}>{product.name}</h3>
                )}
              </div>

              {(product.rangeBed || product.rangeBath || product.sqft) && (
                <div className={styles.productStats}>
                  {product.rangeBed && (
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{product.rangeBed}</div>
                      <div className={styles.statLabel}>Beds</div>
                    </div>
                  )}
                  {product.rangeBath && (
                    <div className={styles.stat}>
                      <div className={styles.statValue}>
                        {product.rangeBath}
                      </div>
                      <div className={styles.statLabel}>Baths</div>
                    </div>
                  )}
                  {product.rangeSqft && (
                    <div className={styles.stat}>
                      <div className={styles.statValue}>
                        {product.rangeSqft}
                      </div>
                      <div className={styles.statLabel}>Square Feet</div>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.productInfo}>
                {product.pricedFrom && (
                  <p className={styles.productPrice}>
                    {product.homeTypes && product.homeTypes.length > 0 && (
                      <>{product.homeTypes.join(', ')} homes </>
                    )}
                    {formatPrice(product.pricedFrom)}
                  </p>
                )}
                {desc && <p className={styles.productDescription}>{desc}</p>}
              </div>

              {product.url && (
                <ActionButton onClick={() => null}>Tell Me More</ActionButton>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
