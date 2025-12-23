'use client'

import React, { useRef, useState, useEffect } from 'react'

import styles from './Chatbot.module.scss'

import ChatInput from '../TollChat/ChatInput'

import Minus from '../../icons/Minus'
import CloseX from '../../icons/CloseX'
import ChatMessageText from '../TollChat/ChatMessageText'
import ArrowLeft from '../../icons/ArrowLeft'
// import ChatMessageAttachment from './ChatMessageAttachment'
// import ChatMessageRichLink from './ChatMessageRichLink'

export const Chatbot = ({
  availabilityAPI,
  endPoint,
  apiSfOrgId,
  apiSfName,
  // disableFloatingChatButton = false,
  setChatStatus,
  // chatStatus,
  chatRegion,
  // setIsChatOpen = () => null,
  // isChatOpen, // this is to open chat from a button in the parent app instead of a floating head
  // chatSms,
  trackChatEvent = () => null,
  chatClickedEventString = 'chatClicked',
  chatStartedEventString = 'chatStarted',
  productCode // ie JDE number of community/model/qmi
}) => {
  const [showChatbot, setShowChatbot] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [showSendButton, setShowSendButton] = useState(false)

  // const [showChatHeader, setShowChatHeader] = useState(false)

  const [showConfirmationEndMessage, setShowConfirmationEndMessage] =
    useState(false)

  const chatContainerRef = useRef(null)

  /// const [systemMessage, setSystemMessage] = useState('') // system messages
  // const [chatPhoto, setChatPhoto] = useState(null) // osc image
  // const [agentName, setAgentName] = useState('Agent') // agent name
  const [error, setError] = useState(null)
  // const [abortController, setAbortController] = useState(null)
  const [isChatAvailabilityChecked, setIsChatAvailabilityChecked] =
    useState(null)
  //   const [hasAgentEngaged, setHasAgentEngaged] = useState(false)
  //   const [callbackUrl, setCallbackUrl] = useState(null)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState({
    count: 0,
    lastMessageId: null
  })

  const onChatButtonClick = () => {
    // setShowChatbot(false)
    setIsChatOpen(true)
    // setShowChatHeader(true)
    // trackChatEvent(chatClickedEventString)
  }

  const reestablishConnection = (event) => {
    if (event && event.type === 'visibilitychange' && document.hidden) {
      return
    }

    const initialize = false
    const isTabVisiblilityEvent = event && event.type === 'visibilitychange'
  }

  useEffect(() => {
    window.addEventListener('visibilitychange', reestablishConnection)

    return () => {
      window.removeEventListener('visibilitychange', reestablishConnection)
    }
  }, [])

  const handleMinimize = () => {
    setError(null)
    setIsMinimized(!isMinimized)
    setShowConfirmationEndMessage(false)
    setUnreadMessagesCount({ count: 0, lastMessageId: null })
  }

  const handleConfirmationEnd = () => {
    setError(null)
    setShowConfirmationEndMessage(true)
  }

  const handleStay = () => {
    setError(null)
    setShowConfirmationEndMessage(false)
  }

  const handleEndChat = async (accessToken, conversationId) => {
    // afterEndChatReset()
    setShowChatHeader(false)
    setIsChatOpen(false)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputMessage(value)
    setShowSendButton(value.trim() !== '')
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // TODO: Implement actual message sending logic
    console.log('Sending message:', inputMessage)
    setMessages([...messages, { text: inputMessage, sender: 'user' }])
    setInputMessage('')
    setShowSendButton(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

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
        <div id='chatbot-interface' className={`${styles.interface}`}>
          <div className={styles.header}>
            <div className={styles.title}>
              <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/chatbot-icon.svg' />
              <span>Hi, I'm TollBot</span>
            </div>
            <button
              className={`${styles.closeButton} ${styles.buttonReset}`}
              aria-label="Close Toll Brothers' AI Assistant"
              onClick={() => setIsChatOpen(false)}
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
