'use client'

import React, { useRef, useState, useEffect } from 'react'
import styles from './Chatbot.module.scss'
import { BotMessage } from './BotMessage'
import { UserMessage } from './UserMessage'
import { ThinkingIndicator } from './ThinkingIndicator'
import { OptionsList } from './OptionsList'
import { ProductsList } from './ProductsList'
import { ActionButton } from './ActionButton'
import { ProductLayout } from './ProductLayout'

const TEST_DATA = [
  {
    id: 1,
    type: 'user',
    text: 'I am looking for a new home'
  },
  {
    id: 2,
    type: 'bot',
    text: 'I am happy to help. In what location are you focusing your home search? Are you still interested in your previous search areas?'
  },

  {
    id: 3,
    type: 'user',
    text: 'Wow that was fast! What a great AI assistant you are.'
  },
  {
    id: 4,
    type: 'bot',
    text: 'Thank you!'
  },
  {
    id: 5,
    type: 'user',
    text: 'You are quite welcome. I would like to know more about your home designs.'
  },
  {
    id: 6,
    type: 'user',
    text: 'And another thing I want is a pool!'
  },
  {
    id: 7,
    type: 'bot',
    text: 'Could you please tell me in what location you are interested in?'
  },
  {
    id: 8,
    type: 'prompt',
    options: [
      {
        id: 'opt1',
        text: 'North Carolina',
        value: 'North Carolina'
      },
      {
        id: 'opt2',
        text: 'Charlotte, NC',
        value: 'Charlotte, NC'
      }
    ]
  }
]

export const Chatbot = ({
  tollRouteApi,
  utils = {},
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
  const messageContainerRef = useRef(null)
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

  const handleSendMessage = async (_event, systemMessage) => {
    if (!inputMessage.trim() && !systemMessage) return

    console.log(systemMessage)

    const userMessageText = inputMessage || systemMessage
    const newUserMessage = {
      id: Date.now(),
      text: userMessageText,
      type: 'user'
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
        component: <ActionButton>Tell Me More</ActionButton>,
        type: 'bot'
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

  const handleOptionSelect = (option) => {
    handleSendMessage(null, option.value)
  }

  const handleProductSelect = (product) => {
    console.log('Product selected:', product)

    const newBotMessage = {
      id: Date.now(),
      // text: 'Here are some communities that you might like:',
      type: 'product',
      product: product
    }

    setMessages([...messages, newBotMessage])
  }

  useEffect(() => {
    window.addEventListener('visibilitychange', reestablishConnection)

    return () => {
      window.removeEventListener('visibilitychange', reestablishConnection)
    }
  }, [])

  useEffect(() => {
    setIsThinking(true)

    setTimeout(() => {
      const routes = [
        '/luxury-homes-for-sale/Florida/Bartram-Ranch/Quick-Move-In/283408',
        '/luxury-homes-for-sale/California/3131-Camino/Lila',
        '/luxury-homes-for-sale/New-Jersey/400-Lake-at-Asbury-Park/Bolton',
        '/luxury-homes-for-sale/Massachusetts/Lakemont-by-Toll-Brothers/Quick-Move-In/MLS-73340095',
        '/luxury-homes-for-sale/Florida/Mill-Creek-Forest',
        '/luxury-homes-for-sale/Virginia/Parkside-Village/The-Sequoia-Collection/Quick-Move-In/MLS-VALO2103266',
        '/luxury-homes-for-sale/Florida/The-Isles-at-Lakewood-Ranch/Captiva-Collection/Aragon',
        '/luxury-homes-for-sale/Florida/Bartram-Ranch/Barnwell',
        '/luxury-homes-for-sale/Florida/Bartram-Ranch/Abigail',
        '/luxury-homes-for-sale/Florida/Crosswinds-at-Nocatee/Quick-Move-In/281046',
        '/luxury-homes-for-sale/California/Toll-Brothers-at-South-Main/Myra',
        '/luxury-homes-for-sale/Oregon/Toll-Brothers-at-Hosford-Farms-Terra-Collection/Quick-Move-In/280118',
        '/luxury-homes-for-sale/Texas/Toll-Brothers-at-Woodland-Estates',
        '/luxury-homes-for-sale/Colorado/Toll-Brothers-at-Macanta',
        '/luxury-homes-for-sale/California/The-Station/Outlook',
        '/luxury-homes-for-sale/California/Toll-Brothers-at-South-Main',
        '/luxury-homes-for-sale/Florida/Regency-at-EverRange'
      ]

      Promise.allSettled(
        routes.map((route) =>
          fetch(`${tollRouteApi}${route}`)
            .then((response) => {
              // console.log('Fetch response for', route, ':', response)
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
        .then((results) => {
          setIsThinking(false)
          const communities = results
            .filter((result) => result.status === 'fulfilled' && result.value)
            .map((result) => result.value)

          console.log('Fetched communities:', communities)

          if (communities.length > 0) {
            const newBotMessage = {
              id: Date.now(),
              text: 'Here are some communities that you might like:',
              type: 'products',
              products: communities
            }

            setMessages([...messages, newBotMessage])
          } else {
            console.error('No communities were successfully fetched')
          }
        })
        .catch((error) => {
          console.error('Error fetching routes:', error)
        })
    }, 2000)
  }, [])

  useEffect(() => {
    if (
      chatContainerRef.current &&
      messageContainerRef.current?.lastElementChild
    ) {
      const lastElement = messageContainerRef.current.lastElementChild
      const elementTop = lastElement.offsetTop
      const offset = 80
      chatContainerRef.current.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      })
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
              type='button'
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
            <div className={styles.messages} ref={messageContainerRef}>
              {messages.map((msg) => {
                if (msg.type === 'user') {
                  return <UserMessage key={msg.id} message={msg.text} />
                } else if (msg.type === 'bot') {
                  return (
                    <BotMessage
                      key={msg.id}
                      message={msg.text}
                      component={msg.component}
                    />
                  )
                } else if (msg.type === 'prompt') {
                  return (
                    <OptionsList
                      key={msg.id}
                      options={msg.options}
                      onOptionSelect={handleOptionSelect}
                    />
                  )
                } else if (msg.type === 'products') {
                  return (
                    <BotMessage
                      key={msg.id}
                      message={msg.text}
                      component={
                        <ProductsList
                          products={msg.products}
                          handleProductSelect={handleProductSelect}
                          utils={utils}
                        />
                      }
                    />
                  )
                } else if (msg.type === 'product') {
                  return (
                    <BotMessage
                      key={msg.id}
                      message={msg.text}
                      component={
                        <ProductLayout
                          key={msg.id}
                          product={msg.product}
                          utils={utils}
                          handleProductSelect={handleProductSelect}
                        />
                      }
                    />
                  )
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
                type='button'
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
