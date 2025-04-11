import React, { useState, useRef, useEffect } from 'react'
import styles from './HeroSlide.module.scss'

const HeroSlide = ({
  src,
  alt,
  title,
  url,
  opacity,
  callBack,
  Link,
  type,
  poster
}) => {
  const [isVertical, setIsVertical] = useState(false)
  const [videoSRC, setVideoSRC] = useState(null)
  const [videoReady, setVideoReady] = useState(false)
  const bkgdImgRef = useRef(null)
  const mainMediaRef = useRef(null)
  const overlayRef = useRef(null)

  const isVideo = type?.toLowerCase().includes('video')
  const imgSrc = src && !isVideo ? src : poster
  const image920 = src && !isVideo ? src.replace('_1920.', '_920.') : poster

  const onVideoLoad = () => {
    setVideoReady(true)
    showImageAndOverlay()
  }

  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target
    setIsVertical(naturalWidth < naturalHeight)
    showImageAndOverlay()
    if (callBack) {
      callBack()
    }
  }

  const showImageAndOverlay = () => {
    if (bkgdImgRef.current) {
      bkgdImgRef.current.style.opacity = 1
    }
    if (mainMediaRef.current) {
      mainMediaRef.current.style.opacity = 1
    }
    if (overlayRef.current) {
      overlayRef.current.style.opacity = opacity || 0
    }
  }

  useEffect(() => {
    if (mainMediaRef.current && mainMediaRef.current.complete) {
      const { naturalWidth, naturalHeight } = mainMediaRef.current
      setIsVertical(naturalWidth < naturalHeight)
      showImageAndOverlay()
    }

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
      <div className={`${styles.overlay}`} ref={overlayRef}>
        {' '}
      </div>

      {!videoReady && (
        <picture>
          <source media='(max-width: 920px)' srcSet={image920} />
          <source media='(min-width: 921px)' srcSet={imgSrc} />
          <img
            className={styles.modelCardImg}
            src={image920}
            alt={alt || ''}
            onLoad={onImageLoad}
            ref={mainMediaRef}
          />
        </picture>
      )}

      {isVideo && videoSRC && (
        <video
          className={styles.modelCardVideo}
          src={videoSRC}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={onVideoLoad}
        />
      )}

      {isVertical && !videoReady && (
        <picture>
          <source media='(max-width: 920px)' srcSet={image920} />
          <source media='(min-width: 921px)' srcSet={imgSrc} />
          <img
            className={styles.modelCardImgBG}
            src={image920}
            alt={alt || ''}
            ref={bkgdImgRef}
          />
        </picture>
      )}
    </div>
  )
}
export default HeroSlide
