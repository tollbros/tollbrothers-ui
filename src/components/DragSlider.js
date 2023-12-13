import React from 'react'
import styles from './DragSlider.module.scss'

export const DragSlider = ({ number, setNumber, step, minValue, maxValue }) => {


const sliderChange = (e) => {
    setNumber(e.target.value)
}

    return (
        <div className={styles.dragSliderWrapper}>

            <div className={styles.track} id="track">
                <input
                    className={styles.rangeInput}
                    name="minDragSlider"
                    type="range"
                    min={minValue}
                    max={maxValue}
                    step={step}
                    defaultValue={number}
                    onInput={sliderChange}
                />                
               
            </div>


        </div>
    )

}