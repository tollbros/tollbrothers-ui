const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const leftZeroPad = (n, w) => {
  var pad = new Array(1 + w).join('0')
  return (pad + n).slice(-pad.length)
}

const getMediaMatch = (width) => {
  var match = false

  if (window.matchMedia('(min-width: ' + width + 'px)').matches) {
    match = true
  }

  return match
}

const elementInViewport = (el, fullyInView) => {
  var pageTop = window.scrollY
  var pageBottom = pageTop + window.innerHeight
  var elementTop = el.offsetTop
  var elementBottom = elementTop + el.offsetHeight

  if (fullyInView === true) {
    return pageTop < elementTop && pageBottom > elementBottom
  } else {
    return elementTop <= pageBottom && elementBottom >= pageTop
  }
}

const getUrlParams = (obj) => {
  // string version

  let params = ''

  if (obj.qdh && !obj.modelSearch) {
    params = params + '&homes=quick-delivery'
  } else if (obj.modelSearch) {
    params = params + '&qdh=y'
  }

  for (var key in obj) {
    if (key !== 'qdh') {
      var item = obj[key]
      if (typeof item === 'object' && Array.isArray(item)) {
        item.forEach((value) => {
          params += `&${key}=${encodeURIComponent(value)}`
        })
      } else {
        params += `&${key}=${encodeURIComponent(item)}`
      }
    }
  }

  return params
}

const getUrlParamsObj = (obj) => {
  const params = {}

  if (obj.qdh && !obj.modelSearch) {
    params.homes = 'quick-delivery'
  } else if (obj.modelSearch) {
    params.qdh = 'y'
  }

  for (var key in obj) {
    if (key !== 'qdh' && key !== 'region') {
      var item = obj[key]
      params[key] = ''
      if (typeof item === 'object' && Array.isArray(item)) {
        item.forEach((value, index) => {
          params[key] += encodeURIComponent(value)
          if (index < item.length - 1) params[key] += '~'
        })
      } else {
        params[key] += encodeURIComponent(item)
      }
    }
  }

  return params
}

const searchParmsToKeep = (params, reverse) => {
  const searchParamsToKeep = {
    region: true,
    lat: true,
    lon: true,
    radius: true,
    communityId: true,
    mCommunityId: true,
    commplanId: true,
    commExId: true,
    mcExId: true,
    mregion: true,
    metro: true,
    eventId: true,
    state: true
  }

  const keep = {}

  for (const key in params) {
    if (!reverse && searchParamsToKeep[key]) {
      keep[key] = params[key]
    } else if (reverse && !searchParamsToKeep[key]) {
      keep[key] = params[key]
    }
  }

  return keep
}

const getFullAddress = (place, breakLine) => {
  var address = place.address || place.streetAddress || place.street || ''
  var state = place.state || ''
  var zip = place.zip || place.zipCode || ''
  var city = place.city || ''

  if (!address && place.salesOffice && place.salesOffice.street) {
    address = place.salesOffice.street
  }

  if (!city && place.salesOffice && place.salesOffice.city) {
    city = place.salesOffice.city || ''
  }

  if (!state && place.salesOffice && place.salesOffice.state) {
    state = place.salesOffice.state || ''
  }

  if (!zip && place.salesOffice && place.salesOffice.zip) {
    zip = place.salesOffice.zip
  }

  if (city !== '' && address !== '') {
    if (breakLine) {
      address += '<br>'
    } else {
      address += ', '
    }
    address += city
  } else if (city !== '') {
    address = city
  }

  if (city !== '' && state !== '') {
    address += ', ' + state

    if (zip !== '') {
      address += ' ' + zip
    }
  }

  return address
}

const isBrowser = () => {
  return typeof window !== 'undefined'
}

const togglePreventScreenScroll = (forceRemove) => {
  const bodyClassList = document.body.classList

  if (forceRemove) {
    bodyClassList.remove('preventScroll')
    return
  }

  if (bodyClassList.contains('preventScroll')) {
    bodyClassList.remove('preventScroll')
  } else {
    bodyClassList.add('preventScroll')
  }
}

const getImage = (obj, size) => {
  let image = ''

  if (size && obj[size]) {
    image = obj[size]
  } else if (!size || (size && !obj[size])) {
    image =
      obj.s1920x1080 ||
      obj.s1800x815 ||
      obj.s450x266 ||
      obj.link ||
      obj.src ||
      obj.src_sm
  }

  if (
    image &&
    !image.startsWith('https://') &&
    image.indexOf('tollbrothers.com') < 0 &&
    image.indexOf('tollbrothers-static-public') < 0
  ) {
    image = 'https://cdn.tollbrothers.com' + image
  }

  return image
}

const loadScript = (src, uniqueID, callback) => {
  var className = 'js-' + uniqueID
  var prevScript = document.querySelector('.' + className)

  if (prevScript) {
    prevScript.remove()
  }

  var head = document.head
  var script = document.createElement('script')
  script.className = className
  script.type = 'text/javascript'
  script.onreadystatechange = callback
  script.onload = callback
  script.src = src
  head.appendChild(script)
}

const getModelSearchParams = () => {
  return {
    modelSearch: 'y',
    incPlan: 'y',
    qdh: 'y',
    bts: 'y',
    decorated: 'y'
  }
}

const getWalkthroughURL = (walkthrough) => {
  let src = ''
  if (walkthrough.type === 'walkthrough::matterport') {
    let extraParams = '&nt=1'
    if (getMediaMatch(992)) {
      extraParams = '&play=1'
    }

    src =
      'https://my.matterport.com/show/?m=' +
      walkthrough.link +
      '&ts=2&lp=1&hl=1&qs=1&search=0' +
      extraParams
  } else {
    src = walkthrough.link
    if (!walkthrough.link.includes('?')) {
      src = src + '?v=1'
    }
  }
  return src
}

const getWalkthroughThumbnail = (walkthrough) => {
  let thumb = ''

  if (walkthrough.type === 'walkthrough::matterport') {
    let link = walkthrough.link
    const cleanedLink = walkthrough.link.split('&')

    if (cleanedLink && cleanedLink.length > 0) {
      link = cleanedLink[0]
    }

    thumb = `https://my.matterport.com/api/v2/player/models/${link}/thumb`
  } else {
    thumb = walkthrough.url
  }
  return thumb
}

const getVideoURL = (video) => {
  let src = ''
  let paramOption = '?'
  if (video.link.indexOf('?') > -1) paramOption = '&'

  video.autoplay = video.autoplay || 0

  if (video.type === 'video::vimeo') {
    src = `https://player.vimeo.com/video/${video.link}${paramOption}portrait=0&title=0&byline=0&badge=0&autoplay=${video.autoplay}`
  } else {
    src = ``
  }

  return src
}

export { getMediaMatch }
export { elementInViewport }
export { getUrlParams }
export { getUrlParamsObj }
export { monthNames }
export { leftZeroPad }
export { getFullAddress }
export { isBrowser }
export { togglePreventScreenScroll }
export { getImage }
export { loadScript }
export { searchParmsToKeep }
export { getModelSearchParams }
export { getWalkthroughURL }
export { getWalkthroughThumbnail }
export { getVideoURL }
