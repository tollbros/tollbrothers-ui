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
import { ChatBotForm } from './ChatBotForm'

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
  availabilityAPI,
  setDisableLiveChat = () => null,
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
  const messageContainerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [isThinking, setIsThinking] = useState(false)
  const [sessionId, setSessionId] = useState(null)

  console.log('chatRegion :', chatRegion)
  console.log('productCode :', productCode)

  const onChatButtonClick = () => {
    setIsChatOpen(true)
  }

  const onCloseChat = () => {
    setIsChatOpen(false)
  }

  const handleShowChatForm = () => {
    const newBotMessage = {
      id: Date.now(),
      text: 'In order to connect you with a local expert, please select your area of interest:',
      type: 'form'
    }

    setMessages((prev) => [
      ...prev.filter((msg) => msg.type !== 'form'),
      newBotMessage
    ])
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputMessage(value)
  }

  const handleSendMessage = async (_event, systemMessage) => {
    if (!inputMessage.trim() && !systemMessage) return

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

    const promp = {
      prompt: userMessageText,
      session_id: sessionId || ''
    }

    sendMessage(promp, {
      baseUrl: 'https://c5wmooifc5.execute-api.us-east-1.amazonaws.com/prod',
      apiKey: 'hakKak197h8VbuVbPdU2H8ggcUCsWmIa8GUMwdUC',
      onChunk: (response) => {
        console.log('chunk:', response)
        setSessionId(response.session_id)
        const products = [
          ...(response.communities || []),
          ...(response.qmis || []),
          ...(response.homeDesigns || [])
        ]

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
        setError(
          'An error occurred while sending the message. Pleaesse try again.'
        )
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

  const handleProductSelect = async (
    product,
    { fromProductsList = false, fromModelList = false } = {}
  ) => {
    const isModel = Boolean(product.commPlanID)
    let modelData = null

    if (isModel && !fromProductsList) {
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
      setMessages((prev) => [
        ...prev.filter((msg) => msg.type !== 'product'),
        newBotMessage
      ])
    } else if (fromModelList) {
      setMessages((prev) => [
        ...prev.filter(
          (msg) => msg.type !== 'product' || msg.productType !== 'model'
        ),
        newBotMessage
      ])
    } else {
      setMessages((prev) => [...prev, newBotMessage])
    }
  }

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
  //           .then(
  //             (data) =>
  //               data.communityComponent ??
  //               data.masterCommunityComponent ??
  //               data.modelComponent
  //           )
  //       )
  //     )
  //       .then((results) => {
  //         setIsThinking(false)
  //         const communities = results
  //           .filter((result) => result.status === 'fulfilled' && result.value)
  //           .map((result) => result.value)

  //         console.log('Fetched communities:', communities)

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
  }, [messages, isThinking])

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

      <div
        id='chatbot-interface'
        className={`${styles.interface} ${!isChatOpen ? styles.hidden : ''}`}
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
                        onClose={() =>
                          setMessages((prev) =>
                            prev.filter((m) => m.id !== msg.id)
                          )
                        }
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
                        onClose={() =>
                          setMessages((prev) =>
                            prev.filter((m) => m.type !== 'form')
                          )
                        }
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
          <button
            className={styles.transferButton}
            onClick={handleShowChatForm}
            type='button'
          >
            I want to talk to a Sales Consultant.
          </button>
        </div>
      </div>
    </div>
  )
}
