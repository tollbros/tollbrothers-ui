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
  endPoint,
  oscAvailable,
  apiSfOrgId,
  apiSfName,
  communityRegion,
  city,
  state,
  classes = {},
  disableFloatingChatButton = false,
  chatStatus,
  setIsChatOpen = () => null,
  isChatOpen // this is to open chat from a button in the parent app instead of a floating head
}) => {
  const region = 'FLW'

  const [showChatButton, setShowChatButton] = useState(false)
  const [accessToken, setAccessToken] = useState(null)
  // const [availableOscs, setAvailableOscs] = useState([])
  const [messages, setMessages] = useState([])
  const [conversationIds, setConversationIds] = useState([]) // a bunch of uuids to choose from
  const [conversationId, setConversationId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  // const [showOsc, setShowOsc] = useState(true)
  const [showChatHeader, setShowChatHeader] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [showWaitMessage, setShowWaitMessage] = useState(false)
  const chatContainerRef = useRef(null)

  const [customerFirstName, setCustomerFirstName] = useState('John')
  const [customerLastName, setCustomerLastName] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isCurrentlyChatting, setIsCurrentlyChatting] = useState(false) // if therer is an active chat
  const [showActiveTyping, setShowActiveTyping] = useState(false) // to differentiate between initial sender and agent
  const [typingMessages, setTypingMessages] = useState([]) // this is the active/stopped typing messages
  const [chatStartReady, setChatStartReady] = useState(false) // trigger to setup the listener
  const [restablishChat, setRestablishChat] = useState(false) // for re-establishing chat on page reload
  const [isMinimized, setIsMinimized] = useState(false) // form panel controls

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
      token ? setChatStartReady(true) : setChatStartReady(false)

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
        region,
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

    switch (event.event) {
      case 'ping':
        break
      case 'CONVERSATION_ROUTING_RESULT':
        // seems to fire once when the the start conversation is called but agent has not
        // accepted and no messages yet sent/delivered
        setIsCurrentlyChatting(true)
        break
      case 'CONVERSATION_PARTICIPANT_CHANGED':
        setShowWaitMessage(false)
        // fires when an agent accepts
        sessionStorage.setItem(
          'tbChat',
          JSON.stringify({ accessToken, conversationId })
        )
        console.log(accessToken)
        console.log(conversationId)

        data = JSON.parse(event.data)
        messagePayload = JSON.parse(data.conversationEntry.entryPayload)

        for (let i = 0; i < messagePayload?.entries?.length; i++) {
          const entry = messagePayload.entries[i]
          message = {
            id: `${data.conversationEntry.identifier}${i}`, // just needs to be unique
            type: data.conversationEntry.entryType,
            initial: entry.displayName.charAt(0),
            persistentText: `${
              entry.operation === 'add'
                ? `You're chatting with ` + entry.displayName
                : entry.displayName + ' left the conversation.'
            }`,

            // text: `${
            //   entry.displayName +
            //   (entry.operation === 'add' ? ' joined ' : ' left ')
            // }the conversation.`,

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

          messages.push(message)
        }
        break
      case 'CONVERSATION_MESSAGE':
        data = JSON.parse(event.data)
        messagePayload = JSON.parse(data.conversationEntry.entryPayload)

        console.log('convo message')

        console.log(event)

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

        console.log('typing start:', message)

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

        console.log('typing stopped:', message)
        typingMessages.push(message)

        break
      case 'CONVERSATION_CLOSE_CONVERSATION':
        sessionStorage.setItem('tbChat', JSON.stringify({}))
        setShowChatButton(false)
        setIsCurrentlyChatting(false)
        setConversationId(null)
        setChatStartReady(false)
        setAccessToken(null)
        setMessages([])
        // setShowChat(false)
        break
      default:
        console.log('Unknown event:', event)
        break
    }
    if (messages.length > 0) {
      console.log('messages:', messages)
      setMessages((prevMessages) => [...prevMessages, ...messages])
      setShowWaitMessage(false)
    }

    if (typingMessages.length > 0) {
      setTypingMessages((prevTypingMessages) => [
        ...prevTypingMessages,
        ...typingMessages
      ])
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
    await initializeChat(firstName, lastName, endPoint, apiSfOrgId, apiSfName)
  }

  const showFormHandler = () => {
    setShowChatHeader(true)

    setShowForm(true)
    // setShowOsc(false)
    setShowChatButton(false)
    // setShowWaitMessage(true)
  }

  useEffect(() => {
    console.log('ishcatopen:', isChatOpen)
    if (isChatOpen && !isCurrentlyChatting) {
      // setShowChatButton(false)
      showFormHandler()
      setIsMinimized(false)
      // setShowForm(true)
      // setShowChat(true)
    }
  }, [isChatOpen, isCurrentlyChatting])

  useEffect(() => {
    if (
      chatStatus === 'online' &&
      !isCurrentlyChatting &&
      !disableFloatingChatButton
    ) {
      setShowChatButton(true)
    } else {
      setShowChatButton(false)
    }
  }, [chatStatus, isCurrentlyChatting])

  const popNextUUID = () => crypto.randomUUID()

  useEffect(() => {
    if (restablishChat) {
      setShowChatButton(false)
      setIsCurrentlyChatting(true)
    }
  }, [restablishChat])

  useEffect(() => {
    const restart = async (tbChat) => {
      try {
        const retryFunction = (attempts) => attempts < 3
        const { request } = listenToConversation(
          retryFunction,
          2000,
          'Test',
          'Reestablish',
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

    while (true) {
      if (window) {
        const tbChat = JSON.parse(sessionStorage.getItem('tbChat'))

        console.log('tbChat:', tbChat)

        if (tbChat?.conversationId && tbChat?.accessToken) {
          setAccessToken(tbChat.accessToken)
          setConversationId(tbChat.conversationId)
          // setRestablishChat(true)

          setShowChatButton(false)
          setIsCurrentlyChatting(true)
          // setConversationId(null)
          setChatStartReady(true)
          // setAccessToken(null)
          setShowChat(true)
          setShowChatHeader(true)

          restart(tbChat)
        }
        break
      }
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
    if (!accessToken || !conversationId) {
      // setShowChat(false)
      setIsChatOpen(false)
      setIsCurrentlyChatting(false)
      setShowChatHeader(false)
      setShowForm(false)
      return
    }
    try {
      console.log('Ending chat...')
      const result = await endChat({
        accessToken,
        conversationId,
        endPoint,
        apiSfName
      })
      console.log('Chat end success:', result)
      // setShowChat(false)
      setIsChatOpen(false)
      setIsCurrentlyChatting(false)
      setShowChatHeader(false)
      setShowForm(false)
    } catch (error) {
      console.error('Chat end error:', error.message)
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  console.log('show chat: ', showChat)

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
            {showChatButton && (
              <button className={styles.chatLaunch} onClick={showFormHandler}>
                <img
                  src='https://cdn.tollbrothers.com/images/osc/0051Q00000TXuNXQA1.jpg'
                  alt='osc'
                />
                <img
                  src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/chat.svg'
                  alt='chat'
                />
              </button>
            )}
            {!isMinimized && (
              <>
                <p className={styles.persistentText}>
                  {messages[0]?.persistentText}.
                </p>

                {messages.map(
                  (message, index) =>
                    index > 0 && (
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
                                  src='https://cdn.tollbrothers.com/images/osc/0053q00000B3pUhAAJ.jpg'
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
