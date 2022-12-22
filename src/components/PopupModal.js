import React, { useState, useEffect } from 'react'
import styles from './PopupModal.module.scss'

const PopupModal = ({ children, show, onClose, siteplan }) => {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (show) {
      setAnimate(true)
    }

    if (!show && show !== null && !onClose) {
      onCloseHandler()
    }
  }, [show])

  const onCloseHandler = () => {
    setAnimate(false)
    if (onClose) onClose()
  }

  return (
    <div
      className={`
        ${styles.popupModal}
        ${show ? styles.show : ''}
        ${animate ? styles.animate : ''}
        ${siteplan ? styles.siteplan : ''}
      `}
    >
      {children}
      {onClose && (
        <button
          className={`${styles.closeButton} clear-styles closeButton`}
          onClick={onCloseHandler}
        />
      )}
    </div>
  )
}

export default PopupModal
