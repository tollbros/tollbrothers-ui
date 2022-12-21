import React from 'react'
import { useBlazeSlider } from 'react-blaze-slider'
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
export const useSlider = ({
  disablePagination = false,
  cascadingConfig = {}
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

  // Cascading config
  // const exampleConfig = {
  //   all: {
  //     loop: true,
  //     slidesToShow: 1,
  //   },
  //   '(min-width: 500px)': {
  //     loop: false,
  //     slidesToShow: 2,
  //   },
  //   '(min-width: 900px)': {
  //     slidesToShow: 3,
  //   },
  // }

  const sliderRef = useBlazeSlider({
    ...defaultConfig,
    ...cascadingConfig
  })

  const buttonStyle = {
    maxWidth: '40px',
    color: '#fff',
    width: '40px',
    height: '40px',
    borderRadius: '50px',
    background: '#004876',
    verticalAlign: 'middle',
    padding: '8px',
    margin: '0',
    border: 'none',
    font: 'inherit',
    cursor: 'pointer'
  }

  const controlStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'absolute',
    top: '50%',
    left: '10px',
    right: '10px',
    height: 'auto',
    transform: 'translateY(-50%)',
    zIndex: '1'
  }

  return {
    sliderRef,
    Slider: ({ children, onNext = () => {}, onPrevious = () => {} }) => (
      <div className='blaze-slider' ref={sliderRef}>
        <div className='blaze-container'>
          <div className='blaze-track-container'>
            <div className='blaze-track'>{children}</div>
          </div>
        </div>
        <div style={controlStyle} className='controls'>
          <button
            onClick={onPrevious}
            style={buttonStyle}
            className={`blaze-prev ${styles.sliderControl}}`}
          >
            <ArrowLeft fill='#fff' />
          </button>
          {!disablePagination && <div className='blaze-pagination' />}
          <button onClick={onNext} style={buttonStyle} className='blaze-next'>
            <ArrowRight fill='#fff' />
          </button>
        </div>
      </div>
    )
  }
}
