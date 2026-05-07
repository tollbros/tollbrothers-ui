import React from 'react'
import styles from './Divider.module.scss'

export const Divider = ({ text = 'OR' }) => {
  return (
    <div className={styles.divider}>
      <span>{text}</span>
    </div>
  )
}
