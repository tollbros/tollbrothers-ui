import React from 'react'
import styles from './ActionButton.module.scss'

export const ActionButton = ({
  children,
  onClick = () => null,
  showIcon = false
}) => {
  return (
    <button className={styles.actionButton} onClick={onClick} type='button'>
      <span className={styles.text}>{children}</span>
      {showIcon && (
        <div className={styles.iconContainer}>
          <img
            src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/up-arrow.svg'
            alt=''
            className={styles.icon}
          />
        </div>
      )}
    </button>
  )
}
