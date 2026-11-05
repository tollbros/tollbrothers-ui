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
import { CommunitySalesOffice } from './CommunitySalesOffice'

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

  const { options, everyOptionSharedByEachCollection } = utils?.getAllCommunityOptions?.(product) || {}

  const vipSalesOnly = utils?.hasOption?.(everyOptionSharedByEachCollection, utils?.OPTIONS?.VIP_SALES_ONLY)
  const isFuture = product.isFuture || product.communityTypes?.includes('Future')
  const hideTour = product.salesOffice?.hideTour
  const hasSelfGuidedTour = product.tour
  const dcaDisclaimer = product?.dcaDisclaimer
  const hideDirections = product.salesOffice?.hideDirections
  const hideSalesOffice = product.salesOffice?.hideSalesOffice
  const canShowDirections = !isFuture && !hideDirections && !hideSalesOffice
  const canShowCTAs = Boolean(product.salesOffice)

  const showGeoLocation = utils?.hasOption?.(options, utils?.OPTIONS?.GEO_LOCATION_ENABLED)
  const salesOfficeLat = product.salesOffice?.lat
  const salesOfficeLon = product.salesOffice?.lon
  const showHours = product.salesOffice?.showHours && !hideSalesOffice
  const visitCandidates = isMasterCommunity ? product.communities : [product]
  const seenSalesOffices = new Set()
  const visitProducts = visitCandidates.filter((candidate, index) => {
    const office = candidate.salesOffice
    if (!office || office.hideSalesOffice) {
      return false
    }

    const address = [office.street, office.city, office.state, office.zip].filter(Boolean).join('|').toLowerCase()
    const key = address || (office.lat && office.lon ? `${office.lat}|${office.lon}` : candidate.communityId || index)
    if (seenSalesOffices.has(key)) return false
    seenSalesOffices.add(key)
    return true
  })
  if (isMasterCommunity && visitProducts.length === 0 && product.salesOffice && !product.salesOffice.hideSalesOffice) {
    visitProducts.push(product)
  }
  const showVisitCard = visitProducts.length > 0

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

  // TODO figure out what to do with NYC communities and online sales (since they no longer have that)
  // this is only relevant if we decide to go with showing OSC phone numbers in this component

  let label = ``
  let smallLabel = ''
  let hash = '#appointment'
  let isVip = false
  if (dcaDisclaimer) {
    label += 'Contact the community'
    smallLabel += 'Contact'
    hash = '#contact'
  } else if (hideTour) {
    label += 'Talk to a local expert'
    smallLabel += 'Talk to an Expert'
    hash = '#contact-email'
  } else if (isFuture) {
    label += vipSalesOnly ? 'Contact the community' : 'Become a VIP'
    smallLabel += vipSalesOnly ? 'Contact' : 'Become a VIP'
    hash = '#join-vip'
    isVip = true
  } else if (hasSelfGuidedTour) {
    label += 'Schedule a self-guided tour'
    smallLabel += 'Schedule a Tour'
    hash = '#self-guided-tour'
  } else {
    label += 'Schedule a tour'
    smallLabel += 'Schedule a Tour'
  }

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

  const onContactClick = (e, target = product) => {
    onMinimizeChat()
    clearFocusTrap()
    const isCurrentPage = preventIfCurrentPage(target.url, e)
    if (isCurrentPage && utils) {
      const targetUsesVip =
        target === product
          ? isVip
          : !target.dcaDisclaimer &&
            !target.salesOffice?.hideTour &&
            (target.isFuture || target.communityTypes?.includes('Future'))
      if (targetUsesVip) {
        utils.openVIPPanel()
      } else if (target.salesOffice?.hideTour) {
        utils.openEmailPanel()
      } else {
        utils.openTourPanel()
      }
      // utils.closeEmailPanel()
      utils.closeSalesPanel()
    }
  }

  const onSalesOfficeContactClick = (e, target = product) => {
    onMinimizeChat()
    clearFocusTrap()
    const isCurrentPage = preventIfCurrentPage(target.url, e)
    if (isCurrentPage && utils) {
      utils.closeSalesPanel()
      utils.closeEmailPanel()
      utils.closeVIPPanel()
      utils.closeTourPanel()
      setTimeout(() => {
        utils.openSalesPanel()
      }, 350)
    }
  }

  const visitProduct =
    isMasterCommunity && product.salesOffice && !product.salesOffice.hideSalesOffice ? product : visitProducts[0]
  const visitIsFuture = visitProduct?.isFuture || visitProduct?.communityTypes?.includes('Future')
  const visitVipSalesOnly = utils?.hasOption?.(
    visitProduct && utils?.getAllCommunityOptions?.(visitProduct)?.everyOptionSharedByEachCollection,
    utils?.OPTIONS?.VIP_SALES_ONLY
  )
  const visitActionHash = visitProduct?.dcaDisclaimer
    ? '#contact'
    : visitProduct?.salesOffice?.hideTour
    ? '#contact-email'
    : visitIsFuture
    ? '#join-vip'
    : visitProduct?.tour
    ? '#self-guided-tour'
    : '#appointment'
  const visitActionText = visitProduct?.dcaDisclaimer
    ? 'Contact'
    : visitProduct?.salesOffice?.hideTour
    ? 'Talk to an Expert'
    : visitIsFuture
    ? visitVipSalesOnly
      ? 'Contact'
      : 'Become a VIP'
    : 'Schedule a Tour'

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
        {canShowCTAs && !showVisitCard && (
          <div className={styles.topContactButtons}>
            {!dcaDisclaimer && !isFuture && (
              <OptionButton
                classes={{ root: styles.button }}
                text='Contact'
                href={product.url + '#contact'}
                isLink
                utils={utils}
                onClick={(e) => onSalesOfficeContactClick(e)}
              />
            )}
            <OptionButton
              classes={{ root: styles.button }}
              text={smallLabel}
              href={product.url + hash}
              isLink
              utils={utils}
              onClick={(e) => onContactClick(e)}
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
          <CommunitySalesOffice
            product={visitProduct}
            salesOffices={visitProducts}
            title={isFuture ? product.name : `Visit ${product.name}`}
            utils={utils}
            primaryAction={{
              text: visitActionText,
              href: visitProduct.url + visitActionHash,
              onClick: (e) => onContactClick(e, visitProduct)
            }}
            contactAction={
              !visitProduct.dcaDisclaimer && !visitIsFuture
                ? {
                    text: 'Contact the community',
                    href: visitProduct.url + '#contact',
                    onClick: (e) => onSalesOfficeContactClick(e, visitProduct)
                  }
                : null
            }
          />
        )}

        {canShowCTAs && !showVisitCard && (
          <div className={styles.footer}>
            <div className={styles.optionsWrapper}>
              <OptionButton
                text={label}
                href={product.url + hash}
                isLink
                utils={utils}
                onClick={(e) => onContactClick(e)}
              />
              {!dcaDisclaimer && !isFuture && (
                <OptionButton
                  text='Contact the community'
                  href={product.url + '#contact'}
                  isLink
                  utils={utils}
                  onClick={(e) => onSalesOfficeContactClick(e)}
                />
              )}
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
