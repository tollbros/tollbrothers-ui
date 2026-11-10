import React, { useEffect, useRef } from 'react'
import styles from './ProductLayout.module.scss'
import { ModelStats } from './ModelStats'
import { ModelDetails } from './ModelDetails'
import { QMICallout } from './QMICallout'
import { CollectionCard } from './CollectionCard'
import { CommunityModels } from './CommunityModels'
import { AmenitiesList } from './AmenitiesList'
import { FloorPlanViewer } from './FloorPlanViewer'
import { ImageCarousel } from './ImageCarousel'
import { ConditionalLink } from './ConditionalLink'
import { CloseButton } from './CloseButton'
import { OptionButton } from './OptionButton'
import { getProductHeroImage } from './utils/getProductHeroImage'
import { CommunitySalesOffice, getVisitSalesOffices } from './CommunitySalesOffice'
import { ProductContactButtons } from './ProductContactButtons'

export const ProductLayout = ({
  product,
  handleProductSelect = () => null,
  utils,
  onClose,
  onMinimizeChat = () => null,
  clearFocusTrap = () => null
}) => {
  const rootRef = useRef(null)
  const headShotImage = getProductHeroImage(product)
  const desc = product.overview?.shortDescription || product.overview?.description || product.description
  const bullets = product?.overview?.bulletPoints || product?.modelBullets

  const isMasterCommunity = Boolean(product?.communities?.length > 0) && product.isMaster
  const isCommunity = !isMasterCommunity && !product?.commPlanID
  const isModel = Boolean(product?.commPlanID)
  const isQMI = isModel && product?.isQMI
  const isDesignReady = isModel && Boolean(product?.designReadyOptions?.length > 0)

  const { communityModels = [], communityQMIs = [] } = utils?.buildHomeArrays?.(product?.homes, product.options) || {}

  // filter things out like BFOs, Home Sites
  const filteredCommunityQMIs = communityQMIs.filter((qmi) => qmi.isQMI)

  const dafs = isQMI ? (product.designerAppointed || []).slice(1) : []
  const floorPlans = isModel ? product.floorplans || [] : []
  const elevations = isModel ? product.elevations || [] : []
  const amenities = product?.amenities?.amenityGroups?.[0]?.amenities

  const { options } = utils?.getAllCommunityOptions?.(product) || {}
  const isFuture = product.isFuture || product.communityTypes?.includes('Future')
  const hideDirections = product.salesOffice?.hideDirections
  const hideSalesOffice = product.salesOffice?.hideSalesOffice
  const canShowDirections = !isFuture && !hideDirections && !hideSalesOffice
  const canShowCTAs = Boolean(product.salesOffice)

  const showGeoLocation = utils?.hasOption?.(options, utils?.OPTIONS?.GEO_LOCATION_ENABLED)
  const salesOfficeLat = product.salesOffice?.lat
  const salesOfficeLon = product.salesOffice?.lon
  const showHours = product.salesOffice?.showHours && !hideSalesOffice
  const showVisitCard = getVisitSalesOffices(product).length > 0

  const state = product.salesOffice?.state
  const street = product.salesOffice?.street
  // const buildingStreet = product.street
  const city = product.salesOffice?.city
  const zip = product.salesOffice?.zip

  const mapLink = utils?.useMapLink?.({
    lat: salesOfficeLat,
    lon: salesOfficeLon,
    salesOffice: { state, street, city, zip },
    showGeoLocation
  })

  const communityAmenityGallery = !isModel
    ? (product?.amenities?.amenityGroups?.[0]?.media || []).filter((item) => item.type === 'image')
    : []

  const preventIfCurrentPage = (url, e) => {
    const pathname = new URL(url, window.location.origin).pathname
    if (window.location.pathname === pathname) {
      e.preventDefault()
      e.stopPropagation()
      return true
    }

    return false
  }

  // const closeChatIfNoSpace = () => {
  //   if (!rootRef.current) return
  //   const layoutWidth = rootRef.current.offsetWidth
  //   const availableSpace = window.innerWidth - 680
  //   if (layoutWidth > availableSpace) {
  //     onMinimizeChat()
  //   }
  // }

  useEffect(() => {
    if (utils?.dataLayerPush && utils?.trackModelPageView && utils?.trackCommunityPageView) {
      let pageTypeEvent = 'community'
      if (isModel) {
        pageTypeEvent = 'home_design'
        if (isQMI) {
          pageTypeEvent = 'qmi'
        }
      }

      if (isModel) {
        utils.trackModelPageView(product)
      } else {
        utils.trackCommunityPageView(product)
      }

      utils.dataLayerPush({
        event: 'chatbot_page_view',
        page_type: pageTypeEvent,
        variant: 'chatbot'
      })
    }
  }, [])

  return (
    <div className={styles.root} ref={rootRef}>
      <CloseButton className={styles.closeButton} onClick={onClose} ariaLabel='Close product details' />
      <div className={styles.header}>
        {product?.name && (
          <div>
            <ConditionalLink href={product.url} utils={utils} onMinimizeChat={onMinimizeChat}>
              <h2 className={styles.title}>{product.name}</h2>
            </ConditionalLink>
            <span className={styles.location}>
              {isModel && product.communityName}
              {!isModel && (
                <>
                  {product.city}, {product.state}
                </>
              )}
            </span>
          </div>
        )}

        {headShotImage && (
          <div className={styles.imageWrapper}>
            <img src={headShotImage} alt={product.name || 'Community'} className={styles.image} />
          </div>
        )}
      </div>
      <div className={styles.content}>
        {canShowCTAs && (
          <div className={styles.topContactButtons}>
            <ProductContactButtons
              product={product}
              utils={utils}
              onMinimizeChat={onMinimizeChat}
              clearFocusTrap={clearFocusTrap}
              buttonClassName={styles.button}
            />
          </div>
        )}
        {isModel && <QMICallout model={product} utils={utils} />}
        {isModel && <ModelDetails model={product} utils={utils} />}
        {isModel && <ModelStats model={product} utils={utils} />}
        {isDesignReady && utils.DesignReadyTimeline && (
          <div className={styles.designReadyWrapper} id='design-ready-timeline-panel'>
            {React.createElement(utils.DesignReadyTimeline, {
              moveInDate: product.moveInDate,
              dates: product.designReadyOptions,
              options: product.options
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
        {isMasterCommunity && (
          <div className={styles.collectionsContainer}>
            {product.communities?.map((community, index) => (
              <CollectionCard
                key={community.communityId || index}
                collection={community}
                utils={utils}
                handleProductSelect={handleProductSelect}
                onMinimizeChat={onMinimizeChat}
              />
            ))}
          </div>
        )}
        {isCommunity && (
          <CommunityModels
            communityQMIs={filteredCommunityQMIs}
            communityModels={communityModels}
            handleProductSelect={handleProductSelect}
            onMinimizeChat={onMinimizeChat}
            utils={utils}
          />
        )}

        {isQMI && dafs?.length > 0 && (
          <ImageCarousel images={dafs} isUseHighRes utils={utils} title='Designer Appointed Features' />
        )}
        {isModel && floorPlans?.length > 0 && <FloorPlanViewer floorPlans={floorPlans} utils={utils} />}
        {isModel && !isQMI && elevations?.length > 0 && (
          <ImageCarousel images={elevations} utils={utils} title='Exterior Designs' />
        )}
        {!isModel && amenities && <AmenitiesList amenities={amenities} />}
        {!isModel && communityAmenityGallery?.length > 0 && (
          <ImageCarousel images={communityAmenityGallery} utils={utils} />
        )}

        {showVisitCard && (
          <>
            <hr className={styles.visitDivider} />
            <CommunitySalesOffice
              product={product}
              titleName={isModel ? product.communityName || product.name : product.name}
              utils={utils}
              onMinimizeChat={onMinimizeChat}
              clearFocusTrap={clearFocusTrap}
            />
          </>
        )}

        {canShowCTAs && !showVisitCard && (
          <div className={styles.footer}>
            <div className={styles.optionsWrapper}>
              <ProductContactButtons
                product={product}
                utils={utils}
                onMinimizeChat={onMinimizeChat}
                clearFocusTrap={clearFocusTrap}
              />
              {showHours && !isFuture && (
                <OptionButton
                  text='View Sales Center hours'
                  href={product.url + '#sales-hours'}
                  isLink
                  utils={utils}
                  onClick={(e) => {
                    onMinimizeChat()
                    clearFocusTrap()
                    const isCurrentPage = preventIfCurrentPage(product.url, e)
                    if (isCurrentPage && utils) {
                      utils.openSalesPanel()
                      utils.closeEmailPanel()
                      utils.closeVIPPanel()
                      utils.closeTourPanel()
                      setTimeout(() => {
                        utils.jumpToHours()
                      }, 300)
                    }
                  }}
                />
              )}
              {canShowDirections && mapLink && (
                <OptionButton
                  text='Get directions'
                  href={mapLink}
                  isLink
                  target='_blank'
                  onClick={() => {
                    if (utils?.dataLayerPush)
                      utils.dataLayerPush({
                        event: 'directions-event',
                        variant: 'chatbot'
                      })
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
