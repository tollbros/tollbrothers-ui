import React, { useCallback, useState, useEffect, useRef } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

import { getWalkthroughURL, getVideoURL, getImage } from '../lib/utils'

import styles from './GalleryMedia.module.scss'

function GalleryMedia({
  media,
  showCaption,
  showModelLink = false,
  showSocials,
  dataLayerPush,
  clickAction,
  index,
  mediaCount,
  onLoad,
  backgroundColor,
  classes = {},
  Link,
  disableZoom = false,
  setIsZoomedIn = () => null,
  isZoomedIn = false,
  isZoomedInRef
}) {
  const transformComponentRef = useRef(null)
  let isSvg = false
  const src = getImage(media, 'url')
  let iframeSrc = null
  let modelLink = media.link || null
  const modelName = media.title || 'Duke'
  const altName = media.title || media.description || ''
  let caption = media.description || media.title || ''
  let type = 'image'
  let iframeWithCaption = ''
  const [showMedia, setShowMedia] = useState(false)
  const imgRef = useRef()
  const imgCount = (index + 1).toString() + ' / ' + mediaCount.toString()

  if (media?.type?.includes('video')) {
    modelLink = null
    type = 'video'
    iframeSrc = getVideoURL(media)
    if ((caption && showCaption) || mediaCount > 1) {
      iframeWithCaption = styles.iframeWithCaption
    }
  } else if (media?.type?.includes('walkthrough')) {
    modelLink = null
    type = 'walkthrough'
    iframeSrc = getWalkthroughURL(media)
    if ((caption && showCaption) || mediaCount > 1) {
      iframeWithCaption = styles.iframeWithCaption
    }
  }

  if (!showCaption) {
    caption = media.description || media.title
  }

  if (/.svg$/.test(src)) {
    isSvg = true
  }

  const imageClicked = function (e) {
    if (clickAction) {
      clickAction(index)
    }
  }

  const onImageLoad = () => {
    setShowMedia(true)
  }

  const openFacebook = () => {
    window.open(
      'http://www.facebook.com/sharer.php?u=' +
        encodeURIComponent(src) +
        '&t=' +
        encodeURIComponent(caption),
      'sharer',
      'toolbar=0,status=0,width=626,height=436'
    )
    if (dataLayerPush) {
      dataLayerPush({ event: 'facebook_share' })
    }
  }

  const openPinterest = () => {
    window.open(
      'http://www.pinterest.com/pin/create/button/?url=' +
        encodeURIComponent(src) +
        '&description=' +
        encodeURIComponent(caption),
      'sharer',
      'toolbar=0,status=0,width=626,height=436'
    )
    if (dataLayerPush) {
      dataLayerPush({ event: 'pinterest_share' })
    }
  }

  useEffect(() => {
    // image could already be loaded by the time this fires because it was rendered on the server
    if (imgRef.current && imgRef.current.complete) {
      setShowMedia(true)
    }
  }, [])

  useEffect(() => {
    if (
      isZoomedInRef &&
      !isZoomedInRef.current &&
      transformComponentRef?.current
    ) {
      transformComponentRef.current.resetTransform()
    }
  }, [isZoomedInRef?.current])

  return (
    <div className={styles.mediaWrapper}>
      {!showMedia && <span className='spinner' />}
      <figure
        className={`${styles.media} ${
          showMedia ? styles.show : ''
        } ${iframeWithCaption}`}
      >
        {type === 'image' && (
          <TransformWrapper
            ref={transformComponentRef}
            initialScale={1}
            centerOnInit
            centerZoomedOut
            limitToBounds
            disabled={disableZoom}
            panning={{ disabled: !isZoomedIn }}
            onZoomStart={() => {
              setIsZoomedIn(true)
              isZoomedInRef.current = true
            }}
            onZoomStop={(ref, _event) => {
              if (ref?.state?.scale > 1) {
                setIsZoomedIn(true)
                isZoomedInRef.current = true
              } else {
                setIsZoomedIn(false)
                isZoomedInRef.current = false
              }
            }}
          >
            <TransformComponent
              wrapperClass={styles.transformWrapper}
              contentClass={styles.transformContentClass}
            >
              <img
                className={`${isSvg ? 'mediaSVG__adjust' : ''}`}
                src={src}
                alt={altName}
                onClick={useCallback(imageClicked, [index])}
                onLoad={onImageLoad}
                loading='lazy'
                ref={imgRef}
              />
            </TransformComponent>
          </TransformWrapper>
        )}

        {(type === 'video' || type === 'walkthrough') && (
          <>
            <iframe
              src={iframeSrc}
              onLoad={onImageLoad}
              allow='autoplay; encrypted-media'
              loading='lazy'
              ref={imgRef}
            />
            <div
              className={`${styles.iframeCover} mediaIframeCover__adjust`}
              onClick={useCallback(imageClicked, [index])}
            />
          </>
        )}

        {modelLink && modelName && showModelLink && (
          <Link href={modelLink}>
            <a title={`View ${modelName} Model`}>
              <span className={styles.modelLink}>View {modelName} Model</span>
            </a>
          </Link>
        )}

        {((caption && showCaption) || mediaCount > 1) && ( // need to add the figcaption for the media count (ie 1/3) to show even if there is no caption
          <figcaption
            className={`${classes.figcaption ?? ''}`}
            style={{ backgroundColor: backgroundColor }}
          >
            {showCaption && <span>{caption}</span>}
            <div className={styles.bottomRightNav}>
              {mediaCount > 1 && <span>{imgCount}</span>}
              {type === 'image' && showSocials && (
                <div className={styles.mediaShareNav}>
                  <button
                    className={`${styles.mediaFacebookShare} ${styles.mediaShareButton} js-facebook-share-analytics-trig`}
                    onClick={openFacebook}
                  />
                  <button
                    className={`${styles.mediaPinterestShare} ${styles.mediaShareButton} js-pinterest-share-analytics-trig`}
                    onClick={openPinterest}
                  />
                </div>
              )}
            </div>
          </figcaption>
        )}
      </figure>
    </div>
  )
}

export default GalleryMedia
