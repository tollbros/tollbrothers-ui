import React from 'react'
import styles from './ThinkingIndicator.module.scss'

export const ThinkingIndicator = () => {
  return (
    <div className={styles.dotsContainer}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </div>
  )
}
