import React from 'react'
import styles from './BotMessage.module.scss'

export const BotMessage = ({ message }) => {
  return (
    <div className={styles.container}>
      <div className={styles.response}>
        <div className={styles.icon}>
          <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/chatbot-icon.svg' />
        </div>
        <p className={styles.text}>{message}</p>
      </div>
    </div>
  )
}
