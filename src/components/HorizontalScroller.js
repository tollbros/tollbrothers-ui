import React, { useEffect } from 'react'
import { useMemo, useState, useRef } from 'react';
import styles from './HorizontalScroller.module.scss'

export const HorizontalScroller = ({ children, showArrows }) => {


    const [slideIndex, setSlideIndex] = useState(0);
    const [isPrevDisabled, setIsPrevDisabled] = useState(false);
    const [isNextDisabled, setIsNextDisabled] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const galleryRef = useRef(null);
    const slideCount = children.length;


    const handleScroll = () => {
        if (galleryRef.current) {
            setScrollPosition(galleryRef.current.scrollLeft);
        }
    };

    const handlePrev = () => {
        setSlideIndex((prevIndex) => prevIndex - 1)
    };

    const handleNext = () => {
        setSlideIndex((prevIndex) => prevIndex + 1)
        setIsPrevDisabled(false)
    };
    useEffect(() => {
        scrollPosition === 0 ? setIsPrevDisabled(true) : setIsPrevDisabled(false)
    }, [scrollPosition]);

    useEffect(() => {
        const scrollWrap = document.querySelector('.scrollWrap');
        scrollWrap.addEventListener('scroll', (e) => {
            setScrollPosition(galleryRef.current.scrollLeft);
        });
    });
    
    const transform = useMemo(() => {
        if (!slideIndex) return 3
        let i = 0
        let newValue = 0
        while (i < slideIndex) {
            newValue = newValue - 28
            i = i + 1

        }
        return newValue
    }, [slideIndex])

    

    return (
        <div className={styles.horizontalScrollWrap}>
            {showArrows && (
                <div className={styles.controls}>
                    <button onClick={handlePrev} disabled={isPrevDisabled}><img src="https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/arrowexit.svg" alt="Arrow icon" /></button>
                    <button onClick={handleNext} disabled={slideIndex === (slideCount - 1)}><img src="https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/arrowexit.svg" alt="Arrow icon" /></button>
                </div>
            )}
            <div className={styles.viewPort}>

                <div className={`${styles.scrollWrap} scrollWrap`} ref={galleryRef}>

                    {Object.keys(children).map(key => (
                        <>
                            {/* <div className={styles.scrollItem} style={{ transform: `translate3d(${transform}px, 0px, 0px)` }}>{children[key]}</div> */}
                            <div className={styles.scrollItem} style={{ transform: `translate3d(${transform}vw, 0px, 0px)` }}>{children[key]}</div>
                        </>
                    ))}

                </div>
            </div>
        </div>
    )
}
