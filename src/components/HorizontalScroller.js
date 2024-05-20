import React from 'react'
import { useState, useRef, useEffect } from 'react';
import styles from './HorizontalScroller.module.scss'

export const HorizontalScroller = ({ children, showArrows, className }) => {
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [showGalleryNav, setShowGalleryNav] = useState(true);
  const galleryRef = useRef(null);
  const slideRef = useRef(null);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  const handleScroll = () => {
    const gallery = galleryRef.current;
    gallery.scrollLeft > (gallery.scrollWidth - gallery.clientWidth) - 15 ? setIsNextDisabled(true) : setIsNextDisabled(false);
    gallery.scrollLeft < 20 ? setIsPrevDisabled(true) : setIsPrevDisabled(false);
  }

  const handlePrev = () => {
    const gallery = galleryRef.current;
    const slide = slideRef.current;
    gallery.scrollBy({ left: -(slide.offsetWidth + 20) }); // move gallery width of slide plus the margin for safari
  };

  const handleNext = () => {
    const gallery = galleryRef.current;
    const slide = slideRef.current;
    gallery.scrollBy({ left: (slide.offsetWidth + 20) }); // move gallery width of slide plus the margin for safari
  };

  // to detect if window is wider than gallery
  useEffect(() => {

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      windowWidth > slideRef.current.offsetWidth * children.length + (children.length * 25) ?
        setShowGalleryNav(false) : setShowGalleryNav(true);

    };

    window.addEventListener('resize', handleResize);

    handleResize();

    // remove after unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };

  });

  return (
    <div className={`${styles.horizontalScrollWrap} ${styles[className]}`}>

      {showArrows && showGalleryNav && (
        <div className={styles.controls}>
          <button onClick={handlePrev} disabled={isPrevDisabled}><img src="https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/arrowexit.svg" alt="Previous Slide" /></button>
          <button onClick={handleNext} disabled={isNextDisabled}><img src="https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/arrowexit.svg" alt="Next Slide" /></button>
        </div>
      )}

      <div className={`${styles.viewPort}`}>

        <div className={`${styles.scrollWrap} ${(children.length === 1 ? styles.noMargin : null)}`} ref={galleryRef} onScroll={handleScroll}>

          {Object.values(children).map((child) => { return (child && (<div className={`${styles.scrollItem}`} ref={slideRef} key={child.key} > {child} </div>)) })}

        </div>
      </div>
    </div>
  )
}
