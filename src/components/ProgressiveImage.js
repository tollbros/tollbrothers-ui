import React, { useState, useEffect } from "react";
import styles from './ProgressiveImage.module.scss';

const ProgressiveImage = ({ placeholderSrc, src, alt, isCurrent, id }) => {
    const [imgSrc, setImgSrc] = useState(placeholderSrc || src);
  
    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setImgSrc(src);
        };
    }, [src]);
  
    return (
      <img
        src={imgSrc}
        alt={alt || ""}
        {
            ...isCurrent ?
                {className: `${styles.currentImage} "tracking_heroimage"`}
            :
                {className: styles.nextImage}
        }
        id={id || ""}
      />
    );
  };
  export default ProgressiveImage;