'use client'

import React, { useRef, useState, useEffect } from 'react'
import styles from './Chatbot.module.scss'
import { BotMessage } from './BotMessage'
import { UserMessage } from './UserMessage'
import { ThinkingIndicator } from './ThinkingIndicator'

const TEST_DATA = [
  {
    id: 1,
    sender: 'user',
    text: 'I am looking for a new home'
  },
  {
    id: 2,
    sender: 'bot',
    text: 'I am happy to help. In what location are you focusing your home search? Are you still interested in your previous search areas?'
  },
  {
    id: 3,
    sender: 'user',
    text: 'Wow that was fast! What a great AI assistant you are.'
  },
  {
    id: 4,
    sender: 'bot',
    text: 'Thank you!'
  },
  {
    id: 5,
    sender: 'user',
    text: 'You are quite welcome. I would like to know more about your home designs.'
  },
  {
    id: 6,
    sender: 'user',
    text: 'And another thing I want is a pool!'
  }
]

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
  const [messages, setMessages] = useState(TEST_DATA)
  const [inputMessage, setInputMessage] = useState('')
  const [error, setError] = useState(null)
  const chatContainerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState({
    count: 0,
    lastMessageId: null
  })
  const [isThinking, setIsThinking] = useState(false)
  const [pendingUserMessages, setPendingUserMessages] = useState(0)

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessageText = inputMessage
    const newUserMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user'
    }

    setMessages([...messages, newUserMessage])
    setInputMessage('')
    setPendingUserMessages((prev) => prev + 1)
    setIsThinking(true)

    // TODO: Implement actual message sending logic to your API
    // Simulating API call for now
    try {
      console.log('Sending message:', userMessageText)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate bot response
      const botResponse = {
        id: Date.now() + 1,
        text: 'This is a simulated response. Replace this with actual API response.',
        sender: 'bot'
      }

      setMessages((prev) => [...prev, botResponse])
      setPendingUserMessages((prev) => {
        const newCount = prev - 1
        if (newCount <= 0) {
          setIsThinking(false)
        }
        return newCount
      })
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
      setPendingUserMessages((prev) => {
        const newCount = prev - 1
        if (newCount <= 0) {
          setIsThinking(false)
        }
        return newCount
      })
    }
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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isChatOpen, isThinking])

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
            <div className={styles.messages}>
              {messages.map((msg) => {
                if (msg.sender === 'user') {
                  return <UserMessage key={msg.id} message={msg.text} />
                } else {
                  return <BotMessage key={msg.id} message={msg.text} />
                }
              })}
              {isThinking && <BotMessage component={<ThinkingIndicator />} />}
            </div>
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
