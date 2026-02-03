import React, { useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

import styles from './FloorPlanViewer.module.scss'
import { ThinkingIndicator } from './ThinkingIndicator'
import { ZoomInIcon, ZoomOutIcon, ResetZoomIcon } from './icons'

export const FloorPlanViewer = ({ floorPlans = [], utils }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [isCoverActive, setIsCoverActive] = useState(true)
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

  const removeCover = () => {
    setIsCoverActive(false)
  }

  return (
    <div className={styles.floorPlanViewer}>
      <h3 className={styles.title}>Floor Plans</h3>
      <div className={styles.svgContainer}>
        {isLoading ? (
          <ThinkingIndicator />
        ) : (
          <TransformWrapper key={activeTab} centerOnInit>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {isCoverActive && (
                  <div
                    className={styles.cover}
                    onClick={removeCover}
                    onDoubleClick={removeCover}
                    role='button'
                    tabIndex={0}
                    aria-label='Click to interact with floor plan'
                  />
                )}
                <div className={styles.controls}>
                  <button
                    onClick={() => {
                      removeCover()
                      zoomIn()
                    }}
                    aria-label='Zoom in'
                    type='button'
                  >
                    <ZoomInIcon />
                  </button>
                  <button
                    onClick={() => {
                      removeCover()
                      zoomOut()
                    }}
                    aria-label='Zoom out'
                    type='button'
                  >
                    <ZoomOutIcon />
                  </button>
                  <button
                    onClick={() => {
                      removeCover()
                      resetTransform()
                    }}
                    aria-label='Reset zoom'
                    type='button'
                  >
                    <ResetZoomIcon />
                  </button>
                </div>
                <TransformComponent wrapperClass={styles.transformWrapper}>
                  <div
                    className={styles.floorPlanImage}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                    role='img'
                    aria-label={activeFloorPlan.title || 'Floor Plan'}
                  />
                </TransformComponent>
              </>
            )}
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
