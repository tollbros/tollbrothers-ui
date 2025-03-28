import React, { useState, useEffect, useRef } from 'react'
import styles from './HeroComponent.module.scss'
import HeroSlide from './HeroSlide'

export function HeroComponent({
  children,
  slides,
  overlayOpacity,
  placeholderSrc,
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

  useEffect(() => {
    if (slidesRef?.current?.length > 1) {
      if (currentSlideIndex + 1 < slidesRef?.current?.length) {
        setNextSlide(slidesRef.current[currentSlideIndex + 1])
      } else {
        setNextSlide(slidesRef.current[0])
      }
    }
  }, [currentSlideIndex])

  const flipSlidesTimeout = () => {
    clearTimeout(flipSlides.current)
    window.toll.isHeroComponentFlipping = true
    // console.log('Flipping slides')

    flipSlides.current = setTimeout(() => {
      setIsFading(false)
      let nextIndex = currentSlideIndex + 1
      if (nextIndex >= slidesRef.current.length) {
        nextIndex = 0
      }
      setCurrentSlideIndex(nextIndex)
      window.toll.isHeroComponentFlipping = false
      // console.log('Flipping slides done')
    }, 1000)
  }

  const nextImageLoaded = () => {
    // console.log("Next Image Loaded");
    clearTimeout(waitToFade.current)
    waitToFade.current = setTimeout(() => {
      // console.log("Fading in next image");
      setIsFading(true)
      // eslint-disable-next-line no-unused-vars
      const flipSlides = setTimeout(() => {
        // console.log("Changing slides");
        if (nextSlide) {
          // console.log("Setting current slide to next slide");
          setCurrentSlide(nextSlide)
          flipSlidesTimeout()
        }
      }, 2000)
    }, 6000)
  }

  const swapSlides = (newSlides) => {
    if (window.toll.isHeroComponentFlipping) {
      console.log('Flipping slides, please wait')
      return
    }
    slidesRef.current = newSlides
  }

  useEffect(() => {
    if (!window.toll) {
      window.toll = {}
    }

    window.toll.swapHeroComponentSlides = swapSlides
    window.toll.isHeroComponentFlipping = false

    return () => {
      clearTimeout(flipSlides.current)
      clearTimeout(waitToFade.current)
      delete window.swapHeroComponentSlides // Cleanup when component unmounts
    }
  }, [])

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
            url={nextSlide.URL}
            opacity={overlayOpacity}
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
