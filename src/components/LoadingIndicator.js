import React from 'react'
import styles from './LoadingIndicator.module.scss'
import usePageLoading from '../hooks/usePageLoading'

export const LoadingIndicator = () => {
  const { isPageLoading } = usePageLoading()

  if (!isPageLoading) {
    return null
  }

  return (
    <div className={`${styles['loader-5']} ${styles.center}`}>
      <span />
    </div>
  )
}
