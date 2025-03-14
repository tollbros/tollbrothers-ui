import React, { useEffect, Children } from 'react'
import BlazeSlider from 'blaze-slider'
import ArrowLeft from '../icons/ArrowLeft'
import ArrowRight from '../icons/ArrowRight'
import styles from './Slider.module.scss'

const TRANSITION_DURATION = 500

/**
 * Slider component
 * @param cascadingConfig - write any kind of config and even mix and match - just like how you would write a CSS media query.
 * @param mediaList - list of media.
 * @param disablePagination - disable pagination.
 * @param onNext - fires when next button is clicked.
 * @param onPrevious - fires when previous button is clicked.
 * @returns {JSX.Element}
 * @constructor
 */
const Slider = ({
  children,
  mediaList = [],
  disablePagination = false,
  cascadingConfig = {},
  onNext = () => {},
  onPrevious = () => {},
  disableSlider = false,
  disableZoom,
  setIsZoomedIn = () => null,
  isZoomedInRef
}) => {
  const enableControls = Children.count(children) > 1
  const defaultConfig = {
    all: {
      slidesToShow: 1,
      slidesToScroll: 1,
      slideGap: '20px',
      loop: true,
      enableAutoplay: false,
      stopAutoplayOnInteraction: true,
      autoplayInterval: 3000,
      autoplayDirection: 'to left',
      enablePagination: false,
      transitionDuration: TRANSITION_DURATION,
      transitionTimingFunction: 'ease',
      draggable: disableZoom
    }
  }

  const refTracker = React.useRef()
  const sliderRef = React.useRef()
  const canSlide = React.useRef(true)
  const timer = React.useRef(null)

  const moveSlide = (direction, isManual) => {
    canSlide.current = false
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      canSlide.current = true
    }, TRANSITION_DURATION + 50)

    setIsZoomedIn(false)
    isZoomedInRef.current = false

    if (direction === 'next') {
      if (isManual) refTracker.current.next()
      onNext({
        mediaList,
        slideIndex: sliderRef?.current?.blazeSlider?.stateIndex
      })
    } else {
      if (isManual) refTracker.current.prev()
      onPrevious({
        mediaList,
        slideIndex: sliderRef?.current?.blazeSlider?.stateIndex
      })
    }
  }

  useEffect(() => {
    // if not already initialized
    if (!refTracker.current && !disableSlider) {
      const config = {
        ...defaultConfig,
        ...cascadingConfig
      }
      refTracker.current = new BlazeSlider(sliderRef.current, config)
    }
  }, [])

  useEffect(() => {
    const sliderElement = sliderRef.current
    let startX = 0
    let swipeDirection = null
    let mouseDown = null
    const screenWidth = window.innerWidth
    let threshold = 40 // Minimum distance in pixels to detect swipe

    if (screenWidth >= 1200) {
      threshold = 120
    } else if (screenWidth >= 800) {
      threshold = 90
    }

    const handleTouchStart = (e) => {
      startX = e.touches?.[0]?.clientX || e.clientX
      if (e.type === 'mousedown') mouseDown = true
    }

    const handleTouchEnd = () => {
      swipeDirection = null
      mouseDown = null
    }

    const handleTouchCancel = () => {
      swipeDirection = null
      mouseDown = null
    }

    const handleTouchMove = (e) => {
      const isMouseEvent = e.type === 'mousemove'
      const currentX = e.touches?.[0]?.clientX || e.clientX
      const difference = currentX - startX

      if (
        Math.abs(difference) > threshold &&
        canSlide.current &&
        ((isMouseEvent && mouseDown) ||
          (!isMouseEvent && e.touches?.length === 1))
      ) {
        const newDirection = difference > 0 ? 'right' : 'left'
        if (newDirection !== swipeDirection) {
          swipeDirection = newDirection
          if (swipeDirection === 'left') {
            if (!isZoomedInRef.current) {
              moveSlide('next', true)
            }
          } else if (swipeDirection === 'right') {
            if (!isZoomedInRef.current) moveSlide('prev', true)
          }
        }
      } else if (swipeDirection !== null) {
        swipeDirection = null
      }
    }

    const handleResize = () => {
      setIsZoomedIn(false)
      isZoomedInRef.current = false
    }

    if (!disableZoom) {
      sliderElement.addEventListener('touchstart', handleTouchStart)
      sliderElement.addEventListener('touchmove', handleTouchMove)
      sliderElement.addEventListener('touchend', handleTouchEnd)
      sliderElement.addEventListener('touchcancel', handleTouchCancel)
      sliderElement.addEventListener('mousedown', handleTouchStart)
      sliderElement.addEventListener('mousemove', handleTouchMove)
      sliderElement.addEventListener('mouseup', handleTouchEnd)
      window.addEventListener('resize', handleResize)
    }

    return () => {
      sliderElement.removeEventListener('touchstart', handleTouchStart)
      sliderElement.removeEventListener('touchmove', handleTouchMove)
      sliderElement.removeEventListener('touchend', handleTouchEnd)
      sliderElement.removeEventListener('touchcancel', handleTouchCancel)
      sliderElement.removeEventListener('mousedown', handleTouchStart)
      sliderElement.removeEventListener('mousemove', handleTouchMove)
      sliderElement.removeEventListener('mouseup', handleTouchEnd)
      window.removeEventListener('resize', handleResize)
      canSlide.current = true
    }
  }, [])

  return (
    <div className={`blaze-slider ${styles.fullscreen}`} ref={sliderRef}>
      <div className={`blaze-container ${styles.fullscreen}`}>
        <div className={`blaze-track-container ${styles.fullscreen}`}>
          <div
            className={`${!disableSlider ? 'blaze-track' : ''} ${
              styles.fullscreen
            }`}
          >
            {children}
          </div>
        </div>
      </div>
      {enableControls && (
        <div className={`controls ${styles.controls}`}>
          <button
            onClick={() => moveSlide('prev')}
            className={`blaze-prev ${styles.button}`}
          >
            <ArrowLeft fill='#fff' />
          </button>
          {!disablePagination && <div className='blaze-pagination' />}
          <button
            onClick={() => moveSlide('next')}
            className={`blaze-next ${styles.button}`}
          >
            <ArrowRight fill='#fff' />
          </button>
        </div>
      )}
    </div>
  )
}

export default Slider
