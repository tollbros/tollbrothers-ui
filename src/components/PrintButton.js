import React from 'react'

import styles from './PrintButton.module.scss'

export const PrintButton = ({ classes = {}, onClick, children }) => {
  return (
    <button
      className={`${styles.root} ${
        classes?.root ? classes.root : ''
      } clear-styles js-noprint`}
      type='button'
      onClick={onClick}
    >
      <img
        className={`${styles.icon} ${classes?.icon ? classes.icon : ''}`}
        src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/print.svg'
      />
      {children && (
        <div
          className={`${styles.content} ${
            classes?.content ? classes.content : ''
          }`}
        >
          {children}
        </div>
      )}
    </button>
  )
}
