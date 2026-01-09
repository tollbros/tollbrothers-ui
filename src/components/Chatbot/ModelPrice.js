import React from 'react'
import styles from './ModelPrice.module.scss'
import { displayPricing } from './utils/pricing'
import { getQmiDateLabelText } from './utils/qmi'

const getPriceLabelText = (isQMI) => {
  const label = isQMI ? 'priced at' : 'starting at'

  return label
}

export const ModelPrice = ({ model, includeQmiLabel, utils = {} }) => {
  return (
    <p className={styles.price}>
      {model.isQMI && includeQmiLabel && (
        <>
          {getQmiDateLabelText({
            date: model.moveInDate,
            isComingSoon: model.isComingSoon,
            utils: utils
          })}{' '}
          &bull;{' '}
        </>
      )}

      {model.homeType &&
        !model.options?.some((option) => option.id === '112') && (
          <>{model.homeType} </>
        )}
      {model.pricedFrom &&
        `${getPriceLabelText(model.isQMI)} ${displayPricing(model.pricedFrom)}`}
    </p>
  )
}
