import React, { useState } from 'react'
import styles from './HeroSlide.module.scss'
import Link from 'next/dist/client/link'

const HeroSlide = ({ src, alt, title, url, opacity, callBack }) => {
  const [isVertical, setIsVertical] = useState(false)

  const imgSrc = src
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

  const image920 = imgSrc.replace('_1920.', '_920.')

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
          />
        </picture>
      )}
    </div>
  )
}
export default HeroSlide
