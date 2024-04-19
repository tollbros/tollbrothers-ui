import React, { useCallback, useState, useEffect, useRef } from 'react'
import Link from 'next/link'

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
  backgroundColor
}) {
  let isSvg = false
  const src = getImage(media, 'url')
  let iframeSrc = null
  let modelLink = media.link || null
  const modelName = media.title || 'Duke'
  const altName = media.title || media.description || ''
  let caption = media.description || media.title || ''
  let type = 'image'
  const [showMedia, setShowMedia] = useState(false)
  const imgRef = useRef()
  let imgCount = (index + 1).toString() + " / " + mediaCount.toString();
  if (media?.type?.includes('video')) {
    modelLink = null
    type = 'video'
    iframeSrc = getVideoURL(media)
  } else if (media?.type?.includes('walkthrough')) {
    modelLink = null
    type = 'walkthrough'
    iframeSrc = getWalkthroughURL(media)
  }

  let customFigStyles = media?.link?.includes('insidemaps') ? styles.figCaptionStyles : null;

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
    window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(src)+ '&t=' + encodeURIComponent(caption), 'sharer', 'toolbar=0,status=0,width=626,height=436');
    if (dataLayerPush) {
      dataLayerPush({'event': "facebook_share"});
    }
  }

  const openTwitter = () => {
    window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(caption)+'&url='+encodeURIComponent(src),'sharer','toolbar=0,status=0,width=626,height=436');
    if (dataLayerPush) {
      dataLayerPush({'event': "twitter_share"});
    }
  }

  const openPinterest = () => {
    window.open('http://www.pinterest.com/pin/create/button/?url='+encodeURIComponent(src)+'&description='+encodeURIComponent(caption),'sharer','toolbar=0,status=0,width=626,height=436');
    if (dataLayerPush) {
      dataLayerPush({'event': "pinterest_share"});
    }
  }

  useEffect(() => {
    // image could already be loaded by the time this fires because it was rendered on the server
    if (imgRef.current && imgRef.current.complete) {
      setShowMedia(true)
    }
  }, [])

  return (
    <div className={styles.mediaWrapper}>
      {!showMedia && <span className='spinner' />}
      <figure className={`${styles.media} ${showMedia ? styles.show : ''}`}>
        {type === 'image' && (
          <img
            className={`${isSvg ? 'mediaSVG__adjust' : ''}`}
            src={src}
            alt={altName}
            onClick={useCallback(imageClicked, [index])}
            onLoad={onImageLoad}
            loading='lazy'
            ref={imgRef}
          />
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

        {caption && showCaption && (
          
          <figcaption className={`${styles.mediaCapInline} ${customFigStyles}`} style={{backgroundColor: backgroundColor}}>{caption}</figcaption>
        )}

        <div className={styles.bottomRightNav}>
          {
            mediaCount > 1 &&
            <p>{imgCount}</p>
          }          

          {
            showSocials &&
            <div className={styles.mediaShareNav}>
              <button className={`${styles.mediaFacebookShare} ${styles.mediaShareButton} js-facebook-share-analytics-trig`} onClick={openFacebook}></button>
              {/* <button className={`${styles.mediaTwitterShare} ${styles.mediaShareButton} js-twitter-share-analytics-trig`} onClick={openTwitter}></button> */}
              <button className={`${styles.mediaPinterestShare} ${styles.mediaShareButton} js-pinterest-share-analytics-trig`} onClick={openPinterest}></button>
            </div>
          }
          
        </div>

      </figure>
    </div>
  )
}

export default GalleryMedia
