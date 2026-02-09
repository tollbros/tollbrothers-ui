import { useState, useEffect, useCallback } from 'react'

const MIN_WIDTH = 345
const MAX_WIDTH = 780
const MIN_HEIGHT = 650
const MAX_HEIGHT_PERCENT = 0.96

export function useHorizontalResize(elementRef) {
  const [width, setWidth] = useState(MIN_WIDTH)
  const [height, setHeight] = useState(MIN_HEIGHT)
  const [isResizing, setIsResizing] = useState(false)

  const getMaxWidth = useCallback(() => {
    return MAX_WIDTH
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
      const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), maxWidth)
      setWidth(clampedWidth)

      const newHeight = rect.bottom - clientY
      const maxHeight = getMaxHeight()
      const clampedHeight = Math.min(Math.max(newHeight, MIN_HEIGHT), maxHeight)
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
      const maxWidth = getMaxWidth()
      const maxHeight = getMaxHeight()
      if (width > maxWidth) {
        setWidth(maxWidth)
      }
      if (height > maxHeight) {
        setHeight(maxHeight)
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
