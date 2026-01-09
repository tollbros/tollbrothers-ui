import React from 'react'
import styles from './QMICallout.module.scss'
import { getQmiDateLabelText } from './utils/qmi'

export const QMICallout = ({ model, utils = {} }) => {
  if (!model.isQMI) {
    return null
  }

  const labelText = getQmiDateLabelText({
    date: model.moveInDate,
    isComingSoon: model.isComingSoon,
    utils: utils
  })

  const homeSite = model.lotNumber

  return (
    <div className={styles.root}>
      <div className={`${styles.container}`}>
        <div className={`${styles.imageContainer}`}>
          <img
            src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/ispt/icons/QMI_purple.svg'
            alt='Quick Move-In'
          />
        </div>
        <div className={`${styles.text}`}>
          <span className={styles.label}>{labelText}</span>
          <div className={styles.location}>
            {homeSite && <span>Home Site {homeSite}</span>}
            {model.street && (
              <span className={styles.address}>
                &nbsp;|&nbsp;{`${model.street}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
