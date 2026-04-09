import { useState, useEffect, useCallback } from 'react'

const MIN_WIDTH = 410
const MIN_WIDTH_MOBILE = 345
const MAX_WIDTH = 750
const PREFERRED_MIN_HEIGHT = 650
const MIN_HEIGHT_MOBILE = MIN_WIDTH_MOBILE
const MAX_WIDTH_PERCENT = 0.95
const MAX_HEIGHT_PERCENT = 0.96

const isMobile = () => {
  if (typeof window === 'undefined') return false
  // Check for touch-primary device (coarse pointer) or small screen dimensions
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  const isSmallScreen = window.innerWidth < 768 || window.innerHeight < 600
  return hasCoarsePointer || isSmallScreen
}

const getEffectiveMinHeight = () => {
  if (typeof window === 'undefined') return PREFERRED_MIN_HEIGHT
  const maxAvailable = Math.floor(window.innerHeight * MAX_HEIGHT_PERCENT)
  // On small screens, use a smaller minimum or the max available (whichever is smaller)
  if (maxAvailable < PREFERRED_MIN_HEIGHT) {
    return Math.max(MIN_HEIGHT_MOBILE, maxAvailable)
  }
  return PREFERRED_MIN_HEIGHT
}

const getInitialHeight = () => {
  if (typeof window === 'undefined') return PREFERRED_MIN_HEIGHT
  const maxAvailable = Math.floor(window.innerHeight * MAX_HEIGHT_PERCENT)
  // Start at the preferred min height, or max available if screen is too short
  return Math.min(PREFERRED_MIN_HEIGHT, maxAvailable)
}

export function useHorizontalResize(elementRef) {
  const [width, setWidth] = useState(isMobile() ? MIN_WIDTH_MOBILE : MIN_WIDTH)
  const [height, setHeight] = useState(getInitialHeight)
  const [isResizing, setIsResizing] = useState(false)

  const getMaxWidth = useCallback(() => {
    return Math.min(MAX_WIDTH, Math.floor(window.innerWidth * MAX_WIDTH_PERCENT))
  }, [])

  const getMaxHeight = useCallback(() => {
    return Math.floor(window.innerHeight * MAX_HEIGHT_PERCENT)
  }, [])

  const handleStart = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMove = useCallback(
    (e) => {
      if (!isResizing || !elementRef.current) return

      // Prevent page scrolling during touch drag
      if (e.touches) {
        e.preventDefault()
      }

      const rect = elementRef.current.getBoundingClientRect()

      // Get coordinates from mouse or touch event
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY

      const newWidth = rect.right - clientX
      const maxWidth = getMaxWidth()

      const clampedWidth = Math.min(Math.max(newWidth, isMobile() ? MIN_WIDTH_MOBILE : MIN_WIDTH), maxWidth)
      setWidth(clampedWidth)

      const newHeight = rect.bottom - clientY
      const maxHeight = getMaxHeight()
      const minHeight = getEffectiveMinHeight()
      const clampedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight)
      setHeight(clampedHeight)
    },
    [isResizing, elementRef, getMaxWidth, getMaxHeight]
  )

  const handleEnd = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      // Mouse events
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleEnd)
      // Touch events
      document.addEventListener('touchmove', handleMove, { passive: false })
      document.addEventListener('touchend', handleEnd)
      document.addEventListener('touchcancel', handleEnd)

      document.body.style.cursor = 'nesw-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
      document.removeEventListener('touchcancel', handleEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMove, handleEnd])

  useEffect(() => {
    const handleWindowResize = () => {
      const mobile = isMobile()
      const preferredMinWidth = mobile ? MIN_WIDTH_MOBILE : MIN_WIDTH
      const maxWidth = Math.min(getMaxWidth(), window.innerWidth)
      // Ensure min doesn't exceed available max
      const minWidth = Math.min(preferredMinWidth, maxWidth)

      const maxHeight = getMaxHeight()
      // Ensure min doesn't exceed available max
      const minHeight = Math.min(getEffectiveMinHeight(), maxHeight)

      // Clamp width to fit available space
      const clampedWidth = Math.min(Math.max(width, minWidth), maxWidth)
      if (clampedWidth !== width) {
        setWidth(clampedWidth)
      }

      // Clamp height to fit available space
      const clampedHeight = Math.min(Math.max(height, minHeight), maxHeight)
      if (clampedHeight !== height) {
        setHeight(clampedHeight)
      }
    }

    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [width, height, getMaxWidth, getMaxHeight])

  return {
    width,
    height,
    isResizing,
    handleStart
  }
}
