import React from 'react'
import styles from './SpeechBubble.module.scss'

export const SpeechBubble = ({ isHidden = false }) => {
  return (
    <div className={`${styles.root} ${isHidden ? styles.hide : ''}`}>
      <p className={styles.title}>Hello, I'm AI Concierge.</p>
      <p className={styles.message}>Ask me about homes, communities, or anything you need.</p>
      <div className={styles.arrow} />
    </div>
  )
}
