import React from 'react'

import styles from './DragSlider.module.scss'

export const DragSlider = ({
  number,
  setNumber,
  step,
  minValue,
  maxValue,
  className,
  onChange
}) => {
  const sliderChange = (e) => {
    setNumber(e.target.value)
    if (onChange) onChange(e.target.value)
  }

  return (
    <div className={styles.dragSliderWrapper}>
      <div className={styles.track} id='track'>
        <input
          className={`${styles.rangeInput} ${className} ada-override`}
          name='minDragSlider'
          type='range'
          min={minValue}
          max={maxValue}
          step={step}
          value={number}
          onChange={sliderChange}
          style={{
            backgroundSize: `${
              ((number - minValue) * 100) / (maxValue - minValue)
            }% 100%`
          }}
        />
      </div>
    </div>
  )
}
