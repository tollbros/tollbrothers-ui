import React, { useState } from 'react'
import styles from './ChatSelection.module.scss'
import { Divider } from '../Divider'
import { CHATBOT_ICON, GREEN_OSC_ICON } from './constants'

export const ChatSelection = ({ onSelectAI, onSelectConsultant, chatPhoto }) => {
  const [iconSizeClass, setIconSizeClass] = useState(chatPhoto ? styles.chatPhoto : '')

  return (
    <div className={styles.root}>
      <p className={`${styles.heading} ${styles.top}`}>How would you like to connect today?</p>
      <p className={styles.subtitle}>A Toll Brothers Online Sales Consultant is available now.</p>
      <div className={styles.selectionButtons}>
        <button className={styles.button} onClick={onSelectConsultant}>
          <div className={`${styles.iconWrapper} ${styles.osc}`}>
            <img
              className={iconSizeClass}
              src={chatPhoto ?? GREEN_OSC_ICON}
              alt='chat icon'
              onError={(e) => {
                setIconSizeClass('')
                e.currentTarget.src = GREEN_OSC_ICON
              }}
            />
          </div>
          <div>
            <p className={styles.heading}>Chat with an Online Sales Consultant</p>
            <p className={styles.subtitle}>A Toll Brothers expert is online and ready to help</p>
          </div>
        </button>
        <Divider />
        <button className={styles.button} onClick={onSelectAI}>
          <div className={styles.iconWrapper}>
            <img src={CHATBOT_ICON} alt='chatbot icon' />
          </div>
          <div>
            <p className={styles.heading}>Chat with AI Concierge</p>
            <p className={styles.subtitle}>Instant answers about communities, floor plans, and pricing</p>
          </div>
        </button>
      </div>
    </div>
  )
}
