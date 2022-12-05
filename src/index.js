import React, { useState, useEffect, useRef, Fragment } from "react";
import styles from './styles.module.scss';
import Link from "next/dist/client/link";

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

  useEffect(() => { // Handles Random Start Index
    if (slides.length > 1) {

      let randomStartIndex = Math.floor(Math.random() * slides.length)

      setCurrentSlideIndex(randomStartIndex);
      setCurrentSlide(slides[randomStartIndex]);

      if (randomStartIndex == (slides.length - 1)) {
        setNextSlideIndex(0);
        setNextSlide(slides[0]);
      } else {
        setNextSlideIndex(randomStartIndex + 1);
        setNextSlide(slides[randomStartIndex + 1]);
      }

    }
  }, []);

  useEffect(() => { // Handles Slideshow Timer
    if (slides.length > 1) {

      let fader = document.getElementById("frontImage");
      const interval = setInterval(() => {
        
        fader.classList.add(styles.fadeIn);

        const timer = setTimeout(() => {
          changeSlides();
          fader.classList.remove(styles.fadeIn);
        }, 1000);
        
      }, 10000);
      return () => clearInterval(interval);

    }
  }, [changeSlides]);

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
        slides.length > 0 && currentSlide.URL && currentSlide.title ?
          <Link href={currentSlide.URL}>
            <a className={styles.caption} title={currentSlide.title}>
              {currentSlide.title}
            </a>
          </Link>
        :
          null
      }

    </div>
  )
}

// Using this tutorial to make components:
// https://triveniglobalsoft.com/how-to-publish-a-custom-react-component-to-npm-using-create-react-library/