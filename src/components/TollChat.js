'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'

import styles from './TollChat.module.scss'
import {
  handleChatInit,
  fetchAvailability,
  startConversation,
  listenToConversation,
  endChat
} from '../../utils/chat'
import ChatInput from './ChatInput'

import Minus from '../icons/Minus'
import Plus from '../icons/Plus'
import CloseX from '../icons/CloseX'

export const TollChat = ({
  availabilityAPI,
  endPoint,
  oscAvailable,
  apiSfOrgId,
  apiSfName,
  communityRegion,
  city,
  state,
  classes = {},
  disableFloatingChatButton = false,
  setChatStatus,
  chatStatus,
  chatRegion,
  setIsChatOpen = () => null,
  isChatOpen // this is to open chat from a button in the parent app instead of a floating head
}) => {
  const [showChatButton, setShowChatButton] = useState(false)
  const [accessToken, setAccessToken] = useState(null)

  const [messages, setMessages] = useState([])

  const [conversationId, setConversationId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [showChatHeader, setShowChatHeader] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [showWaitMessage, setShowWaitMessage] = useState(false)
  const chatContainerRef = useRef(null)

  const [customerFirstName, setCustomerFirstName] = useState('John')
  const [customerLastName, setCustomerLastName] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isCurrentlyChatting, setIsCurrentlyChatting] = useState(false) // if therer is an active chat
  const [showActiveTyping, setShowActiveTyping] = useState(false) // to differentiate between initial sender and agent

  const [isMinimized, setIsMinimized] = useState(false) // form panel controls
  const [systemMessage, setSystemMessage] = useState('') // system messages
  const [chatPhoto, setChatPhoto] = useState(null) // osc image

  console.log('current chat region in tollchat:', chatRegion)

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
        customerFirstName: firstName || 'John',
        customerLastName: lastName || '',
        conversationId: newUuid,
        firstName: 'john',
        lastName: '',
        region: chatRegion,
        endPoint,
        apiSfOrgId,
        apiSfName
      }

      await startConversation(payload, payload.apiSfName)

      setConversationId(payload.conversationId)

      console.log('conversationId:', conversationId)

      const retryFunction = (attempts) => attempts < 3
      const { request } = listenToConversation(
        retryFunction,
        2000,
        firstName,
        lastName,
        payload.endPoint,
        apiSfOrgId,
        token.accessToken,
        payload.conversationId
      )
      if (typeof request !== 'function') {
        throw new Error(
          'Invalid request function returned from listenToConversation'
        )
      }
      await request({
        accessToken: token.accessToken,
        handleChatMessage
      })
    } catch (error) {
      console.error('Error initializing chat:', error)
    }
  }

  const convertId15to18 = (id15) => {
    // this converts the 15 character id to 18 character id for salesforce
    let suffix = ''
    const mapping = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ012345'

    for (let block = 0; block < 3; block++) {
      let loop = 0

      for (let position = 4; position >= 0; position--) {
        const char = id15.charAt(block * 5 + position)

        if (char >= 'A' && char <= 'Z') {
          loop += 1 << position
        }
      }

      suffix += mapping.charAt(loop)
    }

    return id15 + suffix
  }

  const handleChatMessage = async (
    event,
    firstName,
    lastName,
    accessToken,
    conversationId
  ) => {
    const typingMessages = []
    const messages = []
    let message = {}
    let data, messagePayload

    // console.log(firstName)

    console.log(event.event)

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

        console.log(data)
        console.log(messagePayload)

        if (messagePayload?.entries?.[0]?.operation === 'remove') {
          sessionStorage.setItem('tbChat', JSON.stringify({}))
          setShowChatButton(false)
          setIsCurrentlyChatting(false)
          setConversationId(null)
          // setChatStartReady(false)
          setAccessToken(null)
          setSystemMessage(
            messagePayload.entries[0].displayName + ' left the conversation'
          )
          // setShowChatHeader(false)
          setShowForm(false)
          setMessages([])
          setIsMinimized(false)
        } else {
          // fires when an agent accepts
          sessionStorage.setItem(
            'tbChat',
            JSON.stringify({ accessToken, conversationId, firstName, lastName })
          )

          for (let i = 0; i < messagePayload?.entries?.length; i++) {
            const entry = messagePayload.entries[i]

            if (entry.operation === 'add') {
              setSystemMessage(`You're chatting with ` + entry.displayName)
              continue
            }

            message = {
              id: `${data.conversationEntry.identifier}${i}`, // just needs to be unique
              type: data.conversationEntry.entryType,
              initial: entry.displayName.charAt(0),
              timestamp: data.conversationEntry.clientTimestamp,
              role: data.conversationEntry.sender.role,
              sender:
                data.conversationEntry.sender.role === 'EndUser' &&
                data.conversationEntry.senderDisplayName === 'Guest'
                  ? `${firstName} ${lastName}`
                  : data.conversationEntry.senderDisplayName,
              image: `https://cdn.tollbrothers.com/images/osc/${convertId15to18(
                entry.participant.subject
              )}.jpg`
            }

            console.log(message)

            messages.push(message)
          }
        }

        break
      case 'CONVERSATION_MESSAGE':
        data = JSON.parse(event.data)
        messagePayload = JSON.parse(data.conversationEntry.entryPayload)

        console.log('convo message')

        message = {
          id: data.conversationEntry.identifier,
          payload: messagePayload.abstractMessage.staticContent,
          type: data.conversationEntry.entryType,
          text: messagePayload.abstractMessage.staticContent.text,
          timestamp: data.conversationEntry.clientTimestamp,
          role: data.conversationEntry.sender.role,
          sender:
            data.conversationEntry.sender.role === 'EndUser' &&
            data.conversationEntry.senderDisplayName === 'Guest'
              ? `${firstName} ${lastName}`
              : data.conversationEntry.senderDisplayName
        }

        if (data.conversationEntry.sender.role !== 'EndUser') {
          message.image = `https://cdn.tollbrothers.com/images/osc/${convertId15to18(
            data.conversationEntry.sender.subject
          )}.jpg`
        }

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

        data = JSON.parse(event.data)
        messagePayload = JSON.parse(data.conversationEntry.entryPayload)

        message = {
          id: data.conversationEntry.identifier,
          type: data.conversationEntry.entryType,
          text: `${data.conversationEntry.senderDisplayName} is typing...`,
          timestamp: data.conversationEntry.clientTimestamp,
          sender:
            data.conversationEntry.sender.role === 'EndUser' &&
            data.conversationEntry.senderDisplayName === 'Guest'
              ? `${customerFirstName} ${customerLastName}`
              : data.conversationEntry.senderDisplayName
        }

        if (data.conversationEntry.sender.role === 'Agent') {
          message.image = `https://cdn.tollbrothers.com/images/osc/${convertId15to18(
            data.conversationEntry.sender.subject
          )}.jpg`
        }

        typingMessages.push(message)

        break
      case 'CONVERSATION_TYPING_STOPPED_INDICATOR':
        setShowActiveTyping(false)
        data = JSON.parse(event.data)
        messagePayload = JSON.parse(data.conversationEntry.entryPayload)

        message = {
          id: data.conversationEntry.identifier,
          type: data.conversationEntry.entryType,
          text: `${data.conversationEntry.senderDisplayName} stopped typing...`,
          timestamp: data.conversationEntry.clientTimestamp,
          sender:
            data.conversationEntry.sender.role === 'EndUser' &&
            data.conversationEntry.senderDisplayName === 'Guest'
              ? `${customerFirstName} ${customerLastName}`
              : data.conversationEntry.senderDisplayName
        }

        if (data.conversationEntry.sender.role === 'Agent') {
          message.image = `https://cdn.tollbrothers.com/images/osc/${convertId15to18(
            data.conversationEntry.sender.subject
          )}.jpg`
        }

        typingMessages.push(message)

        break
      case 'CONVERSATION_CLOSE_CONVERSATION':
        sessionStorage.setItem('tbChat', JSON.stringify({}))
        setShowChatButton(false)
        setIsCurrentlyChatting(false)
        setConversationId(null)
        setSystemMessage(null)
        setAccessToken(null)
        setMessages([])
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

  const popNextUUID = () => crypto.randomUUID()

  useEffect(() => {
    async function getOscInfo() {
      try {
        const availability = await fetchAvailability(
          chatRegion,
          availabilityAPI
        )
        console.log('availability:', availability)
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
    const restart = async (tbChat) => {
      try {
        const retryFunction = (attempts) => attempts < 3
        const { request } = listenToConversation(
          retryFunction,
          2000,
          tbChat.firstName,
          tbChat.lastName,
          endPoint,
          apiSfOrgId,
          tbChat.accessToken,
          tbChat.conversationId
        )
        if (typeof request !== 'function') {
          throw new Error(
            'Invalid request function returned from listenToConversation'
          )
        }
        await request({
          accessToken: tbChat.accessToken,
          handleChatMessage
        })
      } catch (error) {
        console.error('Error initializing chat:', error)
      }
    }

    const tbChat = JSON.parse(sessionStorage.getItem('tbChat'))

    console.log('tbChat:', tbChat)

    if (tbChat?.conversationId && tbChat?.accessToken) {
      setAccessToken(tbChat.accessToken)
      setConversationId(tbChat.conversationId)
      setShowChatButton(false)
      setIsCurrentlyChatting(true)
      setSystemMessage(null)
      setShowChat(true)
      setShowChatHeader(true)
      restart(tbChat)
    }
  }, [])

  const convertTimeStamp = (timestamp) => {
    const date = new Date(timestamp)
    const formattedDate = date.toLocaleDateString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
    const time = formattedDate.split(', ')[1]
    return time
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleEndChat = async () => {
    setSystemMessage(null)
    setIsMinimized(false)

    if (!accessToken || !conversationId) {
      setIsChatOpen(false)
      setIsCurrentlyChatting(false)
      setShowChatHeader(false)
      setShowForm(false)
      setSystemMessage(null)
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
    } catch (error) {
      console.error('Chat end error:', error.message)
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  console.log('chat status: ', chatStatus)

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
            <button className={styles.chatLaunch} onClick={showFormHandler}>
              <img
                src={
                  chatPhoto ??
                  'https://cdn.tollbrothers.com/images/osc/0053q00000B3pUhAAJ.jpg'
                }
                alt='osc'
              />
              <img
                src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/chat.svg'
                alt='chat'
              />
            </button>
          )}
          {showChatHeader && (
            <div className={styles.header}>
              <div className={styles.location}>
                <p>
                  {city}, {state}
                </p>
              </div>
              <h2>Chat</h2>
              <div className={styles.panelControls}>
                <button onClick={() => handleMinimize()} type='button'>
                  {isMinimized ? <Plus fill='#000' /> : <Minus fill='#000' />}
                </button>
                <button onClick={() => handleEndChat()} type='button'>
                  <CloseX fill='#000' />
                </button>
              </div>
            </div>
          )}
          {showWaitMessage && (
            <p className={styles.waitMessage}>
              Please wait while we connect you with a representative.
            </p>
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

              <button type='submit'>Start Chatting</button>
            </form>
          )}

          <div className={styles.messagesWrapper} ref={chatContainerRef}>
            {showActiveTyping && (
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
            )}

            {systemMessage && (
              <p className={styles.persistentText}>{systemMessage}.</p>
            )}

            {!isMinimized && (
              <>
                {messages.map(
                  (message, index) =>
                    message.type === 'Message' && (
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
                              <div
                                className={`${styles.message} ${
                                  showActiveTyping
                                    ? styles.activeTyping
                                    : styles.notActive
                                }`}
                              >
                                {/* {message.sender.charAt(0).toUpperCase() +
                            message.sender.slice(1).toLowerCase()}: */}
                                {message.text}
                                {/* <div className={styles.timestamp}>
                            {convertTimeStamp(message.timestamp)}
                          </div> */}
                              </div>
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
                popNextUUID={popNextUUID}
                customerFirstName={customerFirstName}
                customerLastName={customerLastName}
                setCustomerFirstName={setCustomerFirstName}
                setCustomerLastName={setCustomerLastName}
                apiSfName={apiSfName}
                endPoint={endPoint}
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}
