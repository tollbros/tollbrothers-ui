import React from 'react'
import Slider from './Slider'
import GalleryMedia from './GalleryMedia'
import PopupModal from './PopupModal'
import styles from './FullScreenGallery.module.scss'
import rotate from '../lib/rotate'

export const FullScreenGallery = ({
  show = false,
  mediaList = [],
  onClose = () => {},
  onNext = () => {},
  onPrevious = () => {},
  initialSlide = 1
}) => {
  const newMediaList = rotate([...mediaList], initialSlide - 1)

  return (
    show && (
      <PopupModal show>
        <div className={`${styles.fullScreen}`}>
          <button className={styles.close} onClick={onClose} />
          <Slider disablePagination onNext={onNext} onPrevious={onPrevious}>
            {newMediaList.map(function (media, idx) {
              return (
                <div className={`${styles.fullscreenMedia}`} key={idx}>
                  <GalleryMedia media={media} index={idx} showCaption />
                </div>
              )
            })}
          </Slider>
        </div>
      </PopupModal>
    )
  )
}
