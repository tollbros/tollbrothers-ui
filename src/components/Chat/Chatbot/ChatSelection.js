import React from 'react'
import styles from './ChatSelection.module.scss'
import { Divider } from '../Divider'

export const ChatSelection = ({ onSelectAI, onSelectConsultant, chatbotIcon }) => {
  return (
    <div className={styles.root}>
      <p className={`${styles.heading} ${styles.top}`}>How would you like to connect today?</p>
      <p className={styles.subtitle}>A Toll Brothers Online Sales Consultant is available now.</p>
      <div className={styles.selectionButtons}>
        <button className={styles.button} onClick={onSelectConsultant}>
          <div className={`${styles.iconWrapper} ${styles.osc}`}>
            <img
              src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/osc-green.svg'
              alt='sales consultant icon'
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
            <img src={chatbotIcon} alt='chatbot icon' />
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
