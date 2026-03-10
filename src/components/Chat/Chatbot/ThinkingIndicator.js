import React from 'react'
import styles from './ThinkingIndicator.module.scss'

export const ThinkingIndicator = ({ classes = {} }) => {
  console.log('root: ', classes.root)

  return (
    <div className={`${styles.dotsContainer} ${classes.root || ''}`}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </div>
  )
}
