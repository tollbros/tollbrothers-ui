const toPath = (route) => {
  try {
    return new URL(route).pathname
  } catch {
    return route
  }
}

export const getProductData = async (routes, baseUrl) => {
  const results = await Promise.allSettled(
    routes.map((route) =>
      fetch(`${baseUrl}${toPath(route)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.json()
        })
        .then(
          (data) =>
            data.communityComponent ??
            data.masterCommunityComponent ??
            data.modelComponent
        )
    )
  )

  return results
    .filter((result) => result.status === 'fulfilled' && result.value)
    .map((result) => result.value)
}
