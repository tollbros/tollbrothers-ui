import React, { useState, useEffect } from 'react'
import { BotMessage } from './BotMessage'
import { ImageCarousel } from './ImageCarousel'
import { FloorPlanViewer } from './FloorPlanViewer'
import { ThinkingIndicator } from './ThinkingIndicator'
import { getProductData } from './utils/getProductData'

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
  const [mediaData, setMediaData] = useState(null)
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

        // Extract media based on component type
        if (component === 'Gallery') {
          const images = extractGalleryImages(productData, types)
          setMediaData(images)
        } else if (component === 'FloorPlan') {
          const floorPlans = extractFloorPlans(productData)
          setMediaData(floorPlans)
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching media data:', err)
        setError('Failed to load media')
        setIsLoading(false)
      }
    }

    fetchMediaData()
  }, [productUrls, component, types, tollRouteApi])

  // Extract images from product data based on types filter
  const extractGalleryImages = (productData, typeFilter) => {
    const allImages = []

    productData.forEach((product) => {
      const isModel = Boolean(product?.commPlanID)
      const isQMI = isModel && product?.isQMI

      // Add images based on type filter
      typeFilter.forEach((type) => {
        switch (type) {
          case 'AMENITY':
            // Model elevations
            if (!isModel && product.amenities?.amenityGroups?.[0]?.media) {
              // if (product.amenities?.headshot) allImages.push({ ...product.amenities.headshot })
              allImages.push(...product.amenities.amenityGroups[0].media.map((img) => ({ ...img })))
            }
            break
          case 'ELEVATION':
            // Model elevations
            if (isModel && product.elevations) {
              allImages.push(...product.elevations.map((img) => ({ ...img, type: 'ELEVATION' })))
            }
            break

          case 'INTERIOR':
            // Designer Appointed Features (QMI models)
            if (isQMI && product.designerAppointed) {
              const dafs = product.designerAppointed.slice(1) // Remove first item as per ProductLayout logic
              allImages.push(...dafs.map((img) => ({ ...img, type: 'INTERIOR' })))
            }
            // Community amenity photos
            if (!isModel && product?.amenities?.amenityGroups?.[0]?.media) {
              const amenityImages = product.amenities.amenityGroups[0].media.filter((item) => item.type === 'image')
              allImages.push(...amenityImages.map((img) => ({ ...img, type: 'INTERIOR' })))
            }
            // Gallery images
            if (product?.gallery?.mediaGroups?.[0]?.media) {
              const galleryImages = product.gallery.mediaGroups[0].media.filter((item) => item.type === 'image')
              allImages.push(...galleryImages.map((img) => ({ ...img, type: 'INTERIOR' })))
            }
            break

          case 'VIDEO':
          case 'WALKTHROUGH':
            // Videos from headShot
            if (product.headShot?.media?.type?.includes('video')) {
              allImages.push({
                url: product.headShot.media.url,
                type: type,
                title: product.name || ''
              })
            }
            // Videos from gallery
            if (product?.gallery?.mediaGroups?.[0]?.media) {
              const videos = product.gallery.mediaGroups[0].media.filter(
                (item) => item.type === 'video' || item.type?.includes('video')
              )
              allImages.push(...videos.map((vid) => ({ ...vid, type: type })))
            }
            break

          default:
            break
        }
      })

      // If no type filter specified, add all available images
      if (typeFilter.length === 0) {
        if (isModel && product.elevations) {
          allImages.push(...product.elevations)
        }
        if (isQMI && product.designerAppointed) {
          allImages.push(...product.designerAppointed.slice(1))
        }
        if (!isModel && product?.amenities?.amenityGroups?.[0]?.media) {
          const amenityImages = product.amenities.amenityGroups[0].media.filter((item) => item.type === 'image')
          allImages.push(...amenityImages)
        }
        if (product?.gallery?.mediaGroups?.[0]?.media) {
          allImages.push(...product.gallery.mediaGroups[0].media)
        }
      }
    })

    return allImages
  }

  // Extract floor plans from product data
  const extractFloorPlans = (productData) => {
    const allFloorPlans = []

    productData.forEach((product) => {
      const isModel = Boolean(product?.commPlanID)
      if (isModel && product.floorplans) {
        allFloorPlans.push(...product.floorplans)
      }
    })

    return allFloorPlans
  }

  console.log('media data: ', mediaData)

  // Show loading state
  if (isLoading) {
    return <BotMessage message={message} component={<ThinkingIndicator />} />
  }

  // Show error state
  if (error || !mediaData || mediaData.length === 0) {
    return <BotMessage message={message} />
  }

  // Render Gallery
  if (component === 'Gallery') {
    return (
      <BotMessage
        message={message}
        component={<ImageCarousel images={mediaData} utils={utils} />}
        outsideComponent={isFeedbackEligible ? feedbackComponent : null}
      />
    )
  }

  // Render FloorPlan
  if (component === 'FloorPlan') {
    return (
      <BotMessage
        message={message}
        component={<FloorPlanViewer floorPlans={mediaData} utils={utils} />}
        outsideComponent={isFeedbackEligible ? feedbackComponent : null}
      />
    )
  }

  // Fallback
  return <BotMessage message={message} />
}
