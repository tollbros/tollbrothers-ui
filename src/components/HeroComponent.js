import React, { useState, useEffect, useRef } from 'react'
import styles from './HeroComponent.module.scss'
import HeroSlide from './HeroSlide'

export function HeroComponent({
  children,
  slides,
  placeholderSrc,
  overlayOpacity,
  mainSrc,
  Link,
  ...props
}) {
  const slidesRef = useRef(slides)
  const [currentSlide, setCurrentSlide] = useState(
    slides[0] || { image: '', title: '', URL: '' }
  )
  const [nextSlide, setNextSlide] = useState()
  const [isFading, setIsFading] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const waitToFade = useRef(null)
  const flipSlides = useRef(null)

  const flipSlidesTimeout = () => {
    clearTimeout(flipSlides.current)
    const slidesArray = window.toll.heroComponentSlides || slidesRef.current
    window.toll.isHeroComponentFlipping = true

    if (window.toll.debugHeroComponent) {
      console.log('Flipping slides', slidesArray)
    }

    flipSlides.current = setTimeout(() => {
      setIsFading(false)
      let nextIndex = currentSlideIndex + 1
      if (nextIndex >= slidesArray.length) {
        nextIndex = 0
      }
      setCurrentSlideIndex(nextIndex)
      window.toll.isHeroComponentFlipping = false

      if (window.toll.debugHeroComponent) {
        console.log('Flipping slides done')
      }
    }, 1000)
  }

  const nextImageLoaded = () => {
    if (window.toll.debugHeroComponent) {
      console.log('Next image loaded')
    }
    clearTimeout(waitToFade.current)
    waitToFade.current = setTimeout(() => {
      if (window.toll.debugHeroComponent) {
        console.log('Fading in next image')
      }
      setIsFading(true)
      // eslint-disable-next-line no-unused-vars
      const flipSlides = setTimeout(() => {
        if (window.toll.debugHeroComponent) {
          console.log('Changing slides')
        }

        if (nextSlide) {
          if (window.toll.debugHeroComponent) {
            console.log('Setting current slide to next slide')
          }
          setCurrentSlide(nextSlide)
          flipSlidesTimeout()
        }
      }, 2000)
    }, 6000)
  }

  useEffect(() => {
    if (!window.toll) {
      window.toll = {}
    }

    window.toll.heroComponentSlides = null
    window.toll.isHeroComponentFlipping = false

    if (window.toll.debugHeroComponent) {
      console.log('Hero component mounted')
    }

    return () => {
      clearTimeout(flipSlides.current)
      clearTimeout(waitToFade.current)
      // We want this to persist since SPA
      // delete window.toll.heroComponentSlides // Cleanup when component unmounts
      delete window.toll.isHeroComponentFlipping // Cleanup when component unmounts
    }
  }, [])

  useEffect(() => {
    const slidesArray = window.toll.heroComponentSlides || slidesRef.current

    if (slidesArray?.length > 1) {
      if (currentSlideIndex + 1 < slidesArray?.length) {
        setNextSlide(slidesArray[currentSlideIndex + 1])
      } else {
        setNextSlide(slidesArray[0])
      }
    }
  }, [currentSlideIndex])

  return (
    <div className={styles.heroContainer}>
      <div
        className={`${styles.mediaHolder} ${styles.nextImage} ${
          isFading ? styles.fading : ''
        }`}
      >
        {nextSlide && (
          <HeroSlide
            src={nextSlide.image}
            alt={nextSlide.title ? nextSlide.title : ''}
            title={nextSlide.title}
            opacity={overlayOpacity}
            url={nextSlide.URL}
            callBack={nextImageLoaded}
            Link={Link}
          />
        )}
      </div>
      <div className={styles.mediaHolder}>
        <HeroSlide
          src={currentSlide.image}
          alt={currentSlide.title ? currentSlide.title : ''}
          title={currentSlide.title}
          url={currentSlide.URL}
          opacity={overlayOpacity}
          Link={Link}
          type={currentSlide.type}
          poster={currentSlide.poster}
        />
      </div>
    </div>
  )
}
