import React, { useState } from 'react'
import { HorizontalScroller } from '../HorizontalScroller'
import { FullScreenGallery } from '../FullScreenGallery'

import styles from './ImageCarousel.module.scss'

const getCaption = (image) =>
  image.title || image.alt || image.caption || image.description || ''

export const ImageCarousel = ({ images = [], title }) => {
  const [showGallery, setShowGallery] = useState(false)
  const [initialSlide, setInitialSlide] = useState(1)

  if (!images?.length) return null

  const handleImageClick = (index) => {
    setInitialSlide(index + 1)
    setShowGallery(true)
  }

  const mediaList = images.map((image) => {
    const caption = getCaption(image)
    return {
      url: image.url || image.src,
      title: caption,
      description: caption
    }
  })

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
            const caption = getCaption(image)
            return (
              <div
                key={image.id || index}
                className={styles.imageItem}
                onClick={() => handleImageClick(index)}
              >
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
      <FullScreenGallery
        show={showGallery}
        mediaList={mediaList}
        initialSlide={initialSlide}
        onClose={() => setShowGallery(false)}
      />
    </div>
  )
}
