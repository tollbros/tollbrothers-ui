import React, { useState, useEffect, useRef, Fragment } from "react";
import styles from './styles.module.scss';

export const HeroComponent = ({ children, slides, darkness }) => {

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(slides[0]);
  const [nextSlideIndex, setNextSlideIndex] = useState(1);
  const [nextSlide, setNextSlide] = useState();

  const changeSlides = () => {
    if (slides.length > 1 && nextSlide) {

      setCurrentSlide(nextSlide);
      setCurrentSlideIndex(nextSlideIndex);

      const timer = setTimeout(() => {
        if (nextSlideIndex == (slides.length - 1)) {
          setNextSlide(slides[0]);
          setNextSlideIndex(0);
        } else {
          setNextSlide(slides[nextSlideIndex + 1]);
          setNextSlideIndex(nextSlideIndex + 1);
        }
      }, 1000);

    }
  }

  return (
    <div className={styles.heroContainer}>
      <div className={styles.imageHolder}>

        {
          darkness ?
            <div className={styles.darkness}></div>
          :
            null
        }

        {
          slides.length == 1 ?
            <img src={currentSlide.image} alt={currentSlide.title ? currentSlide.title : ""} loading="lazy" />
          : slides.length > 1 ?
            <>
              
              {
                currentSlide && <img src={currentSlide.image} alt={currentSlide.title ? currentSlide.title : ""} loading="lazy" id="frontImage" className={styles.currentImage} />
              }

              {
                nextSlide && <img src={nextSlide.image} alt={nextSlide.title ? nextSlide.title : ""} loading="lazy" id="backImage" className={styles.nextImage} />
              }

            </>
          :
            null
        }

      </div>
      
      {
        console.log(slides)
      }

    </div>
  )
}

// Using this tutorial to make components:
// https://triveniglobalsoft.com/how-to-publish-a-custom-react-component-to-npm-using-create-react-library/