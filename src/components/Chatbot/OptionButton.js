import React from 'react'
import styles from './OptionButton.module.scss'

export const OptionButton = ({ text, onClick, size = '' }) => {
  return (
    <button
      className={`${styles.option} ${styles[size] ?? ''}`}
      onClick={onClick}
    >
      {text}
    </button>
  )
}
