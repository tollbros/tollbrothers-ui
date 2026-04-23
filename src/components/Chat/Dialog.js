import React, { forwardRef } from 'react'
import styles from './Dialog.module.scss'

export const Dialog = forwardRef(({ children, classes = {}, ariaLabel = 'Dialog' }, ref) => {
  return (
    <div className={`${styles.root} ${classes.root ?? ''}`} role='dialog' aria-modal='true' aria-label={ariaLabel} ref={ref}>
      <div className={`${styles.content} ${classes.content ?? ''}`}>{children}</div>
    </div>
  )
})
