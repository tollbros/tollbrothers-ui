import React from 'react'
import { Dialog } from './Dialog'

import styles from './ConfirmationEndDialog.module.scss'

export const ConfirmationEndDialog = ({
  message = 'Are you sure you want to end this chat?',
  onStay,
  onLeave,
  endButtonText = 'End Chat',
  stayButtonText = 'Continue Chat',
  CustomButton = null
}) => {
  return (
    <Dialog>
      <p className={styles.message}>{message}</p>
      <div className={styles.buttonWrapper}>
        {CustomButton && CustomButton}
        <button onClick={onLeave}>{endButtonText}</button>
        <button className={styles.continue} onClick={onStay}>
          {stayButtonText}
        </button>
      </div>
    </Dialog>
  )
}
