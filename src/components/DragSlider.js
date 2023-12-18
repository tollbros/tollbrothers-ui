import React from 'react'
import styles from './DragSlider.module.scss'

export const DragSlider = ({ number, setNumber, step, minValue, maxValue }) => {


const sliderChange = (e) => {
    setNumber(e.target.value)
}

const sliderClick = (e) => {
        const trackWidth = e.target.clientWidth;
        const clickSpot = e.clientX - e.target.getBoundingClientRect().left;
        const value = (clickSpot / trackWidth) * 100;
        console.log(value);
        setNumber(value);
}

    return (
        <div className={styles.dragSliderWrapper}>

            <div className={styles.track} id="track" >
                 
                <input
                    className={styles.rangeInput}
                    name="minDragSlider"
                    type="range"
                    min={minValue}
                    max={maxValue}
                    step={step}
                    defaultValue={number}
                    onInput={sliderChange}
                    //onClick={sliderClick}
                />                
               
            </div>

        </div>
    )

}