import React, { useEffect } from 'react'
import BlazeSlider from 'blaze-slider'
import ArrowLeft from '../icons/ArrowLeft'
import ArrowRight from '../icons/ArrowRight'
import styles from './Slider.module.scss'

/**
 * Slider component
 * @param cascadingConfig - write any kind of config and even mix and match - just like how you would write a CSS media query.
 * @param disablePagination - disable pagination.
 * @returns {JSX.Element}
 * @constructor
 */
const Slider = ({
  children,
  disablePagination = false,
  cascadingConfig = {},
  onNext = () => {},
  onPrevious = () => {}
}) => {
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
      enablePagination: !disablePagination,
      transitionDuration: 500,
      transitionTimingFunction: 'ease'
    }
  }
  const refTracker = React.useRef()
  const sliderRef = React.useRef()
  useEffect(() => {
    // if not already initialized
    if (!refTracker.current) {
      const config = {
        ...defaultConfig,
        ...cascadingConfig
      }
      refTracker.current = new BlazeSlider(sliderRef.current, config)
    }
  }, [])
  return (
    <div className={`blaze-slider ${styles.fullscreen}`} ref={sliderRef}>
      <div className={`blaze-container ${styles.fullscreen}`}>
        <div className={`blaze-track-container ${styles.fullscreen}`}>
          <div className={`blaze-track ${styles.fullscreen}`}>{children}</div>
        </div>
      </div>
      <div className={`controls ${styles.controls}`}>
        <button onClick={onPrevious} className={`blaze-prev ${styles.button}`}>
          <ArrowLeft fill='#fff' />
        </button>
        {!disablePagination && <div className='blaze-pagination' />}
        <button onClick={onNext} className={`blaze-next ${styles.button}`}>
          <ArrowRight fill='#fff' />
        </button>
      </div>
    </div>
  )
}

export default Slider
