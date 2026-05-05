import React, { forwardRef } from 'react'
import { Dialog } from './Dialog'

import styles from './ConfirmationEndDialog.module.scss'
import { Divider } from './Divider'

export const ConfirmationEndDialog = forwardRef(
  (
    {
      message = 'Are you sure you want to end this chat?',
      onStay,
      onLeave,
      onContact,
      endButtonText = 'End Chat',
      stayButtonText = 'Continue Chat',
      isContactOption = false
    },
    ref
  ) => {
    return (
      <Dialog ref={ref}>
        <p className={styles.message}>{message}</p>
        <div className={`${styles.buttonWrapper} ${isContactOption ? styles.contactOption : ''}`}>
          {isContactOption && (
            <button className={`${styles.white} ${styles.contactButton}`} onClick={onContact}>
              <div className={styles.iconWrapper}>
                <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/oscicon-white.svg' />
              </div>
              <span>Contact Me</span>
            </button>
          )}
          <button className={`${styles.endChat} ${isContactOption ? styles.white : ''}`} onClick={onLeave}>
            {isContactOption && (
              <div className={styles.iconWrapper}>
                <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/close-white.svg' />
              </div>
            )}
            <span>{endButtonText}</span>
          </button>
          {isContactOption && <Divider />}
          <button className={`${styles.white}`} onClick={onStay}>
            {stayButtonText}
          </button>
        </div>
      </Dialog>
    )
  }
)
