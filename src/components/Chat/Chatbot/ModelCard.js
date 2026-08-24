import React from 'react'
import styles from './ModelCard.module.scss'
import { ActionButton } from './ActionButton'
import { ModelStats } from './ModelStats'
import { ModelDetails } from './ModelDetails'
import { ConditionalLink } from './ConditionalLink'

export const ModelCard = ({ model, hideLocation, onClick = () => null, onMinimizeChat, utils = {} }) => {
  const headShotImage = model.headShot?.media?.url
  const desc = model?.description
  let features = model?.featureCallouts || []

  // Add "1st Floor Bedroom" if conditions are met
  const hasMultipleStories = parseFloat(model?.stories) > 1
  const hasMasterOnFirstFloor = model?.masterBedroomLocation === '1st Floor'
  const alreadyHasFeature = features.some((feature) => feature.includes('1st Floor Bedroom'))

  if (hasMultipleStories && hasMasterOnFirstFloor && !alreadyHasFeature) {
    features = [...features, '1st Floor Primary Bedroom']
  }

  console.log(model)

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.imageContainer}>
          <img src={headShotImage} alt={model.name || 'Community'} />
          {model.isQMI && <div className={styles.qmiCallout}>QMI</div>}
        </div>
        <div className={styles.headerContent}>
          {model.name && (
            <ConditionalLink href={model.url} utils={utils} onMinimizeChat={onMinimizeChat}>
              <h3 className={styles.name}>{model.name}</h3>
            </ConditionalLink>
          )}

          <ModelStats model={model} utils={utils} isCompact />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.info}>
          <ModelDetails model={model} hideLocation={hideLocation} includeQmiLabel utils={utils} />

          {features && features.length > 0 && <p className={styles.features}>{features.join(' | ')}</p>}

          {model.isDecoratedModel && <p className={styles.decoratedTag}>Decorated Model</p>}

          {/* {desc && <p className={styles.description}>{desc}</p>} */}
        </div>

        <div className={styles.actionButtonWrapper}>
          {!model.isQMI && model.dyohLink && (
            <ActionButton onClick={() => window.open(`${model.url}/DYOH`, '_blank')}>Personalize</ActionButton>
          )}
          {model.url && <ActionButton onClick={() => onClick(model)}>Learn More</ActionButton>}
        </div>
      </div>
    </div>
  )
}
