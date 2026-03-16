import React from 'react'
import styles from './Dialog.module.scss'

export const Dialog = ({ children, classes = {} }) => {
  return (
    <div className={`${styles.root} ${classes.root ?? ''}`}>
      <div className={`${styles.content} ${classes.content ?? ''}`}>{children}</div>
    </div>
  )
}
