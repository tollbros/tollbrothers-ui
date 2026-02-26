import React from 'react'
import styles from './ConfirmationEndDialog.module.scss'

export const ConfirmationEndDialog = ({
  message = 'Are you sure you want to end this chat?',
  onStay,
  onLeave,
  classes = {}
}) => {
  return (
    <div className={`${styles.root} ${classes.root ?? ''}`}>
      <div className={`${styles.dialog} ${classes.dialog ?? ''}`}>
        <p>{message}</p>
        <div className={styles.buttonWrapper}>
          <button className={styles.end} onClick={onLeave}>
            End Chat
          </button>
          <button className={styles.continue} onClick={onStay}>
            Continue Chat
          </button>
        </div>
      </div>
    </div>
  )
}
