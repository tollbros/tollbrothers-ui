import React, { useState, useRef, useEffect } from 'react'
import styles from './HeroSlide.module.scss'
// import Link from 'next/dist/client/link'

const HeroSlide = ({
  src,
  alt,
  title,
  url,
  opacity,
  callBack,
  Link = <></>
}) => {
  const [isVertical, setIsVertical] = useState(false)

  const mainImgRef = useRef(null)
  const bkgdImgRef = useRef(null)

  const imgSrc = src
  const image920 = imgSrc.replace('_1920.', '_920.')

  const overlayOpacityStyle = {
    width: '100%',
    height: '100%',
    display: 'block',
    backgroundColor: 'rgba(0,0,0,' + opacity + ')',
    position: 'absolute',
    zIndex: '2'
  }

  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target
    setIsVertical(naturalWidth < naturalHeight)

    if (callBack) {
      callBack()
    }
  }

  useEffect(() => {
    ;[mainImgRef, bkgdImgRef].forEach((imgRef) => {
      if (imgRef.current && imgRef.current.complete) {
        const { naturalWidth, naturalHeight } = imgRef.current
        setIsVertical(naturalWidth < naturalHeight)
      }
    })
  }, [onImageLoad])

  return (
    <div
      className={`${styles.imageHolder} ${isVertical ? styles.vertical : null}`}
    >
      {url && (
        <Link href={url} className={styles.caption}>
          {title}
        </Link>
      )}
      <div style={overlayOpacityStyle} />

      <picture>
        <source media='(max-width: 920px)' srcSet={image920} />
        <source media='(min-width: 921px)' srcSet={imgSrc} />
        <img
          className={styles.modelCardImg}
          src={image920}
          alt={alt || ''}
          onLoad={onImageLoad}
          ref={mainImgRef}
        />
      </picture>

      {isVertical && (
        <picture>
          <source media='(max-width: 920px)' srcSet={image920} />
          <source media='(min-width: 921px)' srcSet={imgSrc} />
          <img
            className={styles.modelCardImgBG}
            src={image920}
            alt={alt || ''}
            onLoad={onImageLoad}
            ref={bkgdImgRef}
          />
        </picture>
      )}
    </div>
  )
}
export default HeroSlide
