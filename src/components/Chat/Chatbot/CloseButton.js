import React from 'react'
import styles from './CloseButton.module.scss'

export const CloseButton = ({
  onClick,
  ariaLabel = 'Close',
  className = ''
}) => {
  return (
    <button
      className={`${styles.closeButton} ${className}`}
      onClick={onClick}
      type='button'
      aria-label={ariaLabel}
    >
      <svg
        width='10'
        height='10'
        viewBox='0 0 12 12'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M1 1L11 11M1 11L11 1'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </svg>
    </button>
  )
}
