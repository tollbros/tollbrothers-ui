'use client'

import React, { useRef, useState, useEffect } from 'react'
import styles from './Chatbot.module.scss'

export const Chatbot = ({
  availabilityAPI,
  endPoint,
  chatRegion,
  trackChatEvent = () => null,
  chatClickedEventString = 'chatClicked',
  chatStartedEventString = 'chatStarted'
}) => {
  const chatInterfaceRef = useRef(null)
  const [showChatbot, setShowChatbot] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [error, setError] = useState(null)
  const chatContainerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState({
    count: 0,
    lastMessageId: null
  })

  const onChatButtonClick = () => {
    setIsChatOpen(true)
  }

  const onCloseChat = () => {
    setIsChatOpen(false)
  }

  const reestablishConnection = (event) => {
    if (event && event.type === 'visibilitychange' && document.hidden) {
      return
    }

    const isTabVisiblilityEvent = event && event.type === 'visibilitychange'
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputMessage(value)
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // TODO: Implement actual message sending logic
    console.log('Sending message:', inputMessage)
    setMessages([...messages, { text: inputMessage, sender: 'user' }])
    setInputMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  useEffect(() => {
    window.addEventListener('visibilitychange', reestablishConnection)

    return () => {
      window.removeEventListener('visibilitychange', reestablishConnection)
    }
  }, [])

  //   useEffect(() => {
  //     if (chatContainerRef.current) {
  //       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
  //     }
  //   }, [messages, isMinimized])

  if (!showChatbot) {
    return null
  }

  return (
    <div className={`${styles.root}`}>
      <button
        className={`${styles.launchButton} ${styles.buttonReset} ${
          isChatOpen ? styles.hidden : ''
        }`}
        onClick={onChatButtonClick}
        aria-label="Open Toll Brothers' AI Assistant"
        aria-controls='chatbot-interface'
        aria-expanded={isChatOpen}
      >
        <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/chatbot-button.svg' />
      </button>

      {isChatOpen && (
        <div
          id='chatbot-interface'
          className={`${styles.interface}`}
          ref={chatInterfaceRef}
        >
          <div className={styles.header}>
            <div className={styles.title}>
              <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/chatbot-icon.svg' />
              <span>Hi, I'm TollBot</span>
            </div>
            <button
              ref={closeButtonRef}
              className={`${styles.closeButton} ${styles.buttonReset}`}
              aria-label="Close Toll Brothers' AI Assistant"
              onClick={onCloseChat}
            >
              <img
                src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/close.svg'
                alt=''
              />
            </button>
          </div>
          <div className={styles.body} ref={chatContainerRef}>
            <p>
              I am the Toll Brothers AI assistant. I can assist with your home
              search using the prompts below or direct you to one of our human
              experts for additional help.
            </p>
          </div>
          <div className={styles.footer}>
            <div className={styles.inputContainer}>
              <input
                id='chatbot-input'
                type='text'
                className={styles.input}
                placeholder='Ask TollBot your question here.'
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                aria-label='Ask TollBot your question here.'
              />

              <button
                className={`${styles.sendButton} ${styles.buttonReset}`}
                onClick={handleSendMessage}
                aria-label='Send message'
              >
                <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/up-arrow.svg' />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
