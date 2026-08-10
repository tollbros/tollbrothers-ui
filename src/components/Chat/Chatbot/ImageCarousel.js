import React, { useState, useEffect } from 'react'
import { HorizontalScroller } from '../../HorizontalScroller'
import { FullScreenGallery } from '../../FullScreenGallery'
import { PlayIcon } from './icons'
import { fetchImageThumbnails } from './utils/fetchImageThumbnails'

import styles from './ImageCarousel.module.scss'

const getCaption = (image) => image.title || image.alt || image.caption || image.description || ''

// Check if item is a video
const isVideo = (item) => {
  return item.type && (item.type.includes('vimeo') || item.type.includes('video'))
}

export const ImageCarousel = ({ images = [], title, utils, isUseHighRes = false }) => {
  const [showGallery, setShowGallery] = useState(false)
  const [initialSlide, setInitialSlide] = useState(1)
  const [thumbnailUrls, setThumbnailUrls] = useState({})

  useEffect(() => {
    if (images.length > 0) {
      fetchImageThumbnails(images, utils, isVideo).then((thumbnails) => {
        setThumbnailUrls(thumbnails)
      })
    }
  }, [images, utils])

  if (!images?.length) return null

  const handleImageClick = (index) => {
    setInitialSlide(index + 1)
    setShowGallery(true)
    onSlideView({ slideIndex: index })
  }

  const onSlideView = function (data) {
    const list = data?.mediaList || mediaList
    if (utils?.trackGalleryItem) utils.trackGalleryItem(list[data.slideIndex])
  }

  const imageList = isUseHighRes ? utils?.setToOriginalImages?.(images) || images : images

  const mediaList = imageList.map((image) => {
    const caption = getCaption(image)
    const itemIsVideo = isVideo(image)

    return {
      url: image.url || image.src,
      title: caption,
      description: caption,
      type: image.type,
      link: itemIsVideo ? image.link : undefined,
      variant: 'chatbot'
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
            const itemIsVideo = isVideo(image)
            const thumbnailUrl = thumbnailUrls[index] || image.url || image.src

            return (
              <div
                key={image.id || index}
                className={styles.imageItem}
                onClick={() => handleImageClick(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleImageClick(index)
                  }
                }}
                role='button'
                tabIndex={0}
                aria-label={`View ${caption || `${itemIsVideo ? 'video' : 'image'} ${index + 1}`} in full screen`}
              >
                <div className={styles.imageWrapper}>
                  <img src={thumbnailUrl} alt={caption} className={styles.image} />
                  {itemIsVideo && (
                    <div className={`${styles.playIconOverlay}`}>
                      <PlayIcon className={styles.playIcon} />
                    </div>
                  )}
                </div>
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
        onNext={onSlideView}
        onPrevious={onSlideView}
      />
    </div>
  )
}
