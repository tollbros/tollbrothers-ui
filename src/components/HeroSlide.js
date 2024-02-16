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

    const image_300 = imgSrc.replace("_1920.", "_300.");
    const image_450 = imgSrc.replace("_1920.", "_450.");
    const image_600 = imgSrc.replace("_1920.", "_600.");
    const image_920 = imgSrc.replace("_1920.", "_920.");

    return (

        <div className={styles.imageHolder}>
            {url &&
            <Link href={url} className={styles.caption}>
                {title}
            </Link>
            }
            <div style={overlayOpacityStyle}></div>

            <picture>
                {/* <source media="(max-width: 300px)" srcset={image_300} />
                <source media="(max-width: 450px)" srcset={image_450} />
                <source media="(max-width: 600px)" srcset={image_600} /> */}
                <source media="(max-width: 920px)" srcset={image_920} />
                <source media="(min-width: 921px)" srcset={imgSrc} />
                <img src={image_920} alt={alt || ""} onLoad={imageLoaded}/>
            </picture>

        </div>
      
    );
  };
export default HeroSlide;