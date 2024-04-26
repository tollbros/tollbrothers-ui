import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './PopupModal.module.scss'

const PopupModalWrapper = ({
  animate,
  autoFocus,
  children,
  onClose,
  onCloseHandler,
  siteplan,
  show
}) => {
  const ref = useRef(null)
  useEffect(() => {
    if (show && autoFocus && ref?.current) {
      ref.current.focus()
    }
  }, [show, autoFocus, ref?.current])

  return (
    <div
      className={`
        ${styles.popupModal}
        ${show ? styles.show : ''}
        ${animate ? styles.animate : ''}
        ${siteplan ? styles.siteplan : ''}
      `}
      ref={ref}
      tabIndex={0}
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

const PopupModal = ({ children, show, onClose, siteplan, portalId }) => {
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

  if (portalId) {
    return createPortal(
      <PopupModalWrapper
        animate={animate}
        children={children}
        onClose={onClose}
        onCloseHandler={onCloseHandler}
        siteplan={siteplan}
        show={show}
        autoFocus
      />,
      document.getElementById(portalId)
    )
  }

  return (
    <PopupModalWrapper
      animate={animate}
      children={children}
      onClose={onClose}
      onCloseHandler={onCloseHandler}
      siteplan={siteplan}
      show={show}
    />
  )
}

export default PopupModal
