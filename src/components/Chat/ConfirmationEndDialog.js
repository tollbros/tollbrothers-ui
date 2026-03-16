import React from 'react'
import { Dialog } from './Dialog'

import styles from './ConfirmationEndDialog.module.scss'

export const ConfirmationEndDialog = ({ message = 'Are you sure you want to end this chat?', onStay, onLeave }) => {
  return (
    <Dialog>
      <p className={styles.message}>{message}</p>
      <div className={styles.buttonWrapper}>
        <button onClick={onLeave}>End Chat</button>
        <button className={styles.continue} onClick={onStay}>
          Continue Chat
        </button>
      </div>
    </Dialog>
  )
}
