import React, { forwardRef } from 'react'
import { Dialog } from './Dialog'

import styles from './MoreInformation.module.scss'

export const MoreInformation = forwardRef(({ onClose }, ref) => {
  return (
    <Dialog ref={ref}>
      <h6 className={styles.heading}>More Information</h6>
      <p className={styles.message}>
        You are interacting with an AI‑powered virtual assistant that provides general information about Toll Brothers
        communities and homes. Responses may be inaccurate or incomplete. Please do not share personal or sensitive
        information. You may request to connect with a live Online Sales Consultant at any time.
      </p>
      <button className={styles.closeButton} onClick={onClose}>
        Close
      </button>
    </Dialog>
  )
})
