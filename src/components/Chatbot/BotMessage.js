import React from 'react'
import styles from './BotMessage.module.scss'

export const BotMessage = ({ message, component }) => {
  return (
    <div className={styles.container}>
      <div className={styles.response}>
        <div className={styles.icon}>
          <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/chatbot-icon.svg' />
        </div>
        {message && <p className={styles.text}>{message}</p>}
        {component && <div className={styles.component}>{component}</div>}
      </div>
    </div>
  )
}
