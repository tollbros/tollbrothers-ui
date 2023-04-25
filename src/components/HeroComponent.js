import React, { useState, useEffect, useRef, Fragment } from "react";
import styles from './HeroComponent.module.scss';
import Link from "next/dist/client/link";
import ProgressiveImage from "./ProgressiveImage";

export function HeroComponent ({ children, slides, overlayOpacity, placeholderSrc, mainSrc, ...props }) {
  const [currentSlide, setCurrentSlide] = useState(slides[0] || {image: '', title: '', URL: '' });
  const [nextSlideIndex, setNextSlideIndex] = useState(1);
  const [nextSlide, setNextSlide] = useState();
  const [isFading, setIsFading] = useState(false);
  // const randomIntFetchedRef = useRef(false);

  const placeholderImgURL = "data:image/png;base64,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";

  const overlayOpacityStyle = {
    width: "100%",
    height: "100%",
    display: "block",
    backgroundColor: "rgba(0,0,0," + overlayOpacity + ")",
    position: "absolute",
    zIndex: "0"
  };

  const changeSlides = () => {
    if (slides.length > 1 && nextSlide) {

      setCurrentSlide(nextSlide);

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
    if (slides.length > 1) {
      setNextSlideIndex(1);
      setNextSlide(slides[1]);
    }

    // if (randomIntFetchedRef.current) return;

    // randomIntFetchedRef.current = true;
    // let randomStartIndex = Math.floor(Math.random() * slides.length)

    // if (slides.length > 1) {
    //   setCurrentSlideIndex(randomStartIndex);
    //   setCurrentSlide(slides[randomStartIndex]);

    //   const timer = setTimeout(() => {
    //     if (randomStartIndex == (slides.length - 1)) {
    //       setNextSlideIndex(0);
    //       setNextSlide(slides[0]);
    //     } else {
    //       setNextSlideIndex(randomStartIndex + 1);
    //       setNextSlide(slides[randomStartIndex + 1]);
    //     }
    //   }, 300);

    // } else {
    //   setCurrentSlide(0);
    //   setCurrentSlide(slides[randomStartIndex]);
    // }

  }, []);

  useEffect(() => { // Handles Slideshow Timer
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setIsFading(true);
        const timer = setTimeout(() => {
          changeSlides();
          setIsFading(false);
        }, 1000);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [changeSlides]);

  return (
    <div className={styles.heroContainer}>
      <div className={styles.imageHolder}>

        {
          overlayOpacity ?
            <div style={overlayOpacityStyle}>
            </div>
          :
            <div style={styles.overlayOpacity}></div>
        }

        {
          slides.length == 1 ?
            <ProgressiveImage placeholderSrc={placeholderImgURL} src={currentSlide.image} alt={currentSlide.title ? currentSlide.title : ""} isCurrent={true} id={"frontImage"} />
          : slides.length > 1 ?
            <>
              {
                currentSlide && <ProgressiveImage placeholderSrc={placeholderImgURL} src={currentSlide.image} alt={currentSlide.title ? currentSlide.title : ""} isCurrent={true} id={"frontImage"} isFading={isFading} />
              }

              {
                nextSlide && <ProgressiveImage placeholderSrc={placeholderImgURL} src={nextSlide.image} alt={nextSlide.title ? nextSlide.title : ""} isCurrent={false} id={"backImage"} />
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
