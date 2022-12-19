import React, { useCallback, useState, useEffect, useRef } from 'react'
import Link from 'next/link'

import {
  getWalkthroughURL,
  getVideoURL,
  getImage
} from '../helper-components/utils'

import styles from './GalleryMedia.module.scss'

function GalleryMedia({
  media,
  showCaption,
  showModelLink = false,
  clickAction,
  index,
  onLoad
}) {
  let isSvg = false
  const src = getImage(media, 'url')
  let iframeSrc = null
  let modelLink = media.link || null
  const modelName = media.title || 'Duke'
  const altName = media.title || media.description || ''
  let caption = media.description || media.title
  let type = 'image'
  const [showMedia, setShowMedia] = useState(false)
  const imgRef = useRef()

  if (media?.type?.includes('video')) {
    modelLink = null
    type = 'video'
    iframeSrc = getVideoURL(media)
  } else if (media?.type?.includes('walkthrough')) {
    modelLink = null
    type = 'walkthrough'
    iframeSrc = getWalkthroughURL(media)
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
          <figcaption className={styles.mediaCapInline}>{caption}</figcaption>
        )}

        {/* <span className={styles.overlay} onClick={closePopup}></span>

                        <button className={styles.close_btn} onClick={closePopup}>X</button> */}

        {/* <span className={styles.video_launch} onClick={imageClicked}>
                              <img className={styles.play_button} src="/img/icons/play3.png" alt="" />
                        </span> */}

        {/* {openIframe && <IframeModal src={props.videoLink} />}
                        {openIframe && <Overlay onCloseModal={closeIframeHandler} />} */}
      </figure>
    </div>
  )
}

export default GalleryMedia
