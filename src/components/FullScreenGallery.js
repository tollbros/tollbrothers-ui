import React from 'react'
import { useSlider } from './Slider'
import GalleryMedia from './GalleryMedia'
import PopupModal from './PopupModal'
import styles from './FullScreenGallery.module.scss'

export const FullScreenGallery = ({
  show = false,
  mediaList = [],
  onClose = () => {},
  onNext = () => {},
  onPrevious = () => {}
}) => {
  const { Slider } = useSlider({
    disablePagination: true
  })

  return (
    <PopupModal show={show}>
      <div className={`${styles.fullScreen}`}>
        <button
          className={`${styles.close} ${styles.closeButton}`}
          onClick={onClose}
        />
        <Slider onNext={onNext} onPrevious={onPrevious}>
          {mediaList.length &&
            mediaList.map(function (media, idx) {
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
}
