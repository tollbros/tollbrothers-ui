import React, { useState, useEffect, useRef, Fragment } from "react";
import styles from './HeroComponent.module.scss';
import Link from "next/dist/client/link";

export function HeroComponent ({ children, slides, darkness, test }) {

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState({image: '', title: '', URL: '' });
  const [nextSlideIndex, setNextSlideIndex] = useState(1);
  const [nextSlide, setNextSlide] = useState();
  const [imageLoaded, setImageLoaded] = useState(false);
  const randomIntFetchedRef = useRef(false);
  
  const darknessStyle = {
    width: "100%",
    height: "100%",
    display: "block",
    backgroundColor: "rgba(0,0,0," + darkness + ")",
    position: "absolute",
    zIndex: "0"
  };

  const changeImageLoaded = () => {
    console.log("Image has loaded!")
    setImageLoaded(true);
  }

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

  useEffect(() => { // Handles On Load
    if (randomIntFetchedRef.current) return;

    randomIntFetchedRef.current = true;
    if (slides.length > 1) {
      
      let randomStartIndex = Math.floor(Math.random() * slides.length)

      console.log("setting random start")
      setCurrentSlideIndex(randomStartIndex);
      setCurrentSlide(slides[randomStartIndex]);

      const timer = setTimeout(() => {
        console.log("back image loaded!!!!!")
        if (randomStartIndex == (slides.length - 1)) {
          setNextSlideIndex(0);
          setNextSlide(slides[0]);
        } else {
          setNextSlideIndex(randomStartIndex + 1);
          setNextSlide(slides[randomStartIndex + 1]);
        }
      }, 300);

    }
  }, []);

  useEffect(() => { // Handles Slideshow Timer
    if (slides.length > 1) {
      console.log('timer restart')
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
  }, [imageLoaded, changeSlides]);

  return (
    <div className={styles.heroContainer}>
      <div className={styles.imageHolder}>

        {
          darkness ?
            <div style={darknessStyle}>
            </div>
          :
            <div style={styles.darkness}></div>
        }

        {
          slides.length == 1 ?
            <img src={currentSlide.image} alt={currentSlide.title ? currentSlide.title : ""} loading="lazy" />
          : slides.length > 1 ?
            <>

              {
                currentSlide && <img src={currentSlide.image} alt={currentSlide.title ? currentSlide.title : ""} loading="lazy" id="frontImage" className={styles.currentImage} onLoad={changeImageLoaded} />
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
          <Link href={currentSlide.URL} className={styles.caption}>
            {currentSlide.title}
          </Link>
        :
          null
      }

    </div>
  )
}

// Using this tutorial to make components:
// https://triveniglobalsoft.com/how-to-publish-a-custom-react-component-to-npm-using-create-react-library/
