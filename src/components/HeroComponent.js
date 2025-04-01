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

  const prepareHeroSlides = (slides, onlineStatus) => {
    return slides
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value)
      .filter((slide) => {
        if (!onlineStatus) return true

        if (
          slide.mcid &&
          onlineStatus.some(
            (com) => com.masterCommunityId === slide.mcid && com.online
          )
        ) {
          return true
        } else if (
          slide.cid &&
          onlineStatus.some(
            (com) => com.communityId === slide.cid && com.online
          )
        ) {
          return true
        }

        return false
      })
  }

  const setHeroSlides = (newSlides) => {
    if (!Array.isArray(newSlides)) {
      console.error('setHeroSlides must be called with an array of slides')
      return
    }

    if (newSlides.length < 3) {
      console.error('setHeroSlides must be called with at least three slides')
      return
    }

    const errors = newSlides
      .map((slide) => {
        if (
          typeof slide.URL !== 'string' ||
          typeof slide.image !== 'string' ||
          typeof slide.title !== 'string'
        ) {
          return 'Each slide must have a URL, image, and title property'
        }

        return null
      })
      .filter((error) => error !== null)

    if (errors.length > 0) {
      console.error(errors)
      return
    }

    const preparedNewSlides = prepareHeroSlides(newSlides).map((slide) => {
      if (slide.city && slide.state) {
        return {
          ...slide,
          title: `${slide.title} in ${slide.city}, ${slide.state}`
        }
      }

      return slide
    })

    slidesRef.current = preparedNewSlides
  }

  useEffect(() => {
    if (!window.toll) {
      window.toll = {}
    }

    window.toll.setHeroSlides = setHeroSlides
    window.toll.isHeroComponentFlipping = false

    return () => {
      clearTimeout(flipSlides.current)
      clearTimeout(waitToFade.current)
      delete window.toll.setHeroSlides // Cleanup when component unmounts
      delete window.toll.isHeroComponentFlipping // Cleanup when component unmounts
    }
  }, [])

  useEffect(() => {
    const slidesArray = slidesRef.current

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
