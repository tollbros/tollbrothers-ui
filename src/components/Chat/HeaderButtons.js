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
      <svg width='16' height='2' viewBox='0 0 16 2' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M0 1H16' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
      </svg>
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
