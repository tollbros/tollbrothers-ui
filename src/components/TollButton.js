import React from 'react'
import styles from './TollButton.module.scss'

export const TollButton = ({
  children,
  onClick,
  buttonColor,
  className = '',
  type = 'button',
  disabled = false
}) => {
  let altColor = ''

  if (buttonColor == 'white') {
    altColor = styles.white
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${styles.root} ${altColor} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
