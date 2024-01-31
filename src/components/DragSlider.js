import React, { useEffect } from 'react'

import styles from './DragSlider.module.scss'

export const DragSlider = ({ number, setNumber, step, minValue, maxValue, className, loanTerm, onSliderChange, select }) => {
   
   
    const sliderChange = (e) => {
        setNumber(e.target.value)
    }

    const handleLoanSliderChange = (e) => {
        const values = [10, 15, 20, 30];
        setNumber(e.target.value);
        
    };
  

    return (
        <div className={styles.dragSliderWrapper}>
            <div className={styles.track} id="track" >

                <input
                    className={`${styles.rangeInput} ${className}`}
                    name="minDragSlider"
                    type="range"
                    min={minValue}
                    max={maxValue}
                    step={step}
                    value={number}
                    onChange={loanTerm ? handleLoanSliderChange : sliderChange}   
                    style={{backgroundSize: `${(number - minValue) * 100 / (maxValue - minValue)}% 100%`}}                    
                />

            </div>

        </div>
    )

}