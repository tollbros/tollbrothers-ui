import React from 'react'
import styles from './SpeechBubble.module.scss'

export const SpeechBubble = ({ message, isUser }) => {
  return (
    <div className={styles.root}>
      <p className={styles.title}>Hello, I'm AI Concierge.</p>
      <p className={styles.message}>Ask me about homes, communities, or anything you need.</p>
      <div className={styles.arrow} />
    </div>
  )
}
