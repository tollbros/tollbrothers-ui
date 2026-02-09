import { useState, useEffect, useCallback } from 'react'

const MIN_WIDTH = 345
const MIN_HEIGHT = 500
const MAX_WIDTH_PERCENT = 0.8
const MAX_HEIGHT_PERCENT = 0.8

export function useHorizontalResize(elementRef) {
  const [width, setWidth] = useState(MIN_WIDTH)
  const [height, setHeight] = useState(MIN_HEIGHT)
  const [isResizing, setIsResizing] = useState(false)

  const getMaxWidth = useCallback(() => {
    return Math.floor(window.innerWidth * MAX_WIDTH_PERCENT)
  }, [])

  const getMaxHeight = useCallback(() => {
    return Math.floor(window.innerHeight * MAX_HEIGHT_PERCENT)
  }, [])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing || !elementRef.current) return

      const rect = elementRef.current.getBoundingClientRect()

      const newWidth = rect.right - e.clientX
      const maxWidth = getMaxWidth()
      const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), maxWidth)
      setWidth(clampedWidth)

      const newHeight = rect.bottom - e.clientY
      const maxHeight = getMaxHeight()
      const clampedHeight = Math.min(Math.max(newHeight, MIN_HEIGHT), maxHeight)
      setHeight(clampedHeight)
    },
    [isResizing, elementRef, getMaxWidth, getMaxHeight]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'nesw-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

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
    handleMouseDown
  }
}
