import React, { useState, useRef, useEffect } from 'react'
import styles from './HeroSlide.module.scss'

const HeroSlide = ({ src, alt, title, url, callBack, Link, type, poster }) => {
  const [isVertical, setIsVertical] = useState(false)
  const [videoSRC, setVideoSRC] = useState(null)
  const [videoReady, setVideoReady] = useState(false)
  const bkgdImgRef = useRef(null)
  const mainMediaRef = useRef(null)
  const overlayRef = useRef(null)

  const isVideo = src && type?.toLowerCase().includes('video')
  const imgSrc = src
  const image920 = src && !isVideo ? src.replace('_1920.', '_920.') : src

  const onMediaLoad = (e) => {
    if (!isVideo) {
      const { naturalWidth, naturalHeight } = e.target
      setIsVertical(naturalWidth < naturalHeight)
      showPosterAndOverlay()
    } else {
      setVideoReady(true)
    }
    if (callBack) {
      callBack()
    }
  }

  const showPosterAndOverlay = () => {
    if (bkgdImgRef.current) {
      bkgdImgRef.current.style.opacity = 1
    }
    if (overlayRef.current) {
      overlayRef.current.style.opacity = 1
    }
  }

  useEffect(() => {
    ;[mainMediaRef, bkgdImgRef].forEach((imgRef) => {
      if (imgRef.current && imgRef.current.complete) {
        const { naturalWidth, naturalHeight } = imgRef.current
        setIsVertical(naturalWidth < naturalHeight)
        showPosterAndOverlay()
      }
    })

    if (src && isVideo) {
      setVideoSRC(src)
    }
  }, [])

  return (
    <div
      className={`${styles.mediaHolder} ${isVertical ? styles.vertical : null}`}
    >
      {url && (
        <Link href={url} className={styles.caption}>
          {title}
        </Link>
      )}
      <div
        className={`${styles.overlay} ${isVideo ? styles.videoOverlay : ''}`}
        ref={overlayRef}
      >
        {' '}
      </div>

      {isVideo && !videoReady && (
        <img
          className={`${styles.posterImage} `}
          src={poster}
          alt={alt || 'Toll Brothers'}
          ref={bkgdImgRef}
          onLoad={showPosterAndOverlay}
        />
      )}
      {isVideo ? (
        <video
          className={styles.modelCardVideo}
          src={videoSRC}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={onMediaLoad}
          ref={mainMediaRef}
        />
      ) : (
        <picture>
          <source media='(max-width: 920px)' srcSet={image920} />
          <source media='(min-width: 921px)' srcSet={imgSrc} />
          <img
            className={styles.modelCardImg}
            src={image920}
            alt={alt || ''}
            onLoad={onMediaLoad}
            ref={mainMediaRef}
          />
        </picture>
      )}
      {isVertical && !isVideo && (
        <picture>
          <source media='(max-width: 920px)' srcSet={image920} />
          <source media='(min-width: 921px)' srcSet={imgSrc} />
          <img
            className={styles.modelCardImgBG}
            src={image920}
            alt={alt || ''}
            onLoad={onMediaLoad}
            ref={bkgdImgRef}
          />
        </picture>
      )}
    </div>
  )
}
export default HeroSlide
