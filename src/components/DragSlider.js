import React, { useState } from 'react'
import styles from './DragSlider.module.scss'

export const DragSlider = ({ number, setNumber, step, minValue, maxValue }) => {

    const onInputHandler = (event) => {
        const dragValue = event.target.value;
        setNumber(dragValue);
    }

    return (
        <div className={styles.dragSliderWrapper} >

            <div className={styles.track} id="track">
                <input
                    className={styles.rangeInput}
                    name="minDragSlider"
                    type="range"
                    min={minValue}
                    max={maxValue}
                    step={step}
                    defaultValue={number}
                    onInput={onInputHandler}
                />                
            </div>

        </div>
    )

}