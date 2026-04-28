import React from 'react'
import styles from './UserMessage.module.scss'

export const UserMessage = ({ message }) => {
  return (
    <article className={styles.container} aria-label='Your message'>
      <div className={styles.textWrapper}>
        <p className={styles.text}>{message}</p>
      </div>
    </article>
  )
}
