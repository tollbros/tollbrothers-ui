import React from 'react'
import styles from './HeaderButtons.module.scss'

const CloseButton = ({ onClick, ariaLabel = 'Close AI Concierge', className = '' }) => {
  return (
    <button
      className={`${styles.headerButton} ${styles.buttonReset} ${styles.closeButton} ${className}`}
      aria-label={ariaLabel}
      onClick={onClick}
      type='button'
    >
      <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/close.svg' alt='' />
    </button>
  )
}

const MinimizeButton = ({ onClick, ariaLabel = 'Minimize AI Concierge', className = '' }) => {
  return (
    <button
      className={`${styles.headerButton} ${styles.buttonReset} ${className}`}
      aria-label={ariaLabel}
      onClick={onClick}
      type='button'
    >
      <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/arrow-down.svg' alt='' />
    </button>
  )
}

export const HeaderButtons = ({ onClose, onMinimize, isMinimizeHidden = false, className = '' }) => {
  return (
    <div className={`${styles.headerButtons} ${className}`}>
      {!isMinimizeHidden && <MinimizeButton onClick={onMinimize} />}
      <CloseButton onClick={onClose} />
    </div>
  )
}

export { CloseButton, MinimizeButton }
