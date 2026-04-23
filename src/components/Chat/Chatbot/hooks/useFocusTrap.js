import { useEffect, useRef, useCallback } from 'react'

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ')

const isElementVisible = (el) => {
  if (!el) return false
  const style = window.getComputedStyle(el)
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    el.offsetWidth > 0 &&
    el.offsetHeight > 0
  )
}

const getTabIndex = (el) => {
  const tabindex = el.getAttribute('tabindex')
  return tabindex ? parseInt(tabindex, 10) : 0
}

const sortByTabIndex = (elements) => {
  // Separate elements with explicit tabindex (>= 1) from those without
  const withTabIndex = []
  const withoutTabIndex = []

  elements.forEach((el) => {
    const tabindex = getTabIndex(el)
    if (tabindex >= 1) {
      withTabIndex.push({ el, tabindex })
    } else {
      withoutTabIndex.push(el)
    }
  })

  // Sort elements with explicit tabindex by their value
  withTabIndex.sort((a, b) => a.tabindex - b.tabindex)

  // Return elements with explicit tabindex first, then the rest
  return [...withTabIndex.map((item) => item.el), ...withoutTabIndex]
}

export const useFocusTrap = (isActive, containerRef, triggerRef, messagesContainerRef, confirmationDialogRef) => {
  const previousActiveElement = useRef(null)
  const lastMessageRef = useRef(null)
  const pendingFocusElementRef = useRef(null)
  const isTrapDisabled = useRef(false)

  // Function to manually disable the focus trap
  const disableTrap = useCallback(() => {
    console.log('Disabling focus trap')
    isTrapDisabled.current = true
    pendingFocusElementRef.current = null
  }, [])

  // Track new messages and prepare to focus on next tab
  useEffect(() => {
    if (!isActive || !messagesContainerRef?.current) {
      return
    }

    const messagesContainer = messagesContainerRef.current

    const observer = new MutationObserver(() => {
      const currentLastMessage = messagesContainer.lastElementChild

      // If the last message has changed (new message added)
      if (currentLastMessage && currentLastMessage !== lastMessageRef.current) {
        lastMessageRef.current = currentLastMessage

        const focusableElements = Array.from(currentLastMessage.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
          isElementVisible
        )

        if (focusableElements.length > 0) {
          // Store the element to focus on next tab, but don't focus it yet
          pendingFocusElementRef.current = focusableElements[0]
        }
      }
    })

    observer.observe(messagesContainer, { childList: true, subtree: false })
    lastMessageRef.current = messagesContainer.lastElementChild

    return () => {
      observer.disconnect()
    }
  }, [isActive, messagesContainerRef])

  useEffect(() => {
    if (!isActive || !containerRef?.current) {
      return
    }

    // Reset trap disabled state when chat opens
    isTrapDisabled.current = false

    // Store the element that was focused before opening
    previousActiveElement.current = document.activeElement

    const container = containerRef.current

    const getFocusableElements = () => {
      const allFocusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(isElementVisible)

      // Sort by tabindex first
      const sorted = sortByTabIndex(allFocusable)

      // Check if chat form dialog is showing
      const chatFormDialog = document.querySelector('#chat-form-dialog')
      const isChatFormDialogShowing = chatFormDialog && isElementVisible(chatFormDialog)

      if (isChatFormDialogShowing) {
        // If chat form dialog is showing, only allow focus on elements within it
        const inDialog = sorted.filter((el) => chatFormDialog.contains(el))
        return {
          all: inDialog,
          inLastMessage: [],
          others: [],
          lastMessage: null
        }
      }

      // Check if confirmation dialog is showing
      const confirmationDialog = confirmationDialogRef?.current
      const isConfirmationDialogShowing = confirmationDialog && isElementVisible(confirmationDialog)

      if (isConfirmationDialogShowing) {
        // If confirmation dialog is showing, only allow focus on elements within it
        const inDialog = sorted.filter((el) => confirmationDialog.contains(el))
        return {
          all: inDialog,
          inLastMessage: [],
          others: [],
          lastMessage: null
        }
      }

      // If we have a messages container, prioritize elements in the last message
      const messagesContainer = messagesContainerRef?.current
      if (messagesContainer && messagesContainer.lastElementChild) {
        const lastMessage = messagesContainer.lastElementChild
        const inLastMessage = []
        const others = []

        sorted.forEach((el) => {
          if (lastMessage.contains(el)) {
            inLastMessage.push(el)
          } else {
            others.push(el)
          }
        })

        // Sort each group by tabindex
        const sortedInLastMessage = sortByTabIndex(inLastMessage)
        const sortedOthers = sortByTabIndex(others)

        // Return object with separated arrays and combined array
        // Elements with explicit tabindex=1+ should come first globally
        const hasExplicitTabIndex = sorted.filter((el) => getTabIndex(el) >= 1)
        const noExplicitTabIndex = sorted.filter((el) => getTabIndex(el) === 0)

        // For elements with no explicit tabindex, prioritize last message
        const finalOrder = [
          ...hasExplicitTabIndex,
          ...noExplicitTabIndex.filter((el) => lastMessage.contains(el)),
          ...noExplicitTabIndex.filter((el) => !lastMessage.contains(el))
        ]

        return {
          all: finalOrder,
          inLastMessage: sortedInLastMessage,
          others: sortedOthers,
          lastMessage
        }
      }

      return { all: sorted, inLastMessage: [], others: sorted, lastMessage: null }
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') {
        return
      }

      // If trap is disabled, check if focus is back inside container
      if (isTrapDisabled.current) {
        // Allow tab to happen naturally first
        setTimeout(() => {
          // After tab completes, check if focus landed inside the container
          if (container.contains(document.activeElement)) {
            console.log('Focus returned to chat, re-enabling trap')
            isTrapDisabled.current = false
          }
        }, 0)
        return
      }

      const { all: focusable } = getFocusableElements()
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      // Check if we have a pending focus element (from a new message)
      if (pendingFocusElementRef.current && !event.shiftKey) {
        event.preventDefault()
        pendingFocusElementRef.current.focus()
        pendingFocusElementRef.current = null
        return
      }

      const firstElement = focusable[0]
      const lastElement = focusable[focusable.length - 1]
      const currentElement = document.activeElement
      const currentIndex = focusable.indexOf(currentElement)

      // Shift + Tab (backwards)
      if (event.shiftKey) {
        // If on first element or focus is outside, wrap to last
        if (currentIndex <= 0 || !container.contains(currentElement)) {
          event.preventDefault()
          lastElement.focus()
          return
        }
        // Otherwise, move to previous element
        event.preventDefault()
        focusable[currentIndex - 1].focus()
        return
      }

      // Tab (forwards)
      // If on last element or focus is outside, wrap to first
      if (currentIndex === focusable.length - 1 || currentIndex === -1) {
        event.preventDefault()
        firstElement.focus()
        return
      }

      // Otherwise, move to next element (natural tab order)
      event.preventDefault()
      focusable[currentIndex + 1].focus()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, containerRef, messagesContainerRef, confirmationDialogRef])

  // Restore focus to trigger element when closing
  useEffect(() => {
    if (!isActive && previousActiveElement.current) {
      // Return focus to the trigger button if available, otherwise to previously focused element
      const focusTarget = triggerRef?.current || previousActiveElement.current
      if (focusTarget && typeof focusTarget.focus === 'function') {
        focusTarget.focus()
      }
      previousActiveElement.current = null
    }
  }, [isActive, triggerRef])

  return disableTrap
}
