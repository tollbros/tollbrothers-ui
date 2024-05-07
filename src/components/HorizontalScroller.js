import React from 'react'
import { useState, useRef } from 'react';
import styles from './HorizontalScroller.module.scss'

export const HorizontalScroller = ({ children, showArrows }) => {
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const galleryRef = useRef(null);
  const slideRef = useRef(null);

  const handleScroll = () => {
    const gallery = galleryRef.current;
    const newPosition = gallery.scrollLeft;
    setScrollPosition(newPosition);
    scrollPosition > (gallery.scrollWidth - gallery.clientWidth - 150) ? setIsNextDisabled(true) : setIsNextDisabled(false);
    scrollPosition < 100 ? setIsPrevDisabled(true) : setIsPrevDisabled(false);
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
  

  return (
    <div className={styles.horizontalScrollWrap}>

      {showArrows && (
        <div className={styles.controls}>
          <button onClick={handlePrev} disabled={isPrevDisabled}><img src="https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/arrowexit.svg" alt="Arrow icon" /></button>
          <button onClick={handleNext} disabled={isNextDisabled}><img src="https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/arrowexit.svg" alt="Arrow icon" /></button>
        </div>
      )}

      <div className={`${styles.viewPort} viewPort`}>

        <div className={`${styles.scrollWrap} ${(children.length === 1 ? styles.noMargin : null)} scrollWrap`} ref={galleryRef} onScroll={handleScroll}>

          {Object.keys(children).map(key => (
              <div className={`${styles.scrollItem} `} ref={slideRef} key={[key]}>{children[key]}</div>
          ))}

        </div>
      </div>
    </div>
  )
}
