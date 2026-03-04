import { useRef, useEffect } from 'react'

export const useTrackInView = ({ onInView, threshold = 0.5 }) => {
  const ref = useRef(null)
  const wasVisibleRef = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !wasVisibleRef.current) {
            onInView?.()
          }
          wasVisibleRef.current = entry.isIntersecting
        })
      },
      { threshold }
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [onInView, threshold])

  return ref
}
