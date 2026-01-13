import React from 'react'
import styles from './ModelDetails.module.scss'
import { displayPricing } from './utils/pricing'
import { getQmiDateLabelText } from './utils/qmi'

const getPriceLabelText = (isQMI) => {
  const label = isQMI ? 'priced at' : 'starting at'

  return label
}

export const ModelDetails = ({
  model,
  hideLocation,
  includeQmiLabel,
  utils = {}
}) => {
  return (
    <p className={styles.root}>
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
      {!hideLocation && (
        <>
          {' in '} {model.city}, {model.state}
        </>
      )}
    </p>
  )
}
