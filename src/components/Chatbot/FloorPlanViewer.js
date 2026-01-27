import React, { useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

import styles from './FloorPlanViewer.module.scss'
import { ThinkingIndicator } from './ThinkingIndicator'

export const FloorPlanViewer = ({ floorPlans = [], utils }) => {
  const [activeTab, setActiveTab] = useState(0)
  const { svgContent, isLoading } = utils?.useFetchSvg?.(
    floorPlans?.[activeTab]?.url,
    [activeTab, floorPlans]
  )

  if (!floorPlans?.length) return null

  const activeFloorPlan = floorPlans[activeTab]

  const handleTabClick = (index, event) => {
    setActiveTab(index)
    event.currentTarget.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    })
  }

  return (
    <div className={styles.floorPlanViewer}>
      <h3 className={styles.title}>Floor Plans</h3>
      <div className={styles.svgContainer}>
        {isLoading ? (
          <ThinkingIndicator />
        ) : (
          <TransformWrapper
            key={activeTab}
            centerOnInit
            panning={{ disabled: true }}
            onZoom={(ref) => {
              ref.instance.setup.panning.disabled = ref.state.scale <= 1
            }}
          >
            <TransformComponent wrapperClass={styles.transformWrapper}>
              <div
                className={styles.floorPlanImage}
                dangerouslySetInnerHTML={{ __html: svgContent }}
                role='img'
                aria-label={activeFloorPlan.title || 'Floor Plan'}
              />
            </TransformComponent>
          </TransformWrapper>
        )}
      </div>
      {floorPlans.length > 1 && (
        <div className={styles.tabsContainer}>
          {floorPlans.map((fp, index) => (
            <button
              key={index}
              className={`${styles.tab} ${
                activeTab === index ? styles.active : ''
              }`}
              onClick={(e) => handleTabClick(index, e)}
              aria-label={`Show ${fp.title} || 'Floor Plan'`}
            >
              {fp.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
