import React from 'react'
import { HorizontalScroller } from '../HorizontalScroller'

import styles from './ImageCarousel.module.scss'

export const ImageCarousel = ({ images = [], title }) => {
  if (!images?.length) return null

  console.log(images)

  return (
    <div className={styles.imageCarousel}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.scrollContainer}>
        <HorizontalScroller
          showArrows={images.length > 1}
          classes={{
            scrollWrap: styles.scrollWrap,
            scrollItem: styles.scrollItem,
            controls: styles.controls
          }}
          useContainerWidth
        >
          {images.map((image, index) => {
            const caption = image.caption || image.alt || image.title || ''
            return (
              <div key={image.id || index} className={styles.imageItem}>
                <img
                  src={image.url || image.src}
                  alt={caption}
                  className={styles.image}
                />
                {caption && <span className={styles.caption}>{caption}</span>}
              </div>
            )
          })}
        </HorizontalScroller>
      </div>
    </div>
  )
}
