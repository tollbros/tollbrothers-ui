import React, { useMemo } from 'react'
import { BotMessage } from './BotMessage'
import { ImageCarousel } from './ImageCarousel'
import { FloorPlanViewer } from './FloorPlanViewer'
import { ConditionalLink } from './ConditionalLink'
import styles from './MediaMessageViewer.module.scss'

const MediaTitle = ({ item, onMinimizeChat, utils }) => {
  return (
    <div className={styles.title}>
      <ConditionalLink href={item?.product?.url} utils={utils} onMinimizeChat={onMinimizeChat}>
        <h3 className={styles.itemTitle}>{item?.name}</h3>
      </ConditionalLink>
      {item?.product?.communityUrl && <span className={styles.itemSubtitle}>{item.product.communityName}</span>}
    </div>
  )
}

// Extract images from a single product based on types filter
const extractGalleryImagesForProduct = (product, typeFilter) => {
  const allImages = []
  const isModel = Boolean(product?.commPlanID)
  const isQMI = isModel && product?.isQMI

  // Add images based on type filter
  typeFilter.forEach((type) => {
    switch (type) {
      case 'AMENITY':
        if (!isModel && product.amenities?.amenityGroups?.[0]?.media) {
          allImages.push(...product.amenities.amenityGroups[0].media.map((img) => ({ ...img })))
        }
        break
      case 'ELEVATION':
        // Model elevations
        if (isModel && product.elevations) {
          allImages.push(...product.elevations.map((img) => ({ ...img })))
        }
        break

      case 'INTERIOR':
        // Designer Appointed Features (QMI models)
        if (isQMI && product.designerAppointed) {
          const dafs = product.designerAppointed.slice(1) // Remove first item as per ProductLayout logic
          allImages.push(...dafs.map((img) => ({ ...img })))
        }

        // Gallery images
        if (product?.gallery?.mediaGroups?.[0]?.media) {
          const galleryImages = product.gallery.mediaGroups[0].media.filter((item) => item.type === 'image')
          allImages.push(...galleryImages.map((img) => ({ ...img })))
        }
        break

      case 'VIDEO':
        if (product.gallery?.mediaGroups?.[0]?.media) {
          const galleryVideos = product.gallery.mediaGroups[0].media.filter((item) => item.type.includes('vimeo'))
          allImages.push(...galleryVideos.map((img) => ({ ...img })))
        }
        break

      case 'WALKTHROUGH':
        if (isModel && product.gallery?.walkThroughs) {
          allImages.push(
            ...product.gallery.walkThroughs.map((wt) => ({
              ...wt.media,
              planName: product.name
            }))
          )
        }
        break

      default:
        break
    }
  })

  return allImages
}

// Extract floor plans from a single product
const extractFloorPlansForProduct = (product) => {
  const isModel = Boolean(product?.commPlanID)
  if (isModel && product.floorplans) {
    return product.floorplans
  }
  return []
}

/**
 * MediaMessageViewer Component
 * Displays media (images or floor plans) based on component type from pre-fetched product data
 */
export const MediaMessageViewer = ({
  message,
  component, // 'Gallery' or 'FloorPlan'
  types = [], // Filter array for Gallery: ['VIDEO', 'WALKTHROUGH', 'ELEVATION', 'INTERIOR']
  products = [], // Pre-fetched product data (homeDesigns, qmis, or communities)
  utils,
  isFeedbackEligible,
  feedbackComponent,
  onMinimizeChat
}) => {
  // Extract media for each product - calculated synchronously during render
  const productsWithMedia = useMemo(() => {
    if (!products || products.length === 0) {
      return []
    }

    // Extract media for each product individually
    const productsWithMediaData = products
      .map((product) => {
        let media = []
        const productName = product.name || product.title || ''

        if (component === 'Gallery') {
          media = extractGalleryImagesForProduct(product, types)
        } else if (component === 'FloorPlan') {
          media = extractFloorPlansForProduct(product)
        }

        return {
          key: product.url,
          name: productName,
          media: media,
          product: product
        }
      })
      .filter((item) => item.media && item.media.length > 0)

    return productsWithMediaData
  }, [products, component, types])

  // Show text-only message if no media found
  if (!productsWithMedia || productsWithMedia.length === 0) {
    return <BotMessage message={message} />
  }

  // Render multiple galleries or floor plan viewers in a single BotMessage
  return (
    <BotMessage
      message={message}
      component={
        <>
          {productsWithMedia.map((item) => {
            if (component === 'Gallery') {
              return (
                <div key={`gallery-${item.key}`} className={styles.mediaViewerGallery}>
                  <ImageCarousel
                    images={item.media}
                    utils={utils}
                    title={<MediaTitle item={item} utils={utils} onMinimizeChat={onMinimizeChat} />}
                  />
                </div>
              )
            }

            if (component === 'FloorPlan') {
              return (
                <div key={`floorplan-${item.key}`} className={styles.mediaViewerFloorplan}>
                  <FloorPlanViewer
                    floorPlans={item.media}
                    utils={utils}
                    title={<MediaTitle item={item} utils={utils} onMinimizeChat={onMinimizeChat} />}
                  />
                </div>
              )
            }

            return null
          })}
        </>
      }
      outsideComponent={isFeedbackEligible ? feedbackComponent : null}
    />
  )
}
