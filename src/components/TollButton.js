import React, { useState, useEffect } from 'react'
import styles from './TollButton.module.scss'

export const TollButton = ({ children }) => {
  const [animate, setAnimate] = useState(false)


  return (
    <div className={styles.tollButton}>
        Button
    </div>
  )
}
