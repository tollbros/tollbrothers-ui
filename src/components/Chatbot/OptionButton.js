import React from 'react'
import styles from './OptionButton.module.scss'

export const OptionButton = ({ text, onClick = () => null, size = '' }) => {
  return (
    <button
      className={`${styles.option} ${styles[size] ?? ''}`}
      onClick={onClick}
      type='button'
    >
      {text}
    </button>
  )
}
