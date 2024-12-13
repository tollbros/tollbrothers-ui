'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'

import styles from './TollChat.module.scss'
import {
  handleChatInit,
  fetchAvailability,
  startConversation,
  endChat,
  createConversationListener,
  getConversationHistory
} from '../../utils/chat/apis'
import { convertTimeStamp, createMessagePayload } from '../../utils/chat/libs'
import ChatInput from './ChatInput'

import Minus from '../icons/Minus'
import Plus from '../icons/Plus'
import CloseX from '../icons/CloseX'

export const TollChat = ({
  availabilityAPI,
  endPoint,
  apiSfOrgId,
  apiSfName,
  city,
  state,
  disableFloatingChatButton = false,
  setChatStatus,
  chatStatus,
  chatRegion,
  setIsChatOpen = () => null,
  isChatOpen, // this is to open chat from a button in the parent app instead of a floating head
  sms
}) => {
  const [showChatButton, setShowChatButton] = useState(false)
  const [accessToken, setAccessToken] = useState(null)
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showChatHeader, setShowChatHeader] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [showTextChatOptions, setShowTextChatOptions] = useState(false)
  const [showWaitMessage, setShowWaitMessage] = useState(false)
  const [oscSsms, setOscSsms] = useState(sms || null)
  const [showConfirmationEndMessage, setShowConfirmationEndMessage] =
    useState(false)
  const chatContainerRef = useRef(null)
  const [customerFirstName, setCustomerFirstName] = useState('John')
  const [customerLastName, setCustomerLastName] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isCurrentlyChatting, setIsCurrentlyChatting] = useState(false) // if therer is an active chat
  const [showActiveTyping, setShowActiveTyping] = useState(false) // to differentiate between initial sender and agent
  const [isMinimized, setIsMinimized] = useState(false) // form panel controls
  const [systemMessage, setSystemMessage] = useState('') // system messages
  const [chatPhoto, setChatPhoto] = useState(null) // osc image
  const [reestablishedConnection, setReestablishedConnection] = useState(false) // reestablished connection

  // console.log('current chat region in tollchat:', chatRegion)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const initializeChat = async (
    firstName,
    lastName,
    endPoint,
    apiSfOrgId,
    apiSfName
  ) => {
    try {
      const token = await handleChatInit(endPoint, apiSfOrgId, apiSfName)

      if (!token) throw new Error('No token received.')

      setAccessToken(token.accessToken)

      const newUuid = conversationId || crypto.randomUUID()
      if (!conversationId || conversationId === null) {
        setConversationId(newUuid)
      }

      const payload = {
        accessToken: token.accessToken,
        customerEmail: formData.email,
        customerFirstName: firstName || 'Guest',
        customerLastName: lastName || '',
        conversationId: newUuid,
        region: chatRegion,
        endPoint,
        apiSfOrgId,
        apiSfName
      }

      await startConversation(payload, payload.apiSfName)
      setConversationId(payload.conversationId)

      const request = createConversationListener({
        firstName,
        lastName,
        endPoint,
        apiSfOrgId,
        accessToken: token.accessToken,
        conversationId: newUuid
      })

      sessionStorage.setItem(
        'tbChat',
        JSON.stringify({
          accessToken: token.accessToken,
          conversationId: newUuid,
          firstName,
          lastName
        })
      )

      await request({
        accessToken: token.accessToken,
        handleChatMessage
      })
    } catch (error) {
      console.error('Error initializing chat:', error)
    }
  }

  const handleChatMessage = async (event, firstName, lastName) => {
    const messages = []
    let message = {}
    let data, messagePayload

    switch (event.event) {
      case 'ping':
        break
      case 'CONVERSATION_ROUTING_RESULT':
        // seems to fire once when the the start conversation is called but agent has not
        // accepted and no messages yet sent/delivered
        setIsCurrentlyChatting(true)
        break
      case 'CONVERSATION_PARTICIPANT_CHANGED':
        data = JSON.parse(event.data)
        messagePayload = JSON.parse(data.conversationEntry.entryPayload)

        setShowWaitMessage(false)

        if (messagePayload?.entries?.[0]?.operation === 'remove') {
          sessionStorage.setItem('tbChat', JSON.stringify({}))
          setShowChatButton(false)
          setIsCurrentlyChatting(false)
          setConversationId(null)
          setAccessToken(null)
          setSystemMessage(
            messagePayload.entries[0].displayName + ' left the conversation'
          )
          setShowForm(false)
          setMessages([])
          setIsMinimized(false)
          setShowWaitMessage(false)
        } else {
          for (let i = 0; i < messagePayload?.entries?.length; i++) {
            const entry = messagePayload.entries[i]
            if (entry.operation === 'add') {
              setSystemMessage(`You're chatting with ` + entry.displayName)
              continue
            }
          }
        }

        break
      case 'CONVERSATION_MESSAGE':
        data = JSON.parse(event.data)
        console.log('convo message')

        message = createMessagePayload(
          {
            ...data.conversationEntry,
            entryPayload: JSON.parse(data.conversationEntry.entryPayload)
          },
          firstName,
          lastName
        )

        messages.push(message)

        break
      case 'CONVERSATION_DELIVERY_ACKNOWLEDGEMENT':
        console.log('conversation delivered acknowledge...')
        break
      case 'CONVERSATION_READ_ACKNOWLEDGEMENT':
        console.log('conversation read acknowledge...')
        break
      case 'CONVERSATION_TYPING_STARTED_INDICATOR':
        setShowActiveTyping(true)
        break
      case 'CONVERSATION_TYPING_STOPPED_INDICATOR':
        setShowActiveTyping(false)
        break
      case 'CONVERSATION_CLOSE_CONVERSATION':
        console.log('conversation close conversation...')

        sessionStorage.setItem('tbChat', JSON.stringify({}))
        setShowChatButton(false)
        setIsCurrentlyChatting(false)
        setConversationId(null)
        setSystemMessage(null)
        setAccessToken(null)
        setMessages([])
        setShowWaitMessage(false)
        setReestablishedConnection(false)
        break
      default:
        console.log('Unknown event:', event)
        break
    }

    if (messages.length > 0) {
      setMessages((prevMessages) => [...prevMessages, ...messages])
      setShowWaitMessage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const [firstName, ...lastNameParts] = formData.name.trim().split(' ')
    const lastName = lastNameParts.join(' ') || '(none)'

    setCustomerFirstName(firstName)
    setCustomerLastName(lastName)
    setShowWaitMessage(true)
    setShowForm(false)
    setSystemMessage(null)
    await initializeChat(firstName, lastName, endPoint, apiSfOrgId, apiSfName)
  }

  const showTextChatOption = () => {
    setShowTextChatOptions(!showTextChatOptions)
  }

  const showFormHandler = () => {
    setIsChatOpen(true)
    setShowChatHeader(true)
    setShowForm(true)
    setShowChatButton(false)
  }

  useEffect(() => {
    if ((!chatRegion || chatStatus === 'offline') && !isCurrentlyChatting) {
      setIsChatOpen(false)
      setShowChatHeader(false)
      setShowForm(false)
      setShowChatButton(false)
      setIsMinimized(false)
      return
    }

    if (isChatOpen && !isCurrentlyChatting) {
      showFormHandler()
      // setIsMinimized(false)
      return
    }

    if (
      chatRegion &&
      chatStatus === 'online' &&
      !isCurrentlyChatting &&
      !disableFloatingChatButton &&
      !showChatHeader
    ) {
      setShowChatButton(true)
    } else {
      setShowChatButton(false)
    }
  }, [
    chatStatus,
    isCurrentlyChatting,
    disableFloatingChatButton,
    isChatOpen,
    chatRegion
  ])

  useEffect(() => {
    async function getOscInfo() {
      try {
        const availability = await fetchAvailability(
          chatRegion,
          availabilityAPI
        )
        if (availability?.data?.payload?.length > 0) {
          setChatStatus('online')
          setChatPhoto(availability.data.payload[0].photo)
        }
      } catch (error) {
        console.error('Error fetching osc data:', error)
      }
    }

    if (chatRegion) {
      getOscInfo()
    }

    setChatStatus('offline')
  }, [chatRegion, availabilityAPI])

  useEffect(() => {
    const getConvoList = async (tbChat) => {
      try {
        const response = await getConversationHistory({
          accessToken: tbChat.accessToken,
          conversationId: tbChat.conversationId,
          endPoint
        })

        if (response?.conversationEntries?.length > 0) {
          const messages = response.conversationEntries.filter((entry) => {
            return entry.entryType === 'Message'
          })
          const formattedMessages = messages.map((message, index) => {
            return createMessagePayload(
              message,
              tbChat.firstName,
              tbChat.lastName,
              index
            )
          })

          setMessages(formattedMessages ?? [])
        } else {
          throw new Error('No conversation history')
        }
      } catch (err) {
        console.warn(`Conversation history error`)
      }
    }

    const reestablishConnection = async (tbChat) => {
      setReestablishedConnection(true)
      try {
        const request = createConversationListener({
          firstName: tbChat.firstName,
          lastName: tbChat.lastName,
          endPoint,
          apiSfOrgId,
          accessToken: tbChat.accessToken,
          conversationId: tbChat.conversationId
        })
        await request({
          accessToken: tbChat.accessToken,
          handleChatMessage
        })
      } catch (error) {
        console.error('Error reestablishing chat:', error)
      }
    }

    const tbChat = JSON.parse(sessionStorage.getItem('tbChat'))

    if (tbChat?.conversationId && tbChat?.accessToken) {
      setAccessToken(tbChat.accessToken)
      setConversationId(tbChat.conversationId)
      setShowChatButton(false)
      setIsCurrentlyChatting(true)
      setSystemMessage(null)
      setShowChat(true)
      setShowChatHeader(true)
      setShowWaitMessage(false)
      reestablishConnection(tbChat)
      getConvoList(tbChat)
    }
  }, [])

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
    setShowConfirmationEndMessage(false)
  }

  const handleConfirmationEnd = () => {
    setShowConfirmationEndMessage(true)
  }

  const handleStay = () => {
    setShowConfirmationEndMessage(false)
  }

  const handleEndChat = async () => {
    setSystemMessage(null)
    setShowWaitMessage(false)
    setIsMinimized(false)

    if (!accessToken || !conversationId) {
      setIsChatOpen(false)
      setIsCurrentlyChatting(false)
      setShowChatHeader(false)
      setShowForm(false)
      setSystemMessage(null)
      setReestablishedConnection(false)
      return
    }
    try {
      console.log('Ending chat...')
      await endChat({
        accessToken,
        conversationId,
        endPoint,
        apiSfName
      })
      setIsChatOpen(false)
      setIsCurrentlyChatting(false)
      setShowChatHeader(false)
      setShowForm(false)
      setSystemMessage(null)
      setConversationId(null)
      setAccessToken(null)
      setReestablishedConnection(false)
    } catch (error) {
      console.error('Chat end error:', error.message)
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isMinimized])

  return (
    <>
      {showChat && (
        <div
          className={`${styles.chatWrapper} ${
            showChatHeader ? styles.chatPanelOpen : ''
          } ${isMinimized ? styles.isMinimized : ''} ${
            endChat ? styles.endChat : ''
          } js_chatWrapper`}
          key='wrapper'
        >
          {showChatButton && (
            <>
              {showTextChatOptions && (
                <div className={styles.textChatOptions}>
                  <div className={styles.textChatWrapper}>
                    <button
                      className={`${styles.chatButton} ${styles.textChatButtons}`}
                      onClick={showFormHandler}
                    >
                      <img
                        src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/chat.svg'
                        alt='chat'
                      />
                      Chat
                    </button>
                    <a
                      href={oscSsms ? `sms:${oscSsms}` : '#'}
                      className={`${styles.textButton} ${styles.textChatButtons}`}
                      // onClick={}
                    >
                      <img
                        src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/chat.svg'
                        alt='chat'
                      />
                      Text
                    </a>
                  </div>
                </div>
              )}

              <button
                className={styles.chatLaunch}
                onClick={showTextChatOption}
              >
                <img
                  className={styles.oscHead}
                  src={
                    chatPhoto ??
                    'https://cdn.tollbrothers.com/images/osc/0053q00000B3pUhAAJ.jpg'
                  }
                  alt='osc'
                />

                {!showTextChatOptions && (
                  <span>
                    <img
                      className={styles.chatIcon}
                      src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/chat.svg'
                      alt='chat'
                    />
                  </span>
                )}
                {showTextChatOptions && (
                  <span>
                    <img
                      className={styles.closeIcon}
                      src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/close.svg'
                      alt='close'
                    />
                  </span>
                )}
              </button>
            </>
          )}
          {showChatHeader && (
            <div className={styles.header}>
              <div className={styles.location}>
                <p>
                  {/* {city}, {state} NEED TO REVISIT THIS */}
                  Toll Brothers
                </p>
              </div>
              <h2>Chat</h2>
              <div className={styles.panelControls}>
                <button onClick={() => handleMinimize()} type='button'>
                  {isMinimized ? <Plus fill='#000' /> : <Minus fill='#000' />}
                </button>
                <button onClick={() => handleConfirmationEnd()} type='button'>
                  <CloseX fill='#000' />
                </button>
              </div>
            </div>
          )}
          {showWaitMessage && (
            <>
              <p className={styles.waitMessage}>
                Please wait while we connect you with a representative.
              </p>
              <div className={styles.spinner} />
            </>
          )}
          {showConfirmationEndMessage && (
            <div className={styles.confirmationEndMessage}>
              <p>Are you sure you want to leave this chat?</p>
              <div className={styles.buttonWrapper}>
                <button onClick={handleStay}>Stay</button>
                <button onClick={handleEndChat}>Leave</button>
              </div>
            </div>
          )}
          {showForm && !isMinimized && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
                pattern='[A-Za-z\s]+'
                title='Name can only contain letters and spaces'
                placeholder='Full Name'
              />

              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
                placeholder='Email*'
              />

              <br />
              <p className={styles.privacyPolicy}>
                The information you provide will be used in accordance with our{' '}
                <a
                  href='https://www.tollbrothers.com/privacy'
                  target='_blank'
                  rel='noreferrer'
                >
                  Privacy Policy
                </a>
                .
              </p>

              <button type='submit'>Start Chatting</button>
            </form>
          )}

          <div className={styles.messagesWrapper} ref={chatContainerRef}>
            {/* they might want to add this back in later */}
            {/* {showActiveTyping && (
              <div className={`${styles.agent} ${styles.typingWrapper}`}>
                <div className={`${styles.message} `}>
                  <p className={styles.typingIndictor}>
                    <span className={styles.activeTypingWrapper}>
                      <span />
                      <span />
                      <span />
                    </span>
                  </p>
                </div>
              </div>
            )}{' '}
            */}
            {systemMessage && (
              <p className={styles.persistentText}>{systemMessage}.</p>
            )}
            {!isMinimized && (
              <>
                {messages.map(
                  (message, index) =>
                    message.type === 'Message' &&
                    !message.text?.includes('::System Message::') && (
                      <>
                        <div className={styles.timestamp}>
                          {convertTimeStamp(message.timestamp)}
                        </div>
                        {message.payload?.formatType === 'RichLink' && (
                          <Link
                            href={message.payload?.linkItem?.url}
                            key={`link${index}`}
                            className={`${styles.messageWrapper}  ${styles.agent}  ${styles.richFormat}`}
                          >
                            <img
                              src={message?.payload?.image?.assetUrl}
                              width={150}
                              height={84}
                              alt='Url'
                            />
                            <div className={styles.copyWrapper}>
                              <p>
                                {message.payload?.linkItem?.titleItem?.title}
                              </p>
                              <p>{message.payload?.linkItem?.url}</p>
                            </div>
                          </Link>
                        )}
                        {message.payload?.formatType === 'Attachments' && (
                          <>
                            <a
                              href={message?.payload?.attachments[0]?.url}
                              download
                              key={`attachment${index}`}
                              className={`${styles.messageWrapper}  ${styles.agent}  ${styles.richFormat}`}
                            >
                              {message?.payload?.attachments[0]?.name.endsWith(
                                '.pdf'
                              ) ? (
                                <div className={styles.copyWrapper}>
                                  <p>Download PDF</p>
                                </div>
                              ) : (
                                <>
                                  <img
                                    src={message?.payload?.attachments[0]?.url}
                                    width={150}
                                    height={84}
                                    alt='Agent Thumbnail'
                                  />
                                  <div className={styles.copyWrapper}>
                                    <p>Click to download</p>
                                  </div>
                                </>
                              )}
                            </a>
                          </>
                        )}
                        {message.payload?.formatType === 'Text' && (
                          <div
                            key={`index${index}`}
                            className={`${styles.messageWrapper}  ${
                              message?.role === 'Agent' ||
                              message?.role === 'System'
                                ? styles.agent
                                : styles.guest
                            }  js_messageWrapper`}
                          >
                            <>
                              {message.image && (
                                <img
                                  src={message.image}
                                  width={30}
                                  height={30}
                                  alt='Agent Thumbnail'
                                />
                              )}
                              {!message.image && message?.role === 'Agent' && (
                                <span>{message.initial}</span>
                              )}
                              <p
                                className={`${styles.message} ${
                                  showActiveTyping
                                    ? styles.activeTyping
                                    : styles.notActive
                                }`}
                              >
                                {message.text}
                              </p>
                            </>
                          </div>
                        )}
                      </>
                    )
                )}
              </>
            )}
          </div>

          {conversationId && accessToken && !isMinimized && (
            <div className={styles.chatInputWrapper}>
              <ChatInput
                accessToken={accessToken}
                conversationId={conversationId}
                customerFirstName={customerFirstName}
                customerLastName={customerLastName}
                setCustomerFirstName={setCustomerFirstName}
                setCustomerLastName={setCustomerLastName}
                apiSfName={apiSfName}
                endPoint={endPoint}
                reestablishedConnection={reestablishedConnection}
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}
