import React from 'react'
import styles from './ModelCard.module.scss'
import { ActionButton } from './ActionButton'
import { ModelStats } from './ModelStats'
import { ModelDetails } from './ModelDetails'
import { ConditionalLink } from './ConditionalLink'

export const ModelCard = ({
  model,
  hideLocation,
  onClick = () => null,
  utils = {}
}) => {
  const headShotImage = model.headShot?.media?.url
  const desc = model?.description

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.imageContainer}>
          <img src={headShotImage} alt={model.name || 'Community'} />
        </div>
        <div className={styles.headerContent}>
          {model.name && (
            <ConditionalLink href={model.url} utils={utils}>
              <h3 className={styles.name}>{model.name}</h3>
            </ConditionalLink>
          )}

          <ModelStats model={model} utils={utils} isCompact />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.info}>
          <ModelDetails
            model={model}
            hideLocation={hideLocation}
            includeQmiLabel
            utils={utils}
          />

          {desc && <p className={styles.description}>{desc}</p>}
        </div>

        {model.url && (
          <div className={styles.actionButtonWrapper}>
            <ActionButton onClick={() => onClick(model)}>
              Learn More
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  )
}
