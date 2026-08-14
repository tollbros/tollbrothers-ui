import React, { useMemo, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

import styles from './FloorPlanViewer.module.scss'
import { ThinkingIndicator } from './ThinkingIndicator'
import { ZoomInIcon, ZoomOutIcon, ResetZoomIcon } from './icons'
import { useTrackInView } from './hooks/useTrackInView'

export const FloorPlanViewer = ({ floorPlans = [], title, classes, utils }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [isCoverActive, setIsCoverActive] = useState(true)
  const sortedFloorplans = useMemo(() => utils?.sortFloorplans?.(floorPlans) || floorPlans, [floorPlans])
  const { svgContent, isLoading } = utils?.useFetchSvg?.(sortedFloorplans?.[activeTab]?.url, [
    activeTab,
    sortedFloorplans
  ])

  // const mainTitle = title || 'Floor Plans'

  const containerRef = useTrackInView({
    onInView: () => {
      if (utils?.dataLayerPush) {
        utils.dataLayerPush({
          event: 'floorplan_view',
          variant: 'chatbot'
        })
      }
    },
    once: true
  })

  if (!sortedFloorplans?.length) return null

  const activeFloorPlan = sortedFloorplans[activeTab]

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
    <div className={`${styles.floorPlanViewer} ${classes?.root || ''}`} ref={containerRef}>
      <h3 className={`${styles.title} ${classes?.title || ''}`}>{title ?? 'Floor Plans'}</h3>
      <div className={`${styles.svgContainer} ${classes?.svgContainer || ''}`}>
        {isLoading ? (
          <ThinkingIndicator />
        ) : (
          <TransformWrapper key={activeTab} centerOnInit>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {isCoverActive && (
                  <div
                    className={`${styles.cover} ${classes?.cover || ''}`}
                    onClick={removeCover}
                    onDoubleClick={removeCover}
                    role='button'
                    tabIndex={0}
                    aria-label='Click to interact with floor plan'
                  />
                )}
                <div className={`${styles.controls} ${classes?.controls || ''}`}>
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
                <TransformComponent wrapperClass={`${styles.transformWrapper} ${classes?.transformWrapper || ''}`}>
                  <div
                    className={`${styles.floorPlanImage} ${classes?.floorPlanImage || ''}`}
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
      {sortedFloorplans.length > 1 && (
        <div className={`${styles.tabsContainer} ${classes?.tabsContainer || ''}`}>
          {sortedFloorplans.map((fp, index) => (
            <button
              key={index}
              className={`${styles.tab} ${activeTab === index ? styles.active : ''} ${classes?.tab || ''}`}
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
