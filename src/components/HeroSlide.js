import React, { useState, useRef, useEffect } from 'react'
import styles from './HeroSlide.module.scss'

const HeroSlide = ({ src, alt, title, url, opacity, callBack, Link, type }) => {
  const [isVertical, setIsVertical] = useState(false)
  const [videoSRC, setVideoSRC] = useState(null)
  const bkgdImgRef = useRef(null)
  const mainMediaRef = useRef(null)

  const isVideo = src && type?.toLowerCase().includes('video')
  const imgSrc = src
  const image920 = src && !isVideo ? src.replace('_1920.', '_920.') : src
  useEffect(() => {
    if (src && isVideo) {
      setVideoSRC(src)
    }
  }, [])

  const overlayOpacityStyle = {
    width: '100%',
    height: '100%',
    display: 'block',
    backgroundColor: 'rgba(0,0,0,' + opacity + ')',
    position: 'absolute',
    zIndex: '2'
  }

  const onMediaLoad = (e) => {
    if (!isVideo) {
      const { naturalWidth, naturalHeight } = e.target
      setIsVertical(naturalWidth < naturalHeight)
    }
    if (callBack) {
      callBack()
    }
  }

  useEffect(() => {
    ;[mainMediaRef, bkgdImgRef].forEach((imgRef) => {
      if (imgRef.current && imgRef.current.complete) {
        const { naturalWidth, naturalHeight } = imgRef.current
        setIsVertical(naturalWidth < naturalHeight)
      }
    })
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
      <div style={overlayOpacityStyle} />
      {isVideo ? (
        <video
          className={styles.modelCardVideo}
          src={videoSRC}
          autoPlay
          loop
          muted
          playsInline
          // poster={poster}
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
