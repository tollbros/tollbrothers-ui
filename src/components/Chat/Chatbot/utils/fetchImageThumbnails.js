/**
 * Fetches thumbnails for a list of images, handling Vimeo videos asynchronously
 * @param {Array} images - Array of image/video objects
 * @param {Object} utils - Utility object containing fetchVimeoThumbnail function
 * @param {Function} isVideoFn - Function to check if an item is a video
 * @returns {Promise<Object>} Object mapping index to thumbnail URL
 */
export const fetchImageThumbnails = async (images, utils, isVideoFn) => {
  const thumbnails = {}

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const itemIsVideo = isVideoFn(image)

    if (itemIsVideo && image.link && utils?.fetchVimeoThumbnail) {
      try {
        const thumbnail = await utils.fetchVimeoThumbnail(image)
        thumbnails[i] = thumbnail
      } catch (error) {
        console.error('Error fetching Vimeo thumbnail:', error)
        thumbnails[i] = image.url || image.src
      }
    } else {
      thumbnails[i] = image.url || image.src
    }
  }

  return thumbnails
}
