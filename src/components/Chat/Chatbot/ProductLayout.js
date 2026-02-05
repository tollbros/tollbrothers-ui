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

export const ProductLayout = ({
  product,
  handleProductSelect = () => null,
  utils,
  onClose
}) => {
  const headShotImage = product?.headShot?.media?.url
  const desc =
    product.overview?.shortDescription ||
    product.overview?.description ||
    product.description
  const bullets = product?.overview?.bulletPoints || product?.modelBullets

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

  // in case we decide to show community gallery some day
  // const communityGallery = !isModel
  //   ? (product?.gallery?.mediaGroups?.[0]?.media || []).filter(
  //       (item) => item.type === 'image'
  //     )
  //   : []

  // console.log(communityGallery)

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
      </div>
    </div>
  )
}
