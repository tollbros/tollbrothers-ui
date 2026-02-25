import React from 'react'
import styles from './ConfirmationEndDialog.module.scss'

export const ConfirmationEndDialog = ({
  message = 'Are you sure you want to leave this chat?',
  onStay,
  onLeave,
  classes = {}
}) => {
  return (
    <div className={`${styles.root} ${classes.root ?? ''}`}>
      <div className={`${styles.dialog} ${classes.dialog ?? ''}`}>
        <p>{message}</p>
        <div className={styles.buttonWrapper}>
          <button onClick={onStay}>Stay</button>
          <button onClick={onLeave}>Leave</button>
        </div>
      </div>
    </div>
  )
}
