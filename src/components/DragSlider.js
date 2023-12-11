import React, { useState } from 'react'
import styles from './DragSlider.module.scss'

export const DragSlider = ({ number, setNumber, step, minValue, maxValue }) => {
    

    const handleDrag = (e) => {
        const dragTrack = document.getElementById('track');
        const trackWidth = dragTrack.offsetWidth;
        const trackRect = dragTrack.getBoundingClientRect();
        const mouseX = e.touches ? e.touches[0].clientX - trackRect.left : e.clientX - trackRect.left;
        const newValue = Math.round((mouseX / trackWidth) * (maxValue - minValue)) + minValue;
        const slideValue = Math.max(minValue, Math.min(maxValue, newValue));
        const steppededValue = Math.round(slideValue / step) * step;
        setNumber(steppededValue);        
    }

    
    return (
        <div className={styles.dragSliderWrapper}
            onMouseDown={(e) => {
                handleDrag(e);
                window.addEventListener('mousemove', handleDrag);
                window.addEventListener('mouseup', () => {
                    window.removeEventListener('mousemove', handleDrag);
                });
                
                window.addEventListener('touchstart', handleDrag);
                window.addEventListener('touchend', () => {
                    window.removeEventListener('touchmove', handleDrag);
                });
            }}
        >

            <div className={styles.track} id="track">
            
                <span 
                    className={styles.dragHandle}
                    style={{
                        left: `${((number - minValue) / (maxValue - minValue)) * 100}% ` 
                    }}
                    
                >
                </span>
            </div>
           
            
        </div>
    )

}