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
import { deleteExtraProductInfo } from './utils/deleteExtraProductInfo'
import { UserInputField } from '../UserInputField'
import { ChatBotForm } from './ChatBotForm'
import { useHorizontalResize } from './hooks/useHorizontalResize'
import { setLocalStorage, getLocalStorage, isExpired, clearLocalStorage } from '../../../lib/utils'

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
  setIsChatBotOpenExternal = () => null,
  isChatBotOpenExternal, // this is to open chat from a button in the parent app
  setChatBotTransferData = () => null,
  trackChatEvent = () => null,
  chatClickedEventString = 'chatClicked',
  chatStartedEventString = 'chatStarted'
}) => {
  const chatInterfaceRef = useRef(null)
  const { width, height, isResizing, handleStart } = useHorizontalResize(chatInterfaceRef)
  const [showChatbot, setShowChatbot] = useState(true)
  const [isChatBotOpen, setIsChatBotOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [error, setError] = useState(null)
  const chatContainerRef = useRef(null)
  const messageContainerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [isThinking, setIsThinking] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sessionTime, setSessionTime] = useState(null) // 15 minutes in milliseconds
  const [userEvents, setUserEvents] = useState([])

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

  const onCloseChat = () => {
    setIsChatBotOpen(false)
    setIsChatBotOpenExternal(false)
  }

  const handleShowChatForm = () => {
    const newBotMessage = {
      id: Date.now(),
      text: 'In order to connect you with a local expert, please select your area of interest:',
      type: 'form'
    }

    setMessages((prev) => [...prev.filter((msg) => msg.type !== 'form'), newBotMessage])
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

    // FOR TESTING ONLY PLEASE REMOVE WHEN BOT IS READY TO GO LIVE
    // const urlParams = location.search;
    const urlParams = new URLSearchParams(window.location.search)
    const endpointId = urlParams.get('endpointId') ?? 'c5wmooifc5'
    const apiKey = urlParams.get('apiKey') ?? 'hakKak197h8VbuVbPdU2H8ggcUCsWmIa8GUMwdUC'

    // console.log(systemMessage)

    const userMessageText = inputMessage || systemMessage
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

    sendMessage(promp, {
      baseUrl: `https://${endpointId}.execute-api.us-east-1.amazonaws.com/prod`,
      apiKey: apiKey,
      onChunk: (response) => {
        console.log('chunk:', response)
        setSessionId(response.session_id)
        setSessionTime(Date.now() + 15 * 60 * 1000) // set session expiry time to 15 minutes from now
        const products = [...(response.communities || []), ...(response.qmis || []), ...(response.homeDesigns || [])]

        if (products && Array.isArray(products) && products.length > 0) {
          setIsThinking(true)
          getProductData(products, tollRouteApi)
            .then((productData) => {
              setIsThinking(false)
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
        setIsThinking(false)
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

  const restoreUiChatSession = (event) => {
    if (event && event.type === 'visibilitychange' && document.hidden) {
      return
    }

    const stored = getLocalStorage('tbChatBot')
    console.log(stored)
    if (stored && stored.value && stored.value.expiry && !isExpired(stored.value.expiry)) {
      const {
        messages: storedMessages,
        sessionId: storedSessionId,
        expiry: storedExpiry,
        userEvents: storedUserEvents
      } = stored.value || {}
      if (storedMessages) setMessages(storedMessages)
      if (storedSessionId) setSessionId(storedSessionId)
      if (storedExpiry) setSessionTime(storedExpiry)
      if (storedUserEvents) setUserEvents(storedUserEvents)
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
      const messagesToStore = messages.slice(-10)

      messagesToStore.map((msg) => {
        if (msg.products?.length > 0) {
          msg.products = msg.products.map((p) => {
            const productToStore = { ...p }
            deleteExtraProductInfo(productToStore)
            return productToStore
          })
        } else if (msg.product) {
          const productToStore = { ...msg.product }
          deleteExtraProductInfo(productToStore)
          return productToStore
        }
      })

      setLocalStorage('tbChatBot', { messages: messagesToStore, sessionId, expiry: sessionTime, userEvents })
    }
  }, [messages, sessionId, sessionTime, userEvents])

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
    if (chatContainerRef.current && messageContainerRef.current?.lastElementChild) {
      const lastElement = messageContainerRef.current.lastElementChild
      const elementTop = lastElement.offsetTop
      const offset = 80
      chatContainerRef.current.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      })
    }
  }, [messages, isThinking])

  useEffect(() => {
    if (isChatBotOpenExternal) {
      setIsChatBotOpen(true)
    }
  }, [isChatBotOpenExternal])

  // useEffect(() => {
  //   setTimeout(() => {
  //     setChatBotTransferData({
  //       accessToken:
  //         'eyJvcmdKd3QuaW5jbCI6ZmFsc2UsImtpZCI6IjQ2NDkzYjJhMTI4NTgyN2YxMWRkZWVlMTZmNTg2ZTFmNTk0NDY4YzY4YTM5ZDczMjZmYTZlYjVjNWZjMjAwMDgiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ2Mi9pYW1lc3NhZ2UvVU5BVVRIL05BL3VpZDowMjg4MTQzMS0wNjFlLTQyYWMtYTIwZi1iMDAzOTI5MjEwNmUiLCJjbGllbnRJZCI6InYxL09TQ19XZWJfQVBJLzk3MmI1MGViLTAwZmEtNDhhMy05NWQ0LTkxMWI0MDgwNTY4NSIsImZhbGNvbkNlbGwiOiJzY3J0MDEiLCJjaGFubmVsQWRkSWQiOiIxZTFlM2M2NS1jODEyLTRhYzItYjQyNy1lMGEyNjQ4NjE5NGEiLCJpc3MiOiJpYW1lc3NhZ2UiLCJmYWxjb25GRCI6InVlbmdhZ2UxIiwiZGV2aWNlSWQiOiIrSDYxcXpvb2M1bFBaeXlVd0RnNkpZclkrT0JHalBCU2E5VmY4NEhIUHgvOXhEd0F5dHFHbEhPVG5lZnhGUUdWbS83cE5YMCtJLzNFbCt1bGpmVm5kUT09IiwiY2FwYWJpbGl0aWVzVmVyc2lvbiI6IjI0OCIsIm9yZ0lkIjoiMDBETzgwMDAwME5RT1BkIiwiZGV2aWNlSW5mbyI6Int9IiwicGxhdGZvcm0iOiJXZWIiLCJmYWxjb25GSUhhc2giOiJseXdmcGQiLCJqd3RJZCI6IjU4OXBmZlFDZjNXSXFHdGJxQXNnY1YiLCJjbGllbnRTZXNzaW9uSWQiOiJhNGE4ZGY5OC03YmFkLTRhNWMtODIyOS00NWM1MDUwZDk2YzEiLCJhdWQiOiJVU0VSIiwiZXZ0S2V5Ijoic2NydC5wcm9kLmV2ZW50cm91dGVyX19hd3MuYXdzLXByb2Q1LXVzd2VzdDIudWVuZ2FnZTEuYWpuYWxvY2FsMV9fcHVibGljLmV2ZW50cy5zY3J0MDE6NjEiLCJvcmdNaWdyYXRpb25CZWhhdmlvciI6dHJ1ZSwiYXBpVmVyc2lvbiI6InYyIiwic2NvcGUiOiJwdWJsaWMiLCJqd2tzX3VyaSI6Imh0dHBzOi8vc2NydDAxLnVlbmdhZ2UxLnNmZGMtbHl3ZnBkLnN2Yy5zZmRjZmMubmV0L2lhbWVzc2FnZS92MS8ud2VsbC1rbm93bi9qd2tzLmpzb24_a2V5SWQ9NDY0OTNiMmExMjg1ODI3ZjExZGRlZWUxNmY1ODZlMWY1OTQ0NjhjNjhhMzlkNzMyNmZhNmViNWM1ZmMyMDAwOCIsImVzRGVwbG95bWVudFR5cGUiOiJBUEkiLCJleHAiOjE3NzA2OTkwMjUsImlhdCI6MTc3MDY3NzM2NX0.U0cy2-59nAqc5HZDoRQMnjxkc4IHF8yj4fxHJoZEo-vco_5W0F7XnaSxDKFob5exXu2c69LWWv3zdaH8rVniBjyqYVkrbpuLANpVqHznX1VHLTPJj5oMXFcHryikPxCEV9RfFJ2I5BsVnsGJJdFUy3Y1vw3yMgId2yqp4oFuNqQ1zQ2bEzYiT7MaopQtqzJJjgViqjbdex_9w1AMizVCJ6Q6uOntoXEsSanFrVnMVij4njKyLYoqFoDK9LnSXdZqij0pAjR62SvV7ho1o60gDaQhTehxbPrSzvo3Q6z7IHihMKGeKVOVsS8-MW3eGn2S8KDACG1BQOj6_ZmHGoyDGw',
  //       conversationId: '1284d46f-3785-4fd6-a77f-3df284c82530',
  //       firstName: 'Michael',
  //       lastName: 'Duarte',
  //     })
  //     onCloseChat()
  //   }, 5000)
  // }, [])

  useEffect(() => {
    if (pageSummaryData) {
      addUserEvent(buildUserEventObject({ ...pageSummaryData, fromPageNavigation: true }), { fromPageNavigation: true })
    }
  }, [pageSummaryData])

  if (!showChatbot) {
    return null
  }

  return (
    <div className={`${styles.root}`}>
      <button
        className={`${styles.launchButton} ${styles.buttonReset} ${isChatBotOpen ? styles.hidden : ''}`}
        onClick={onChatButtonClick}
        aria-label="Open Toll Brothers' AI Assistant"
        aria-controls='chatbot-interface'
        aria-expanded={isChatBotOpen}
      >
        <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/chatbot-button.svg' />
      </button>

      <div
        id='chatbot-interface'
        className={`${styles.interface} ${!isChatBotOpen ? styles.hidden : ''}`}
        ref={chatInterfaceRef}
        style={{ width: `${width}px`, height: `${height}px` }}
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
            <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/close.svg' alt='' />
          </button>
        </div>
        <div className={styles.body} ref={chatContainerRef}>
          <p>
            I am the Toll Brothers AI assistant. I can assist with your home search using the prompts below or direct
            you to one of our human experts for additional help.
          </p>
          <div className={styles.messages} ref={messageContainerRef}>
            {messages.map((msg) => {
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
                        onCloseChat={onCloseChat}
                      />
                    }
                  />
                )
              } else if (msg.type === 'form') {
                return (
                  <BotMessage
                    key={msg.id}
                    component={
                      <ChatBotForm
                        chatRegion={chatRegion}
                        productCode={productCode}
                        tollRegionsEndpoint={tollRegionsEndpoint}
                        availabilityAPI={availabilityAPI}
                        onClose={() => setMessages((prev) => prev.filter((m) => m.type !== 'form'))}
                      />
                    }
                  />
                )
              }
            })}

            {isThinking && <BotMessage component={<ThinkingIndicator />} />}
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>
        </div>
        <div className={styles.footer}>
          <UserInputField
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onSend={handleSendMessage}
            placeholder='Ask TollBot your question here.'
          />
          <button className={styles.transferButton} onClick={handleShowChatForm} type='button'>
            I want to talk to a Sales Consultant.
          </button>
        </div>
      </div>
    </div>
  )
}
