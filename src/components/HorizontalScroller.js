import React, { useState, useRef, useEffect } from 'react'
import styles from './HorizontalScroller.module.scss'

export const HorizontalScroller = ({
  children,
  showArrows,
  classes = {},
  onImageClick,
  newIndex,
  getCurrentIndex = () => {}
}) => {
  const [isNextDisabled, setIsNextDisabled] = useState(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState(true)
  const [showGalleryNav, setShowGalleryNav] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const galleryRef = useRef(null)
  const slideRef = useRef([])
  // const [imageWidths, setImageWidths] = useState([])
  const handleScroll = () => {
    const gallery = galleryRef.current
    gallery.scrollLeft > gallery.scrollWidth - gallery.clientWidth - 10
      ? setIsNextDisabled(true)
      : setIsNextDisabled(false)

    gallery.scrollLeft === 0
      ? setIsPrevDisabled(true)
      : setIsPrevDisabled(false)

    let closestIndex = 0
    let closestDistance = Number.MAX_VALUE
    for (let i = 0; i < gallery.children.length; i++) {
      const distance = Math.abs(
        gallery.children[i].getBoundingClientRect().left -
          gallery.getBoundingClientRect().left
      )
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = i
      }
    }
    setCurrentIndex(closestIndex)
  }

  useEffect(() => {
    getCurrentIndex(currentIndex)
  }, [currentIndex])

  useEffect(() => {
    scrollToImage(newIndex)
  }, [newIndex])

  const handlePrev = () => {
    const gallery = galleryRef.current
    const computedStyle = window.getComputedStyle(slideRef.current)
    const marginLeft = parseFloat(computedStyle.marginLeft.split('px')[0])
    const marginRight = parseFloat(computedStyle.marginRight.split('px')[0])
    gallery.scrollBy({
      left: -(slideRef.current?.offsetWidth + (marginLeft + marginRight + 2))
    })
  }

  const handleNext = () => {
    const gallery = galleryRef.current
    const computedStyle = window.getComputedStyle(slideRef.current)
    const marginLeft = parseFloat(computedStyle.marginLeft.split('px')[0])
    const marginRight = parseFloat(computedStyle.marginRight.split('px')[0])
    gallery.scrollBy({
      left: slideRef.current?.offsetWidth + (marginLeft + marginRight + 2)
    })
  }

  const scrollToImage = (index) => {
    if (galleryRef.current) {
      // const imageWidth = galleryRef.current.firstChild.clientWidth
      let totalWidth = 0
      for (let i = 0; i < index; i++) {
        totalWidth += galleryRef.current.children[i].clientWidth
      }
      galleryRef.current.scrollTo({
        left: totalWidth,
        behavior: 'smooth'
      })
    }
  }

  // to detect if window is wider than gallery
  useEffect(() => {
    const handleResize = () => {
      window.innerWidth >= galleryRef.current?.scrollWidth
        ? setShowGalleryNav(false)
        : setShowGalleryNav(true)
    }

    window.addEventListener('resize', handleResize)

    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className={`${styles.horizontalScrollWrap} ${classes.root ?? ''} `}>
      {showArrows && showGalleryNav && (
        <div className={`${styles.controls} ${classes.controls ?? ''}`}>
          <button onClick={handlePrev} disabled={isPrevDisabled}>
            <img
              src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/arrowexit.svg'
              alt='Previous Slide'
            />
          </button>
          <button onClick={handleNext} disabled={isNextDisabled}>
            <img
              src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/arrowexit.svg'
              alt='Next Slide'
            />
          </button>
        </div>
      )}

      <div className={`${styles.viewPort}`}>
        <div
          className={`${styles.scrollWrap} ${
            children.length === 1 ? styles.noMargin : ''
          } ${classes.scrollWrap ?? ''} scrollWrap`}
          ref={galleryRef}
          onScroll={handleScroll}
        >
          {Object.values(children).map((child, index) => {
            return (
              child && (
                <div
                  className={`${styles.scrollItem} ${
                    classes.scrollItem ?? ''
                  } scrollItem`}
                  ref={slideRef}
                  key={child.key}
                  data-index={index}
                  onClick={() => onImageClick(index)}
                >
                  {' '}
                  {child}{' '}
                </div>
              )
            )
          })}
        </div>
      </div>
    </div>
  )
}
