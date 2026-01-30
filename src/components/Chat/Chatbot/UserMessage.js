import React from 'react'
import styles from './UserMessage.module.scss'

export const UserMessage = ({ message }) => {
  return (
    <div className={styles.container}>
      <div className={styles.textWrapper}>
        <p className={styles.text}>{message}</p>
      </div>
    </div>
  )
}
