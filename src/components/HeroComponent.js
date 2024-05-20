import React, { useState, useEffect, useRef } from 'react';
import styles from './HeroComponent.module.scss';
import HeroSlide from './HeroSlide';

export function HeroComponent({ children, slides, overlayOpacity, placeholderSrc, mainSrc, ...props }) {
  const [currentSlide] = useState(slides[0] || { image: '', title: '', URL: '' });
  const [nextSlide, setNextSlide] = useState();
  const [isFading, setIsFading] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const waitToFade = useRef(null);
  const flipSlides = useRef(null);

  useEffect(() => {
    if (slides.length > 1) {
      if (currentSlideIndex + 1 < slides.length) {
        setNextSlide(slides[currentSlideIndex + 1]);
      } else {
        setNextSlide(slides[0]);
      }
    }
  }, [currentSlideIndex]);

  useEffect(() => {
    clearTimeout(flipSlides.current);
    flipSlides.current = setTimeout(() => {
      setIsFading(false);
      let nextIndex = currentSlideIndex + 1;
      if (nextIndex === slides.length) {
        nextIndex = 0;
      }
      setCurrentSlideIndex(nextIndex);
    }, 1000);
  }, [currentSlide]);

  const nextImageLoaded = () => {
    // console.log("Next Image Loaded");
    clearTimeout(waitToFade.current);
    waitToFade.current = setTimeout(() => {
      // console.log("Fading in next image");
      setIsFading(true);
    }, 6000);
  };

  return (
    <div className={styles.heroContainer}>
      <div className={`${styles.imageHolder} ${styles.nextImage} ${isFading ? styles.fading : ''}`}>
        {nextSlide && (
          <HeroSlide
            src={nextSlide.image}
            alt={nextSlide.title ? nextSlide.title : ''}
            title={nextSlide.title}
            url={nextSlide.URL}
            opacity={overlayOpacity}
            callBack={nextImageLoaded}
          />
        )}
      </div>
      <div className={styles.imageHolder}>
        <HeroSlide
          src={currentSlide.image}
          alt={currentSlide.title ? currentSlide.title : ''}
          title={currentSlide.title}
          url={currentSlide.URL}
          opacity={overlayOpacity}
        />
      </div>
    </div>
  );
}
