'use client'

import React, { useRef, useState, useEffect } from 'react'
import styles from './Chatbot.module.scss'
import { BotMessage } from './BotMessage'
import { UserMessage } from './UserMessage'
import { ThinkingIndicator } from './ThinkingIndicator'
import { OptionsList } from './OptionsList'
import { ProductsList } from './ProductsList'
import { ProductLayout } from './ProductLayout'
import { sendMessage } from './utils/sendMessage'
import { getProductData } from './utils/getProductData'
import { UserInputField } from '../UserInputField'
import { HeaderButtons } from '../HeaderButtons'
import { ChatBotForm } from './ChatBotForm'
import { useHorizontalResize } from './hooks/useHorizontalResize'
import { useFocusTrap } from './hooks/useFocusTrap'
import { setLocalStorage, getLocalStorage, isExpired, clearLocalStorage } from '../../../lib/utils'
import { ConfirmationEndDialog } from '../ConfirmationEndDialog'
import { useTollLiveChat } from '../hooks/useTollLiveChat'
import ChatInput from '../TollChat/ChatInput'
import { LiveChatMessage } from '../TollChat/LiveChatMessage'
import { CHATBOT_BUTTON_ICON, CHATBOT_ICON, CHAT_FALLBACK_IMAGE, OSC_ICON } from './constants'

// Build a user event object from product data
const buildUserEventObject = (product) => {
  let eventObject = {
    name: product.name,
    url: product.url,
    fromModelList: product.fromModelList || false,
    fromProductsList: product.fromProductsList || false,
    fromPageNavigation: product.fromPageNavigation || false
  }

  if (product.commPlanID) {
    eventObject.commPlanID = product.commPlanID
    eventObject.type = product.isQMI ? 'qmi' : 'homeDesign'
  } else if (product.isMaster && product.masterCommunityId) {
    eventObject.masterCommunityId = product.masterCommunityId
    eventObject.type = 'masterCommunity'
  } else if (product.communityId) {
    eventObject.communityId = product.communityId
    eventObject.type = 'community'
  } else {
    // most likely a static page or search page
    eventObject = product
  }

  return eventObject
}

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
  tollRegionsEndpoint,
  tollRouteApi,
  utils = {},
  chatRegion,
  productCode,
  pageSummaryData,
  availabilityAPI,
  liveChatEndPoint,
  apiSfOrgId,
  apiSfName,
  setIsChatBotOpenExternal = () => null,
  isChatBotOpenExternal, // this is to open chat from a button in the parent app
  chatEndpointId,
  chatApiKey
}) => {
  const chatInterfaceRef = useRef(null)
  const chatButtonRef = useRef(null)
  const messageContainerRef = useRef(null)
  const confirmationDialogRef = useRef(null)
  const { width, height, isResizing, handleStart } = useHorizontalResize(chatInterfaceRef)
  const [showChatbot, setShowChatbot] = useState(true)
  const [isChatBotOpen, setIsChatBotOpen] = useState(false)

  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [error, setError] = useState(null)
  const chatContainerRef = useRef(null)
  const isRestoringFromVisibilityChange = useRef(false)
  const [isThinking, setIsThinking] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sessionTime, setSessionTime] = useState(null) // 15 minutes in milliseconds
  const [userEvents, setUserEvents] = useState([])
  const [showConfirmationEndMessage, setShowConfirmationEndMessage] = useState(false)
  const [showConfirmationEndLiveMessage, setShowConfirmationEndLiveMessage] = useState(false)
  const [chatFormDialog, setChatFormDialog] = useState(null)
  const [isLiveChat, setIsLiveChat] = useState(false)
  const [wasFormSubmitted, setWasFormSubmitted] = useState(false)
  const [formSuccessCallback, setFormSuccessCallback] = useState(null)

  const disableTrap = useFocusTrap(
    isChatBotOpen,
    chatInterfaceRef,
    chatButtonRef,
    messageContainerRef,
    confirmationDialogRef
  )

  const {
    accessToken,
    messages: liveChatMessages,
    conversationId,
    systemMessage,
    chatPhoto,
    agentName,
    hasAgentEngaged,
    handleEndChat,
    reestablishConnection
  } = useTollLiveChat({
    availabilityAPI,
    endPoint: liveChatEndPoint,
    apiSfOrgId,
    apiSfName,
    productCode,
    utils
  })

  // Add to userEvents array, keeping only last page navigation and last card view
  const addUserEvent = (newEvent, from = {}) => {
    setUserEvents((prev) => {
      // Remove any existing event with the same name, type, and commPlanID (if exists)
      // Also remove previous events from product/model lists if new event is from those sources
      const filtered = prev.filter((event) => {
        const isSameName = event.name === newEvent.name
        const isSameType = event.type === newEvent.type
        const isSameCommPlanID = event.commPlanID === newEvent.commPlanID
        const isSameFrom =
          event.fromProductsList === from.fromProductsList &&
          event.fromModelList === from.fromModelList &&
          event.fromPageNavigation === from.fromPageNavigation
        const isDuplicate = isSameName && isSameType && isSameCommPlanID && isSameFrom

        const shouldRemoveFromList =
          (from.fromProductsList && (event.fromProductsList || event.fromModelList)) ||
          (from.fromModelList && event.fromModelList) ||
          (from.fromPageNavigation && event.fromPageNavigation)

        return !isDuplicate && !shouldRemoveFromList
      })

      const updated = [...filtered, newEvent]

      return updated.slice(-10)
    })
  }

  // console.log('chatRegion :', chatRegion)
  // console.log('productCode :', productCode)

  const onChatButtonClick = () => {
    setIsChatBotOpen(true)
  }

  const onMinimizeChat = () => {
    setIsChatBotOpen(false)
    setIsChatBotOpenExternal(false)
  }

  const onCloseChat = () => {
    setIsChatBotOpen(false)
    setIsChatBotOpenExternal(false)
    setMessages([])
    setSessionId(null)
    setSessionTime(null)
    setUserEvents((prev) => {
      const pageNavEvents = prev.filter((event) => event.fromPageNavigation)
      return pageNavEvents.length > 0 ? [pageNavEvents[pageNavEvents.length - 1]] : []
    })
    setShowConfirmationEndMessage(false)
    setShowConfirmationEndLiveMessage(false)
    setInputMessage('')
    setError(null)
    setIsThinking(false)
    setChatFormDialog(null)
    setIsLiveChat(false)
    window.localStorage.removeItem('tbChatBot')
    window.localStorage.removeItem('tbChat')

    // closese out the live chat session if it's active
    handleEndChat(accessToken, conversationId)
  }

  const handleConfirmationEnd = () => {
    setShowConfirmationEndMessage(true)
  }

  const handleStay = () => {
    setShowConfirmationEndMessage(false)
    setShowConfirmationEndLiveMessage(false)
  }

  const handleShowChatForm = ({ text = '', bypassLiveAgent = null } = {}) => {
    isRestoringFromVisibilityChange.current = false
    const newBotMessage = {
      id: Date.now(),
      text: text,
      type: 'form',
      bypassLiveAgent: bypassLiveAgent
    }

    setMessages((prev) => [...prev.filter((msg) => msg.type !== 'form'), newBotMessage])
  }

  const handleSwitchToChatbot = () => {
    setShowConfirmationEndLiveMessage(true)
  }

  const onCloseLiveChat = () => {
    handleEndChat(accessToken, conversationId)
    window.localStorage.removeItem('tbChat')
    setIsLiveChat(false)
    setShowConfirmationEndLiveMessage(false)

    const conversationEndedMessage = {
      id: `system-message-${Date.now()}`,
      type: 'system',
      text: 'Conversation ended with local expert.'
    }

    const newBotMessage = {
      id: Date.now() + 1,
      type: 'bot',
      text: 'Thank you for speaking with our local expert today. If you have additional questions, it would be my pleasure to assist you at any time.'
    }

    setMessages((prev) => [...prev.filter((msg) => msg.type !== 'form'), conversationEndedMessage, newBotMessage])
  }

  const onCloseChatForm = () => {
    setChatFormDialog(null)
    setMessages((prev) => prev.filter((m) => m.type !== 'form'))
  }

  const handleProductRemoval = (productId, product) => {
    setMessages((prev) => prev.filter((m) => m.id !== productId))
    if (product) {
      const isModel = Boolean(product.commPlanID)
      const isMaster = Boolean(product.isMaster)

      setUserEvents((prev) =>
        prev.filter((event) => {
          if (event.fromPageNavigation) {
            return true
          } else if (isModel && event.commPlanID === product.commPlanID) {
            return false
          } else if (!isMaster && !isModel && product.communityId && event.communityId === product.communityId) {
            return false
          } else if (
            isMaster &&
            !isModel &&
            product.masterCommunityId &&
            event.masterCommunityId === product.masterCommunityId
          ) {
            return false
          }
          return true
        })
      )
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputMessage(value)
  }

  const handleSendMessage = async (_event, systemMessage) => {
    if (!inputMessage.trim() && !systemMessage) return
    isRestoringFromVisibilityChange.current = false

    // FOR TESTING ONLY PLEASE REMOVE WHEN BOT IS READY TO GO LIVE
    // const urlParams = location.search;
    const urlParams = new URLSearchParams(window.location.search)
    const endpointId = urlParams.get('endpointId') ?? chatEndpointId
    const apiKey = urlParams.get('apiKey') ?? chatApiKey

    // console.log(systemMessage)

    // track user sent a new prompt
    if (utils?.dataLayerPush && !systemMessage) {
      utils.dataLayerPush({
        event: 'chatbot_prompt_sent'
      })
    }

    const userMessageText = (inputMessage || systemMessage).trim()
    const newUserMessage = {
      id: Date.now(),
      text: userMessageText,
      type: 'user'
    }

    setError(null)
    setMessages([...messages, newUserMessage])
    setInputMessage('')
    setIsThinking(true)

    const lastEvent = userEvents[userEvents.length - 1]

    const isSessionValid = sessionId && sessionTime && !isExpired(sessionTime)
    const promp = {
      prompt: userMessageText,
      session_id: isSessionValid ? sessionId : '',
      ...(lastEvent && lastEvent.type !== 'other' && { context: lastEvent })
    }

    let hasProducts = false

    sendMessage(promp, {
      baseUrl: `https://${endpointId}.execute-api.us-east-1.amazonaws.com/prod`,
      apiKey: apiKey,
      onChunk: (response) => {
        console.log('chunk:', response)
        setSessionId(response.session_id)
        setSessionTime(Date.now() + 15 * 60 * 1000) // set session expiry time to 15 minutes from now
        const products = [...(response.communities || []), ...(response.qmis || []), ...(response.homeDesigns || [])]

        if (response.transfer_to_osc) {
          handleShowChatForm({ text: response.message })
        } else if (products && Array.isArray(products) && products.length > 0) {
          hasProducts = true
          setIsThinking(true)
          // console.log('fetch products')
          getProductData(products, tollRouteApi)
            .then((productData) => {
              setIsThinking(false)
              // console.log('producst were fetched')
              console.log('getProductData products:', productData)
              if (productData?.length > 0) {
                const botResponse = {
                  id: Date.now() + 2,
                  text: response.message,
                  type: 'products',
                  products: productData
                }
                setMessages((prev) => [...prev, botResponse])
              } else {
                // TODO: might want to modify this message if no products found
                const botResponse = {
                  id: Date.now() + 1,
                  text: response.message,
                  type: 'bot'
                }

                setMessages((prev) => [...prev, botResponse])
              }
            })
            .catch((err) => {
              console.error('getProductData error:', err)
              setIsThinking(false)
            })
        } else if (response.error) {
          setError('An error occurred while sending the message. Please try again.')
          setIsThinking(false)
        } else {
          const botResponse = {
            id: Date.now() + 1,
            text: response.message,
            type: 'bot'
          }

          setMessages((prev) => [...prev, botResponse])
        }
      },
      onDone: () => {
        if (!hasProducts) setIsThinking(false)
        console.log('stream done')
      },
      onError: (err) => {
        setIsThinking(false)
        console.error('stream error:', err)
        setError('An error occurred while sending the message. Pleaesse try again.')
      }
    })
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

  const handleProductSelect = async (product, { fromProductsList = false, fromModelList = false } = {}) => {
    isRestoringFromVisibilityChange.current = false
    const isModel = Boolean(product.commPlanID)
    let modelData = null

    if (isModel && !fromProductsList) {
      setMessages((prev) => [...prev.filter((msg) => msg.productType !== 'model')])
      setIsThinking(true)
      modelData = await getProductData([product.url], tollRouteApi)
    }

    setIsThinking(false)
    const newBotMessage = {
      id: Date.now(),
      type: 'product',
      product: isModel ? modelData?.[0] || product : product,
      productType: isModel ? 'model' : 'community'
    }

    if (fromProductsList) {
      // Remove all existing product type messages before adding the new one
      setMessages((prev) => [...prev.filter((msg) => msg.type !== 'product'), newBotMessage])
    } else {
      setMessages((prev) => [...prev, newBotMessage])
    }

    addUserEvent(buildUserEventObject({ ...product, fromProductsList, fromModelList }), {
      fromModelList,
      fromProductsList
    })
  }

  const restoreUiChatSession = async (event) => {
    if (event && event.type === 'visibilitychange' && document.hidden) {
      return
    }

    const isFromVisibilityChange = event?.type === 'visibilitychange'
    if (isFromVisibilityChange) {
      isRestoringFromVisibilityChange.current = true
    }

    const stored = getLocalStorage('tbChatBot')
    console.log(stored)
    if (stored && stored.value && stored.value.expiry && !isExpired(stored.value.expiry)) {
      const {
        messages: storedMessages,
        sessionId: storedSessionId,
        expiry: storedExpiry,
        userEvents: storedUserEvents,
        wasFormSubmitted: storedWasFormSubmitted
      } = stored.value || {}

      if (storedMessages) {
        // Fetch product data for any messages that have products or product (stored as URLs)
        const messagesWithProductData = await Promise.all(
          storedMessages.map(async (msg) => {
            if (msg.products?.length > 0) {
              try {
                const productData = await getProductData(msg.products, tollRouteApi)
                return { ...msg, products: productData }
              } catch (err) {
                console.error('Error restoring product data:', err)
                return msg
              }
            } else if (msg.product && typeof msg.product === 'string') {
              try {
                const productData = await getProductData([msg.product], tollRouteApi)
                return { ...msg, product: productData?.[0] || msg.product }
              } catch (err) {
                console.error('Error restoring product data:', err)
                return msg
              }
            }
            return msg
          })
        )
        setMessages(messagesWithProductData)
      }
      if (storedSessionId) setSessionId(storedSessionId)
      if (storedExpiry) setSessionTime(storedExpiry)
      if (storedWasFormSubmitted) setWasFormSubmitted(storedWasFormSubmitted)
      if (storedUserEvents) {
        setUserEvents((prev) => {
          const combined = [...prev, ...storedUserEvents]
          // Remove duplicates based on name, type, and relevant IDs
          const seen = new Set()
          return combined.filter((event) => {
            const key = `${event.name}-${event.type}-${event.commPlanID || ''}-${event.communityId || ''}-${
              event.masterCommunityId || ''
            }`
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
        })
      }
      setIsChatBotOpen(true)
    } else if (stored) {
      clearLocalStorage('tbChatBot')
    }
  }

  useEffect(() => {
    restoreUiChatSession()

    window.addEventListener('visibilitychange', restoreUiChatSession)

    return () => {
      window.removeEventListener('visibilitychange', restoreUiChatSession)
    }
  }, [])

  // Store chatbot state in localStorage
  useEffect(() => {
    if (sessionId && sessionTime) {
      const messagesToStore = JSON.parse(JSON.stringify(messages.slice(-40)))

      messagesToStore.map((msg) => {
        if (msg.products?.length > 0) {
          msg.products = msg.products.map((p) => {
            return p.url
          })
        } else if (msg.product) {
          msg.product = msg.product.url
        }
      })

      setLocalStorage('tbChatBot', {
        messages: messagesToStore,
        sessionId,
        expiry: sessionTime,
        userEvents,
        wasFormSubmitted
      })
    }
  }, [messages, sessionId, sessionTime, userEvents, wasFormSubmitted])

  // useEffect(() => {
  //   setTimeout(() => {
  //     const routes = [
  //       '/luxury-homes-for-sale/California/Metro-Heights', // mix of future and non-future collections
  //       '/luxury-homes-for-sale/California/Metro-Heights/Ironridge', // future
  //       '/luxury-homes-for-sale/Florida/Alora', // Vip only
  //       '/luxury-homes-for-sale/New-York/Regency-at-Pearl-River', // hide tour
  //       '/luxury-homes-for-sale/New-York/Regency-at-Pearl-River/Maycomb',
  //       '/luxury-homes-for-sale/New-Jersey/400-Lake-at-Asbury-Park', // schedule a tour
  //       '/luxury-homes-for-sale/New-York/Regency-at-Kensico-Ridge', // DCA disclaimer "contact us" only cta
  //       '/luxury-homes-for-sale/Florida/Shores-at-RiverTown/Riverview-Collection/Quick-Move-In/MLS-2024039', // model with self guided tour
  //       '/luxury-homes-for-sale/Florida/Seabrook-Village' // community with self guided tour
  //     ]

  //     Promise.allSettled(
  //       routes.map((route) =>
  //         fetch(`${tollRouteApi}${route}`)
  //           .then((response) => {
  //             // console.log('Fetch response for', route, ':', response)
  //             if (!response.ok) {
  //               throw new Error(`HTTP error! status: ${response.status}`)
  //             }
  //             return response.json()
  //           })
  //           .then((data) => data.communityComponent ?? data.masterCommunityComponent ?? data.modelComponent)
  //       )
  //     )
  //       .then((results) => {
  //         setIsThinking(false)
  //         const communities = results
  //           .filter((result) => result.status === 'fulfilled' && result.value)
  //           .map((result) => result.value)

  //         // console.log('Fetched communities:', communities)

  //         if (communities.length > 0) {
  //           const newBotMessage = {
  //             id: Date.now(),
  //             text: 'Here are some communities that you might like:',
  //             type: 'products',
  //             products: communities
  //           }

  //           setMessages([...messages, newBotMessage])
  //         } else {
  //           console.error('No communities were successfully fetched')
  //         }
  //       })
  //       .catch((error) => {
  //         console.error('Error fetching routes:', error)
  //       })
  //   }, 2000)
  // }, [])

  useEffect(() => {
    if (isRestoringFromVisibilityChange.current) {
      isRestoringFromVisibilityChange.current = false
      return
    }

    if (chatContainerRef.current && messageContainerRef.current?.lastElementChild) {
      const lastElement = messageContainerRef.current.lastElementChild
      const elementTop = lastElement.offsetTop
      const offset = 80
      chatContainerRef.current.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      })
    }
  }, [messages, isThinking, chatFormDialog, error])

  // // Focus the dialog when it opens for screen reader announcement
  useEffect(() => {
    if (isChatBotOpen && chatInterfaceRef.current) {
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        chatInterfaceRef.current.focus()
      }, 100)
    }
  }, [isChatBotOpen])

  useEffect(() => {
    if (isChatBotOpenExternal) {
      setIsChatBotOpen(true)
    }
  }, [isChatBotOpenExternal])

  useEffect(() => {
    if (utils?.dataLayerPush && isChatBotOpen && !sessionId) {
      utils.dataLayerPush({
        event: 'chatbotClicked'
      })
    }
  }, [isChatBotOpen])

  useEffect(() => {
    if (pageSummaryData) {
      addUserEvent(buildUserEventObject({ ...pageSummaryData, fromPageNavigation: true }), { fromPageNavigation: true })
    }
  }, [pageSummaryData])

  // Live Chat Integration Start
  const onTransferSuccess = (data) => {
    console.log('Transfer successful with data:', data)

    reestablishConnection(null, {
      accessToken: data.sf_miaw_token,
      conversationId: data.sf_miaw_uuid,
      firstName: data.firstName,
      lastName: data.lastName
    })
  }

  useEffect(() => {
    if (hasAgentEngaged && conversationId && accessToken) {
      onCloseChatForm()
      setIsLiveChat(true)
      setWasFormSubmitted(true)
    } else if (!hasAgentEngaged && !conversationId && !accessToken) {
      setIsLiveChat(false)
    }
  }, [hasAgentEngaged, conversationId, accessToken])

  useEffect(() => {
    if (isLiveChat && liveChatMessages && liveChatMessages.length > 0 && hasAgentEngaged) {
      const filteredMessages = liveChatMessages.filter(
        (message) =>
          message.type === 'Message' &&
          !message.text?.includes('::System Message::') &&
          !(message.text?.startsWith('/url') && message?.role === 'Agent')
      )
      setMessages((prev) => {
        const existingIds = new Set(prev.filter((m) => m.type === 'Message').map((m) => m.id))
        const newMessages = filteredMessages.filter((m) => !existingIds.has(m.id))
        const prevFiltered = prev.filter((m) => m.payload?.formatType !== 'Typing')

        if (systemMessage && !prev.some((m) => m.text === systemMessage)) {
          newMessages.push({
            id: `system-message-${Date.now()}`,
            type: 'system',
            text: systemMessage
          })
        }

        return [...prevFiltered, ...newMessages]
      })
    } else if (!isLiveChat && systemMessage) {
      setMessages((prev) => {
        const newMessages = []
        if (!prev.some((m) => m.text === systemMessage)) {
          newMessages.push({
            id: `system-message-${Date.now()}`,
            type: 'system',
            text: systemMessage
          })
        }

        return [...prev, ...newMessages]
      })
    }
  }, [isLiveChat, liveChatMessages, hasAgentEngaged, systemMessage])

  // Live Chat Integration End

  if (!showChatbot) {
    return null
  }

  return (
    <aside className={`${styles.root}`} aria-label='chat'>
      <button
        id='chabot-launch-button'
        ref={chatButtonRef}
        className={`${styles.launchButton} ${styles.buttonReset} ${isChatBotOpen ? styles.hidden : ''}`}
        onClick={onChatButtonClick}
        aria-label={isLiveChat ? 'Open Live Chat' : 'Open Toll Brothers AI Concierge'}
        aria-controls='chatbot-interface'
        aria-expanded={isChatBotOpen}
      >
        <img
          src={isLiveChat && chatPhoto ? chatPhoto : CHATBOT_BUTTON_ICON}
          onError={(e) => {
            e.currentTarget.src = CHAT_FALLBACK_IMAGE
          }}
          alt='chat icon'
        />
      </button>

      <div
        id='chatbot-interface'
        className={`${styles.interface} ${!isChatBotOpen ? styles.hidden : ''}`}
        ref={chatInterfaceRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        role='dialog'
        aria-modal='true'
        aria-label={isLiveChat ? `Live Chat ${agentName ? `with ${agentName}` : ''}` : 'Toll Brothers AI Concierge'}
        tabIndex={-1}
      >
        <div
          className={`${styles.resizeHandle} ${isResizing ? styles.resizing : ''}`}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          role='separator'
          aria-label='Resize chat'
        >
          <svg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M0 10L10 0M0 5L5 0' stroke='currentColor' strokeWidth='1' />
          </svg>
        </div>
        <div className={styles.header}>
          <div className={styles.title}>
            <img
              className={`${styles.icon} ${isLiveChat ? styles.agentIcon : ''}`}
              src={isLiveChat && chatPhoto ? chatPhoto : CHATBOT_ICON}
              onError={(e) => {
                e.currentTarget.src = CHAT_FALLBACK_IMAGE
              }}
              alt='chat icon'
            />
            <span>{isLiveChat ? `Live Chat ${agentName ? `- ${agentName}` : ''}` : "Hi, I'm AI Concierge"}</span>
          </div>
          <HeaderButtons className={styles.headerButtons} onClose={handleConfirmationEnd} onMinimize={onMinimizeChat} />
        </div>
        <div className={styles.body} ref={chatContainerRef}>
          <p>
            I am the Toll Brothers AI Concierge. I can assist with your home search using the prompts below or direct
            you to one of our human experts for additional help.
          </p>
          <section className={styles.messages} ref={messageContainerRef} role='log' aria-label='Chat messages'>
            {messages.map((msg, index) => {
              if (msg.type === 'user') {
                return <UserMessage key={msg.id} message={msg.text} />
              } else if (msg.type === 'bot') {
                return <BotMessage key={msg.id} message={msg.text} component={msg.component} />
              } else if (msg.type === 'prompt') {
                return <OptionsList key={msg.id} options={msg.options} onOptionSelect={handleOptionSelect} />
              } else if (msg.type === 'products') {
                return (
                  <BotMessage
                    key={msg.id}
                    message={msg.text}
                    component={
                      <ProductsList
                        products={msg.products}
                        handleProductSelect={(product) =>
                          handleProductSelect(product, {
                            fromProductsList: true
                          })
                        }
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
                        onClose={() => handleProductRemoval(msg.id, msg.product)}
                        onMinimizeChat={onMinimizeChat}
                        clearFocusTrap={disableTrap}
                      />
                    }
                  />
                )
              } else if (msg.type === 'form') {
                return (
                  <div className={styles.chatFormContainer} key={msg.id}>
                    {msg.text && !chatFormDialog && <BotMessage key={msg.id} message={msg.text} />}
                    <BotMessage
                      component={
                        <ChatBotForm
                          message={msg.text}
                          bypassLiveAgent={msg.bypassLiveAgent}
                          chatRegion={chatRegion}
                          productCode={productCode}
                          sessionId={sessionId}
                          tollRegionsEndpoint={tollRegionsEndpoint}
                          availabilityAPI={availabilityAPI}
                          chatEndpointId={chatEndpointId}
                          chatApiKey={chatApiKey}
                          onClose={onCloseChatForm}
                          utils={utils}
                          onTransferSuccess={onTransferSuccess}
                          setChatFormDialog={setChatFormDialog}
                          setWasFormSubmitted={setWasFormSubmitted}
                          chatFormDialog={chatFormDialog}
                          setFormSuccessCallback={setFormSuccessCallback}
                        />
                      }
                    />
                  </div>
                )
              } else if (msg.type === 'Message') {
                return <LiveChatMessage key={msg.id} message={msg} />
              } else if (msg.type === 'system') {
                return (
                  <p key={msg.id} className={styles.systemMessage}>
                    {msg.text}
                  </p>
                )
              }
            })}

            {isThinking && <BotMessage component={<ThinkingIndicator />} />}
            {error && <div className={styles.errorMessage}>{error}</div>}
            {/* {systemMessage && <p key='system'>{systemMessage}</p>} */}
          </section>
        </div>
        <div className={styles.footer}>
          {!isLiveChat && (
            <UserInputField
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onSend={handleSendMessage}
              placeholder='Ask AI Concierge your question here.'
              disabled={chatFormDialog || isThinking}
            />
          )}
          {conversationId && accessToken && isLiveChat && (
            <ChatInput
              accessToken={accessToken}
              conversationId={conversationId}
              apiSfName={apiSfName}
              endPoint={liveChatEndPoint}
              setError={setError}
              placeholder='Ask your question here.'
            />
          )}
          {!chatFormDialog && !isLiveChat && (
            <button className={styles.transferButton} onClick={handleShowChatForm} type='button'>
              <img src={OSC_ICON} />
              <span>Speak to an expert</span>
            </button>
          )}
          {isLiveChat && (
            <button className={styles.transferButton} onClick={handleSwitchToChatbot} type='button'>
              <img src={CHATBOT_ICON} />
              <span>Speak to the AI Concierge</span>
            </button>
          )}
        </div>
        {showConfirmationEndMessage && (
          <ConfirmationEndDialog
            ref={confirmationDialogRef}
            onStay={handleStay}
            onLeave={onCloseChat}
            isContactOption={!wasFormSubmitted}
            onContact={() => {
              setShowConfirmationEndMessage(false)
              handleShowChatForm({
                bypassLiveAgent: true
              })
            }}
            message={
              !wasFormSubmitted
                ? 'Our local experts can provide additional details. Share your contact information, and we will follow up with you.'
                : undefined
            }
          />
        )}
        {showConfirmationEndLiveMessage && (
          <ConfirmationEndDialog
            ref={confirmationDialogRef}
            onStay={handleStay}
            onLeave={onCloseLiveChat}
            message='Are you sure you want to return to AI Concierge and end the chat with our local expert?'
          />
        )}
      </div>
      {formSuccessCallback && <iframe className={styles.callbackIframe} src={formSuccessCallback} />}
    </aside>
  )
}
