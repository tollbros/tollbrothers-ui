export const getProductHeroImage = (product) => {
  let headShotImage = product.headShot?.media?.url
  if (product.headShot?.media?.type?.includes('video')) {
    headShotImage = product?.gallery?.mediaGroups?.[0]?.media?.find((media) => media.type === 'image')?.url
  }

  return headShotImage
}
