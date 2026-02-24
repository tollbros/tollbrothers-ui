import React from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './BotMessage.module.scss'

export const BotMessage = ({ message, component }) => {
  return (
    <div className={styles.container}>
      <div className={styles.response}>
        <div className={styles.icon}>
          <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/chatbot-icon.svg' />
        </div>
        {message && (
          <div className={styles.text}>
            <ReactMarkdown>{message}</ReactMarkdown>
          </div>
        )}
        {component && <div className={styles.component}>{component}</div>}
      </div>
    </div>
  )
}
