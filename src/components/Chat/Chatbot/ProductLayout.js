import React from 'react'
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

export const ProductLayout = ({
  product,
  handleProductSelect = () => null,
  utils,
  onClose,
  onCloseChat = () => null
}) => {
  const headShotImage = product?.headShot?.media?.url
  const desc =
    product.overview?.shortDescription ||
    product.overview?.description ||
    product.description
  const bullets = product?.overview?.bulletPoints || product?.modelBullets

  // console.log(product)

  const isMasterCommunity =
    Boolean(product?.communities?.length > 0) && product.isMaster
  const isCommunity = !isMasterCommunity && !product?.commPlanID
  const isModel = Boolean(product?.commPlanID)
  const isQMI = isModel && product?.isQMI
  const isDesignReady =
    isModel && Boolean(product?.designReadyOptions?.length > 0)

  const { communityModels, communityQMIs } = utils?.buildHomeArrays?.(
    product?.homes,
    product.options
  )

  const dafs = isQMI ? (product.designerAppointed || []).slice(1) : []
  const floorPlans = isModel ? product.floorplans || [] : []
  const elevations = isModel ? product.elevations || [] : []
  const amenities = product?.amenities?.amenityGroups?.[0]?.amenities

  const { options, everyOptionSharedByEachCollection } =
    utils?.getAllCommunityOptions?.(product) || {}

  const vipSalesOnly = utils?.hasOption?.(
    everyOptionSharedByEachCollection,
    utils?.OPTIONS?.VIP_SALES_ONLY
  )
  const isFuture =
    product.isFuture || product.communityTypes?.includes('Future')
  const hideTour = product.salesOffice?.hideTour
  const hasSelfGuidedTour = product.tour
  const dcaDisclaimer = product?.dcaDisclaimer
  const hideDirections = product.salesOffice?.hideDirections
  const canShowDirections = !isFuture && !hideDirections
  const canShowCTAs = Boolean(product.salesOffice)

  const showGeoLocation = utils?.hasOption?.(
    options,
    utils?.OPTIONS?.GEO_LOCATION_ENABLED
  )
  const salesOfficeLat = product.salesOffice?.lat
  const salesOfficeLon = product.salesOffice?.lon
  const showHours = product.salesOffice?.showHours

  const state = product.salesOffice?.state
  const street = product.salesOffice?.street
  const buildingStreet = product.street
  const city = product.salesOffice?.city
  const zip = product.salesOffice?.zip

  const mapLink = utils?.useMapLink?.({
    lat: salesOfficeLat,
    lon: salesOfficeLon,
    salesOffice: { state, street, city, zip },
    showGeoLocation
  })

  // TODO figure out what to do with NYC communities and online sales (since they no longer have that)
  // this is only relevant if we decide to go with showing OSC phone numbers in this component

  let label = `I want to `
  let hash = '#appointment'
  let isVip = false
  if (dcaDisclaimer) {
    label += 'contact the community'
    hash = '#contact'
  } else if (hideTour) {
    label += 'talk to an expert'
    hash = '#contact-email'
  } else if (isFuture) {
    label += vipSalesOnly ? 'talk to an expert' : 'become a VIP'
    hash = '#join-vip'
    isVip = true
  } else if (hasSelfGuidedTour) {
    label += 'schedule a self-guided tour'
  } else {
    label += 'schedule a tour'
  }

  // console.log(label, hash)

  // in case we decide to show community gallery some day
  // const communityGallery = !isModel
  //   ? (product?.gallery?.mediaGroups?.[0]?.media || []).filter(
  //       (item) => item.type === 'image'
  //     )
  //   : []

  // console.log(communityGallery)

  const preventIfCurrentPage = (url, e) => {
    const pathname = new URL(url, window.location.origin).pathname
    if (window.location.pathname === pathname) {
      e.preventDefault()
      e.stopPropagation()
      return true
    }

    return false
  }

  const closeChatOnMobile = () => {
    if (window.innerWidth < 992) {
      onCloseChat()
    }
  }

  return (
    <div className={styles.root}>
      <CloseButton
        className={styles.closeButton}
        onClick={onClose}
        ariaLabel='Close product details'
      />
      <div className={styles.header}>
        {product?.name && (
          <div>
            <ConditionalLink href={product.url} utils={utils}>
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
        {isModel && <ModelDetails model={product} utils={utils} />}
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
        {isMasterCommunity && (
          <div className={styles.collectionsContainer}>
            {product.communities?.map((community, index) => (
              <CollectionCard
                key={community.communityId || index}
                collection={community}
                utils={utils}
                handleProductSelect={handleProductSelect}
              />
            ))}
          </div>
        )}
        {isCommunity && (
          <CommunityModels
            communityQMIs={communityQMIs}
            communityModels={communityModels}
            handleProductSelect={handleProductSelect}
            utils={utils}
          />
        )}
        {/* {!isModel && communityGallery?.length > 0 && (
          <ImageCarousel
            images={communityGallery}
            utils={utils}
            title='Gallery'
          />
        )} */}
        {isQMI && dafs?.length > 0 && (
          <ImageCarousel
            images={dafs}
            isUseHighRes
            utils={utils}
            title='Designer Appointed Features'
          />
        )}
        {isModel && floorPlans?.length > 0 && (
          <FloorPlanViewer floorPlans={floorPlans} utils={utils} />
        )}
        {isModel && !isQMI && elevations?.length > 0 && (
          <ImageCarousel
            images={elevations}
            utils={utils}
            title='Exterior Designs'
          />
        )}
        {!isModel && amenities && <AmenitiesList amenities={amenities} />}

        {canShowCTAs && (
          <div className={styles.footer}>
            <div className={styles.optionsWrapper}>
              <OptionButton
                text={label}
                href={product.url + hash}
                isLink
                utils={utils}
                onClick={(e) => {
                  closeChatOnMobile()
                  const isCurrentPage = preventIfCurrentPage(product.url, e)
                  if (isCurrentPage && utils) {
                    if (isVip) {
                      utils.openVIPPanel()
                    } else if (hideTour) {
                      utils.openEmailPanel()
                    } else {
                      utils.openTourPanel()
                    }
                    // utils.closeEmailPanel()
                    utils.closeSalesPanel()
                  }
                }}
              />
              {!dcaDisclaimer && !isFuture && (
                <OptionButton
                  text='I want to contact the community'
                  href={product.url + '#contact'}
                  isLink
                  utils={utils}
                  onClick={(e) => {
                    closeChatOnMobile()
                    const isCurrentPage = preventIfCurrentPage(product.url, e)
                    if (isCurrentPage && utils) {
                      utils.closeSalesPanel()
                      utils.closeEmailPanel()
                      utils.closeVIPPanel()
                      utils.closeTourPanel()
                      setTimeout(() => {
                        utils.openSalesPanel()
                      }, 350)
                    }
                  }}
                />
              )}
              {showHours && !isFuture && !hideDirections && (
                <OptionButton
                  text='I want to see the sales hours'
                  href={product.url + '#sales-hours'}
                  isLink
                  utils={utils}
                  onClick={(e) => {
                    closeChatOnMobile()
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
                  text='I want to get directions'
                  href={mapLink}
                  isLink
                  target='_blank'
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
