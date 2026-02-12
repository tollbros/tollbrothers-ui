export const deleteExtraProductInfo = (product) => {
  delete product.metaDescription
  delete product.schoolInfo
  delete product.siteplan
  delete product.gallery
  delete product.events
  delete product.media
  delete product.designStudio
  delete product.downloadables
  delete product.socialMedia

  if (product.commPlanID) {
    delete product.amenities
    delete product.communityFilters
    delete product.logo
    delete product.masterCommunityUrl
    delete product.qmis
  }

  if (product.homes?.models) {
    product.homes.models.map((home) => {
      delete home.gallery
      delete home.logo
      delete home.modelBullets
      delete home.media
      delete home.downloadables
    })
  }

  if (product.communities) {
    product.communities.map((com) => {
      deleteExtraProductInfo(com)
    })
  }
}
