import React from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './BotMessage.module.scss'

export const BotMessage = ({ message, component, outsideComponent }) => {
  return (
    // BotMessage.js
    <article className={styles.container} aria-label='AI Conceirge message'>
      <div className={styles.response}>
        <div className={styles.icon}>
          <img
            src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/chatbot-icon.svg'
            alt=''
            aria-hidden='true'
          />
        </div>
        {message && (
          <div className={styles.text}>
            <ReactMarkdown>{message}</ReactMarkdown>
          </div>
        )}
        {component && <div className={styles.component}>{component}</div>}
      </div>
      {outsideComponent && <div className={styles.outsideComponent}>{outsideComponent}</div>}
    </article>
  )
}
