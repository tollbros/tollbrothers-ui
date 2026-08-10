import React, { useState, useEffect } from 'react'
import { BotMessage } from './BotMessage'
import { ImageCarousel } from './ImageCarousel'
import { FloorPlanViewer } from './FloorPlanViewer'
import { ThinkingIndicator } from './ThinkingIndicator'
import { getProductData } from './utils/getProductData'
import styles from './MediaMessageViewer.module.scss'

/**
 * MediaMessageViewer Component
 * Fetches product data and displays media (images or floor plans) based on component type
 */
export const MediaMessageViewer = ({
  message,
  component, // 'Gallery' or 'FloorPlan'
  types = [], // Filter array for Gallery: ['VIDEO', 'WALKTHROUGH', 'ELEVATION', 'INTERIOR']
  productUrls = [], // Array of product URLs (homeDesigns, qmis, or communities)
  utils,
  tollRouteApi,
  isFeedbackEligible,
  feedbackComponent
}) => {
  const [productsWithMedia, setProductsWithMedia] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  console.log(productUrls)

  console.log('component: ', component)
  console.log('types: ', types)

  useEffect(() => {
    const fetchMediaData = async () => {
      if (!productUrls || productUrls.length === 0) {
        setError('No products available')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const productData = await getProductData(productUrls, tollRouteApi)

        console.log('product data: ', productData)

        if (!productData || productData.length === 0) {
          setError('Failed to load media')
          setIsLoading(false)
          return
        }

        // Extract media for each product individually
        const productsWithMediaData = productData
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

        setProductsWithMedia(productsWithMediaData)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching media data:', err)
        setError('Failed to load media')
        setIsLoading(false)
      }
    }

    fetchMediaData()
  }, [productUrls, component, types, tollRouteApi])

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
          if (isModel && product.walkThroughs) {
            allImages.push(...product.walkThroughs.map((wt) => ({ ...wt.media })))
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

  console.log('products with media: ', productsWithMedia)

  // Show loading state
  if (isLoading) {
    return <BotMessage message={message} component={<ThinkingIndicator />} />
  }

  // Show error state or no media found
  if (error || !productsWithMedia || productsWithMedia.length === 0) {
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
                  <ImageCarousel images={item.media} utils={utils} title={item.name} />
                </div>
              )
            }

            if (component === 'FloorPlan') {
              return (
                <div key={`floorplan-${item.key}`} className={styles.mediaViewerFloorplan}>
                  <FloorPlanViewer floorPlans={item.media} utils={utils} />
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
