import React, { useState, useEffect } from "react";
import styles from './HeroSlide.module.scss';
import Link from "next/dist/client/link";

const HeroSlide = ({ src, alt, title, url, opacity, callBack }) => {

    const imgSrc = src;
    const overlayOpacityStyle = {
        width: "100%",
        height: "100%",
        display: "block",
        backgroundColor: "rgba(0,0,0," + opacity + ")",
        position: "absolute",
        zIndex: "0"
      };
    
    const imageLoaded = (e) => {
        if (callBack) {
            callBack();
        }
    };

    return (

        <div className={styles.imageHolder}>
            {url &&
            <Link href={url} className={styles.caption}>
                {title}
            </Link>
            }
            <div style={overlayOpacityStyle}></div>
            <img src={imgSrc} alt={alt || ""} onLoad={imageLoaded} />
        </div>
      
    );
  };
  export default HeroSlide;
