import React, { useState, useEffect } from "react";
import styles from './ProgressiveImage.module.scss';

const ProgressiveImage = ({ src, alt, isCurrent, id, isFading = false }) => {
    const [imgSrc, setImgSrc] = useState(src);

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
                {className: `${styles.currentImage} ${isFading && styles.fadeIn} tracking_heroimage`}
            :
                {className: styles.nextImage}
        }
        id={id || ""}
      />
    );
  };
  export default ProgressiveImage;
