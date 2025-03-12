import React, { useEffect, Children, useState, useRef, use } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
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
  disableZoom = false
}) => {
  const [draggable, setDraggable] = useState(true)
  const transformComponentRef = useRef(null)

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
      draggable: draggable
    }
  }

  const refTracker = React.useRef()
  const sliderRef = React.useRef()

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
    if (refTracker.current) {
      if (!draggable) {
        console.log('destroy!!!!')
        refTracker.current.destroy()
        // refTracker.current.refresh()
      } else {
        // console.log('redo')
        const config = {
          ...defaultConfig,
          ...cascadingConfig
        }
        refTracker.current = new BlazeSlider(sliderRef.current, config)
        refTracker.current.refresh()
      }

      // console.log(refTracker.current)
      // refTracker.current.destroy()
      // const config = {
      //   ...defaultConfig,
      //   ...cascadingConfig
      // }
      // console.log(config)
      // refTracker.current = new BlazeSlider(sliderRef.current, config)
      // console.log(sliderRef?.current?.blazeSlider?.stateIndex)
      // refTracker.current.next(sliderRef?.current?.blazeSlider?.stateIndex - 1)
      // refTracker.current.refresh()
      // console.log(refTracker.current)
      // refTracker.current.config.draggable = draggable
      // refTracker.current.passedConfig.all.draggable = draggable
      // // refTracker.current.refresh()
      // refTracker.current.destroy()
      // console.log('not draggable')
    }
  }, [draggable])

  useEffect(() => {
    //  listenter for 2 fingers down
    // const handleTouchStart = (event) => {
    //   // event.preventDefault()
    //   console.log('touch start')
    //   console.log(event.touches)
    //   event.preventDefault()
    //   if (event.touches?.length === 2) {
    //     console.log('2 fingers down')
    //     setDraggable(false)
    //     refTracker.current.destroy()
    //     // refTracker.current.refresh()
    //     console.log(refTracker.current)
    //   }
    // }
    // const images = document.querySelectorAll('.react-transform-wrapper img')
    // // console.log(images)
    // // iterate over dom node list
    // images.forEach((image) => {
    //   image.addEventListener('touchmove', handleTouchStart)
    // })
    // sliderRef.current.addEventListener('touchmove', handleTouchStart)
  }, [])

  return (
    <div
      className={`blaze-slider ${styles.fullscreen} ${
        !draggable ? styles.disablePanning : ''
      }`}
      ref={sliderRef}
    >
      <TransformWrapper
        ref={transformComponentRef}
        initialScale={1}
        centerOnInit
        centerZoomedOut
        limitToBounds
        // minScale={1}
        disabled={disableZoom}
        panning={{ disabled: draggable }}
        onZoomStart={(ref, event) => {
          setDraggable(false)
        }}
        onZoomStop={(ref, _event) => {
          if (ref?.state?.scale > 1) {
            setDraggable(false)
          } else {
            setDraggable(true)
          }
        }}
      >
        <TransformComponent
          wrapperClass={styles.transformWrapper}
          contentClass={styles.transformContentClass}
        >
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
        </TransformComponent>
      </TransformWrapper>
      {enableControls && (
        <div className={`controls ${styles.controls}`}>
          <button
            onClick={() => {
              transformComponentRef.current.resetTransform()
              setTimeout(() => setDraggable(true), TRANSITION_DURATION)
              onPrevious({
                mediaList,
                slideIndex: sliderRef?.current?.blazeSlider?.stateIndex
              })
            }}
            className={`blaze-prev ${styles.button}`}
          >
            <ArrowLeft fill='#fff' />
          </button>
          {!disablePagination && <div className='blaze-pagination' />}
          <button
            onClick={() => {
              transformComponentRef.current.resetTransform()
              setTimeout(() => setDraggable(true), TRANSITION_DURATION)
              onNext({
                mediaList,
                slideIndex: sliderRef?.current?.blazeSlider?.stateIndex
              })
            }}
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
