/**
 * Fetches thumbnails for a list of images, handling Vimeo videos and walkthroughs asynchronously
 * @param {Array} images - Array of image/video objects
 * @param {Object} utils - Utility object containing fetchVimeoThumbnail and getWalkthroughThumbnail functions
 * @param {Function} isVideoFn - Function to check if an item is a video
 * @param {Function} isWalkthroughFn - Function to check if an item is a walkthrough
 * @returns {Promise<Object>} Object mapping index to thumbnail URL
 */
export const fetchImageThumbnails = async (images, utils, isVideoFn, isWalkthroughFn) => {
  const thumbnails = {}

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const itemIsVideo = isVideoFn(image)
    const itemIsWalkthrough = isWalkthroughFn?.(image) ?? false

    if (itemIsWalkthrough && utils?.getWalkthroughThumbnail) {
      const walkthroughThumbnail = utils.getWalkthroughThumbnail(image)
      thumbnails[i] = walkthroughThumbnail || image.url
    } else if (itemIsVideo && image.link && utils?.fetchVimeoThumbnail) {
      try {
        const thumbnail = await utils.fetchVimeoThumbnail(image)
        thumbnails[i] = thumbnail
      } catch (error) {
        console.error('Error fetching Vimeo thumbnail:', error)
        thumbnails[i] = image.url
      }
    } else {
      thumbnails[i] = image.url
    }
  }

  return thumbnails
}
