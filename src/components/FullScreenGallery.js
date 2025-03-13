import React from 'react'
import Slider from './Slider'
import GalleryMedia from './GalleryMedia'
import PopupModal from './PopupModal'
import styles from './FullScreenGallery.module.scss'
import rotate from '../lib/rotate'

/**
 * @component
 * @param {object} props
 * @param {boolean} props.show - wheter to show the the full screen gallery or not
 * @param {object[]} props.mediaList - list of media
 * @param {boolean} [props.showSocials] - wheter to show the social media links or not
 * @param {function} [props.dataLayerPush] - analytics function
 * @param {function} [props.onClose] - callback function to fire on close
 * @param {function} [props.onNext] - callback function to fire on next button click
 * @param {function} [props.onPrevious] - callback function to fire on previous button click
 * @param {number} [props.initialSlide] - which media in medialist to show first
 * @param {string} [props.backgroundColor] - override css style for media gallery background color
 * @param {string} [props.portalId] - the id of the portal to render the gallery in
 */
export const FullScreenGallery = ({
  show = false,
  mediaList = [],
  showSocials = false,
  dataLayerPush = null,
  onClose = () => {},
  onNext = () => {},
  onPrevious = () => {},
  initialSlide = 1,
  backgroundColor,
  portalId,
  classes = {},
  disableSlider = false,
  showLeftCloseButton = false,
  disableZoom = false
}) => {
  const newMediaList = rotate([...mediaList], initialSlide - 1)
  return (
    show && (
      <PopupModal show portalId={portalId}>
        <div className={`${styles.fullScreen} full`}>
          {showLeftCloseButton && (
            <button
              className={`${styles.close} ${styles.closeLeft} ${
                classes.closeButton ?? ''
              }`}
              onClick={onClose}
            />
          )}
          <button
            className={`${styles.close} ${classes.closeButton ?? ''}`}
            onClick={onClose}
          />
          <div className={styles.container}>
            <Slider
              mediaList={newMediaList}
              disablePagination
              onNext={onNext}
              onPrevious={onPrevious}
              disableSlider={disableSlider}
              disableZoom={disableZoom}
            >
              {newMediaList.map(function (media, idx) {
                return (
                  <div className={styles.fullscreenMedia} key={idx}>
                    <GalleryMedia
                      media={media}
                      index={idx}
                      mediaCount={newMediaList.length}
                      showSocials={showSocials}
                      dataLayerPush={dataLayerPush}
                      showCaption
                      backgroundColor={backgroundColor}
                      classes={classes}
                    />
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
