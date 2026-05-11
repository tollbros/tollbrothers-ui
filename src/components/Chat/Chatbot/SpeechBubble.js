import React, { useEffect, useState } from 'react'
import styles from './SpeechBubble.module.scss'

export const SpeechBubble = ({ isHidden = false, onClick }) => {
  const [animationEnded, setAnimationEnded] = useState(false)

  useEffect(() => {
    // Animation: 5s duration + 0.8s delay = 5800ms total
    const timer = setTimeout(() => {
      setAnimationEnded(true)
    }, 5800)

    return () => clearTimeout(timer)
  }, [])

  return (
    <button
      className={`${styles.root} ${isHidden ? styles.hide : ''} ${animationEnded ? styles.animationEnded : ''}`}
      onClick={onClick}
      type='button'
    >
      <p className={styles.title}>Hello, I'm AI Concierge.</p>
      <p className={styles.message}>Ask me about homes, communities, or anything you need.</p>
      <div className={styles.arrow} />
    </button>
  )
}
