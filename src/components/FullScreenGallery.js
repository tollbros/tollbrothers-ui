import React from 'react'
import Slider from './Slider'
import GalleryMedia from './GalleryMedia'
import PopupModal from './PopupModal'
import styles from './FullScreenGallery.module.scss'
import rotate from '../lib/rotate'

export const FullScreenGallery = ({
  show = false,
  mediaList = [],
  showSocials = false,
  dataLayerPush = null,
  onClose = () => {},
  onNext = () => {},
  onPrevious = () => {},
  initialSlide = 1
}) => {
  const newMediaList = rotate([...mediaList], initialSlide - 1)

  return (
    show && (
      <PopupModal show>
        <div className={`${styles.fullScreen} full`}>
          <button className={styles.close} onClick={onClose} />
          <div className={styles.container}>
            <Slider mediaList={newMediaList} disablePagination onNext={onNext} onPrevious={onPrevious}>
              {newMediaList.map(function (media, idx) {
                return (
                  <div className={`${styles.fullscreenMedia}`} key={idx}>
                    <GalleryMedia media={media} index={idx} mediaCount={newMediaList.length} showSocials={showSocials} dataLayerPush={dataLayerPush} showCaption />
                  </div>
                )
              })}
            </Slider>
          </div>
        </div>
      </PopupModal>
    )
  )
}
