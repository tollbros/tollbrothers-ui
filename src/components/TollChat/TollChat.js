'use client'

import React, { useRef, useState, useEffect } from 'react'

import styles from './TollChat.module.scss'
import {
  clearLocalStorage,
  getLocalStorage,
  isExpired,
  setLocalStorage
} from '../../lib/utils'
import {
  handleChatInit,
  fetchAvailability,
  startConversation,
  endChat,
  getConversationHistory,
  postMessage,
  listenToConversation
} from '../../../utils/chat/apis'
import {
  convertTimeStamp,
  formatAgentImage,
  formatMessage,
  popNextUUID
} from '../../../utils/chat/libs'
import ChatInput from './ChatInput'

import Minus from '../../icons/Minus'
import CloseX from '../../icons/CloseX'
import ChatMessageText from './ChatMessageText'
import ChatMessageAttachment from './ChatMessageAttachment'
import ChatMessageRichLink from './ChatMessageRichLink'

export const TollChat = ({
  availabilityAPI,
  endPoint,
  apiSfOrgId,
  apiSfName,
  disableFloatingChatButton = false,
  setChatStatus,
  chatStatus,
  chatRegion,
  setIsChatOpen = () => null,
  isChatOpen, // this is to open chat from a button in the parent app instead of a floating head
  chatSms,
  trackChatEvent = () => null,
  chatClickedEventString = 'chatClicked',
  chatStartedEventString = 'chatStarted'
}) => {
  const isTransfering = useRef(false)
  const [showChatButton, setShowChatButton] = useState(false)
  const [accessToken, setAccessToken] = useState(null)
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showChatHeader, setShowChatHeader] = useState(false)
  const [showTextChatOptions, setShowTextChatOptions] = useState(false)
  const [showWaitMessage, setShowWaitMessage] = useState(false)
  const [showConfirmationEndMessage, setShowConfirmationEndMessage] =
    useState(false)
  const chatContainerRef = useRef(null)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isCurrentlyChatting, setIsCurrentlyChatting] = useState(false) // if therer is an active chat
  const [showActiveTyping, setShowActiveTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [systemMessage, setSystemMessage] = useState('') // system messages
  const [chatPhoto, setChatPhoto] = useState(null) // osc image
  const [agentName, setAgentName] = useState('Agent') // agent name
  const [error, setError] = useState(null)
  const [abortController, setAbortController] = useState(null)
  const [isChatAvailabilityChecked, setIsChatAvailabilityChecked] =
    useState(null)
  const [hasAgentEngaged, setHasAgentEngaged] = useState(false)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState({
    count: 0,
    lastMessageId: null
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const initializeChat = async (
    firstName,
    lastName,
    email,
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
        customerEmail: email,
        customerFirstName: firstName || 'Guest',
        customerLastName: lastName || '',
        conversationId: newUuid,
        region: chatRegion,
        endPoint,
        apiSfOrgId,
        apiSfName
      }

      const response = await startConversation(payload)

      if (response) {
        let initialize = false
        setConversationId(payload.conversationId)

        const onSuccess = (abortController) => {
          if (initialize) return

          initialize = true
          setLocalStorage(
            'tbChat',
            {
              accessToken: token.accessToken,
              conversationId: newUuid,
              firstName,
              lastName
            },
            1000 * 60 * 60 * 2 // expire in 2 hours
          )

          sendSystemtMessage({
            accessToken: token.accessToken,
            conversationId: newUuid,
            message:
              '::System Message:: User initiated chat(' + location.href + ')'
          })

          setAbortController(abortController)
        }

        listenToConversation({
          handleChatMessage,
          onSuccess,
          firstName,
          lastName,
          endPoint,
          apiSfOrgId,
          accessToken: token.accessToken,
          conversationId: newUuid,
          onError: () => {
            console.log('Error starting conversation')
            handleEndChat(token.accessToken, newUuid)
            setShowForm(true)
            setShowChatHeader(true)
            setIsChatOpen(true)
            setError(
              'There was an error initializing the chat. Please try again.'
            )
          }
        })
      }
    } catch (error) {
      console.error('Error initializing chat')
      handleEndChat()
      setShowForm(true)
      setShowChatHeader(true)
      setIsChatOpen(true)
      setError('There was an error initializing the chat. Please try again.')
    }
  }

  const handleAddAgent = (entry) => {
    setChatPhoto(formatAgentImage(entry.participant?.subject))
    setSystemMessage(`You're chatting with ` + entry.displayName)
    setAgentName(entry.displayName)
    setShowWaitMessage(false)
    setHasAgentEngaged(true)
    setShowForm(false)
    setIsCurrentlyChatting(true)
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
        data = JSON.parse(event.data)
        messagePayload = JSON.parse(data.conversationEntry.entryPayload)

        if (messagePayload?.routingType === 'Transfer') {
          isTransfering.current = true
        }

        setIsCurrentlyChatting(true)
        break
      case 'CONVERSATION_PARTICIPANT_CHANGED':
        data = JSON.parse(event.data)
        messagePayload = JSON.parse(data.conversationEntry.entryPayload)
        setShowWaitMessage(false)

        if (messagePayload?.entries?.[0]?.operation === 'remove') {
          if (!isTransfering.current) {
            afterEndChatReset()
            setSystemMessage(
              messagePayload.entries[0].displayName + ' ended the chat'
            )
          } else {
            setSystemMessage(null)
            setShowWaitMessage(true)
            isTransfering.current = false
          }
        } else {
          for (let i = 0; i < messagePayload?.entries?.length; i++) {
            const entry = messagePayload.entries[i]
            if (entry.operation === 'add') {
              handleAddAgent(entry)
              continue
            }
          }
        }

        break
      case 'CONVERSATION_MESSAGE':
        data = JSON.parse(event.data)
        console.log('convo message')

        message = formatMessage(
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
        afterEndChatReset()
        break
      default:
        console.log('Unknown event:', event)
        break
    }

    if (messages.length > 0) {
      setMessages((prevMessages) => [...prevMessages, ...messages])
    }
  }

  const handleSubmit = async (e) => {
    const offlineMessage =
      'Our apologies, but all members of our Online Sales Team are currently unavailable. Please try again later.'
    e.preventDefault()
    setError(null)
    setSystemMessage(null)
    setShowActiveTyping(false)
    setShowWaitMessage(true)
    setShowForm(false)
    trackChatEvent(chatStartedEventString)

    try {
      const availability = await fetchAvailability(chatRegion, availabilityAPI)
      if (availability?.data?.payload?.length > 0) {
        const form = e.target
        const [firstName, ...lastNameParts] = form.name?.value
          ?.trim()
          .split(' ')
        const lastName = lastNameParts?.join(' ') || '(none)'

        await initializeChat(
          firstName,
          lastName,
          form.email?.value?.trim(),
          endPoint,
          apiSfOrgId,
          apiSfName
        )
      } else {
        setShowForm(true)
        setShowWaitMessage(false)
        setError(offlineMessage)
      }
    } catch (error) {
      setShowForm(true)
      setShowWaitMessage(false)
      setError(offlineMessage)
    }
  }

  const showTextChatOption = () => {
    setShowTextChatOptions(!showTextChatOptions)
  }

  const showFormHandler = (trackEvent) => {
    if (trackEvent) trackChatEvent(chatClickedEventString)
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
      setShowConfirmationEndMessage(false)
      setShowTextChatOptions(false)
      return
    }

    if (isChatOpen && !isCurrentlyChatting) {
      showFormHandler()
      setShowConfirmationEndMessage(false)
      setShowTextChatOptions(false)
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
          const index = Math.floor(
            Math.random() * availability.data.payload.length
          )
          if (!isCurrentlyChatting) {
            setChatPhoto(availability.data.payload[index]?.photo)
          }
        }
        setIsChatAvailabilityChecked(true)
      } catch (error) {
        setIsChatAvailabilityChecked(true)
        console.error('Error fetching osc data:', error)
      }
    }

    if (chatRegion) {
      getOscInfo()
    } else {
      // if no chatRegion (pages with no OSC) just set this to true.
      setIsChatAvailabilityChecked(true)
    }

    setChatStatus('offline')
  }, [chatRegion, availabilityAPI])

  const sendSystemtMessage = async ({
    accessToken,
    conversationId,
    message
  }) => {
    try {
      await postMessage({
        accessToken,
        conversationId,
        msg: message,
        endPoint,
        apiSfName
      })
    } catch {
      console.error('Error sending system message.')
    }
  }

  const getConversationList = async (tbChat) => {
    try {
      const response = await getConversationHistory({
        accessToken: tbChat.accessToken,
        conversationId: tbChat.conversationId,
        endPoint
      })

      setShowWaitMessage(true)
      if (response?.conversationEntries?.length > 0) {
        // return only messages
        const messages = response.conversationEntries.filter((entry) => {
          return entry.entryType === 'Message'
        })
        const formattedMessages = messages.map((message) => {
          return formatMessage(message, tbChat.firstName, tbChat.lastName)
        })

        let chatWasEndedByAgentWhileOffline = false
        const tbChatBackup = { ...tbChat }
        response.conversationEntries.map((entry) => {
          if (
            entry.entryType === 'ParticipantChanged' &&
            entry.entryPayload?.entries?.length > 0
          ) {
            entry.entryPayload.entries.map((entry) => {
              // find the add entry to get agent name
              if (entry.operation === 'add') {
                // always first since the messages are in chronological order.
                // If the user was transfered this will be in the message list a second time
                // so we need to add all the chat data back into localStorage and React state
                handleAddAgent(entry)
                setLocalStorage(
                  // restoring chat data in case there was a transfer
                  'tbChat',
                  {
                    accessToken: tbChatBackup.accessToken,
                    conversationId: tbChatBackup.conversationId,
                    firstName: tbChatBackup.firstName,
                    lastName: tbChatBackup.lastName
                  },
                  1000 * 60 * 60 * 2 // expire in 2 hours
                )
                setAccessToken(tbChatBackup.accessToken)
                setConversationId(tbChatBackup.conversationId)
                chatWasEndedByAgentWhileOffline = false
              } else if (entry.operation === 'remove') {
                // always after the add event since the messages are in chronological order
                // so if there was no transfer this will be the last event and we can clear all the chat data
                // note 2: we want to clear the data if the agent left the conversation while user was offline or in another tab
                afterEndChatReset()
                setSystemMessage(entry.displayName + ' ended the chat')
                setHasAgentEngaged(false)
                chatWasEndedByAgentWhileOffline = true
              }
            })
          }
        })

        if (!chatWasEndedByAgentWhileOffline) {
          setMessages(formattedMessages ?? [])
        }
      } else {
        throw new Error()
      }
    } catch (err) {
      console.error('Error retreiving chat history')
    }
  }

  const reestablishConnection = (event) => {
    if (event && event.type === 'visibilitychange' && document.hidden) {
      return
    }

    let initialize = false
    const isTabVisiblilityEvent = event && event.type === 'visibilitychange'
    const tbChat = getLocalStorage('tbChat')

    if (!tbChat || isExpired(tbChat.expiry)) {
      clearLocalStorage('tbChat')
      return
    }

    const value = tbChat.value
    if (!value?.conversationId || !value?.accessToken) {
      return
    }

    listenToConversation({
      handleChatMessage,
      firstName: value.firstName,
      lastName: value.lastName,
      endPoint,
      apiSfOrgId,
      accessToken: value.accessToken,
      conversationId: value.conversationId,
      onError: () => {
        handleEndChat(value.accessToken, value.conversationId)
      },
      onSuccess: (abortController) => {
        if (initialize) return

        initialize = true
        setAccessToken(value.accessToken)
        setConversationId(value.conversationId)
        setShowChatButton(false)
        setIsCurrentlyChatting(true)
        setSystemMessage(null)
        setShowActiveTyping(false)
        setShowChatHeader(true)
        setShowWaitMessage(false)
        setShowTextChatOptions(false)
        getConversationList(value)
        if (!isTabVisiblilityEvent) {
          sendSystemtMessage({
            accessToken: value.accessToken,
            conversationId: value.conversationId,
            message: '::System Message:: Guest restored connection'
          })
        }
        setAbortController(abortController)
        setIsChatOpen(true)
      }
    })
  }

  useEffect(() => {
    window.addEventListener('visibilitychange', reestablishConnection)

    return () => {
      window.removeEventListener('visibilitychange', reestablishConnection)
    }
  }, [])

  useEffect(() => {
    // need to wait for availabilty api to return before reestablishing connection
    // else we might show chat input too soon (race condition)
    if (isChatAvailabilityChecked) {
      reestablishConnection()
    }
  }, [isChatAvailabilityChecked])

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

  const afterEndChatReset = () => {
    setError(null)
    clearLocalStorage('tbChat')
    setIsMinimized(false)
    setShowChatButton(false)
    setIsCurrentlyChatting(false)
    setHasAgentEngaged(false)
    setConversationId(null)
    // setSystemMessage(null)
    setShowActiveTyping(false)
    setShowForm(false)
    setAccessToken(null)
    setMessages([])
    setShowWaitMessage(false)
    setShowConfirmationEndMessage(false)
    setShowTextChatOptions(false)
    setAgentName('Agent')
    setSystemMessage(null)
    setUnreadMessagesCount({ count: 0, lastMessageId: null })
    isTransfering.current = false
    if (abortController) {
      // closes sse connection
      abortController.abort()
      setAbortController(null)
    }
  }

  const handleEndChat = async (accessToken, conversationId) => {
    afterEndChatReset()
    setShowChatHeader(false)
    setIsChatOpen(false)

    // console.log(accessToken, conversationId)

    if (!accessToken || !conversationId) {
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
    } catch (error) {
      console.error('Chat end error:', error.message)
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isMinimized])

  useEffect(() => {
    if (showActiveTyping) {
      // add typing message to message list
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: popNextUUID(),
          type: 'Message',
          text: agentName + ' is typing...',
          payload: { formatType: 'Typing' },
          role: 'Agent'
        }
      ])
    } else {
      setMessages((prevMessages) => {
        // remove typing message from message list
        return prevMessages.filter((message) => {
          return message.payload?.formatType !== 'Typing'
        })
      })
    }
  }, [showActiveTyping])

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]

    if (
      !document.hidden &&
      lastMessage?.id !== unreadMessagesCount.lastMessageId &&
      lastMessage?.payload?.formatType !== 'Typing' &&
      lastMessage?.type === 'Message' &&
      lastMessage?.role === 'Agent' &&
      isMinimized
    ) {
      setUnreadMessagesCount((prev) => {
        return {
          count: prev.count + 1,
          lastMessageId: lastMessage?.id
        }
      })
    }
  }, [messages])

  return (
    <div
      className={`${styles.chatWrapper} ${
        showChatHeader ? styles.chatPanelOpen : ''
      } ${isMinimized ? styles.isMinimized : ''}`}
    >
      {(showChatButton || isMinimized) && (
        <>
          {(showTextChatOptions || isMinimized) && (
            <div className={styles.textChatOptions}>
              {unreadMessagesCount?.count > 0 && (
                <div className={styles.unreadMessagesIndicator}>
                  {unreadMessagesCount.count}
                </div>
              )}
              <div className={styles.textChatWrapper}>
                <button
                  className={`${styles.chatButton} ${styles.textChatButtons}`}
                  onClick={!isMinimized ? showFormHandler : handleMinimize}
                >
                  <img
                    src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/chat.svg'
                    alt='chat'
                  />
                  Chat
                </button>
                {!isMinimized && (
                  <a
                    href={chatSms ? `sms:${chatSms}` : '#'}
                    className={`${styles.textButton} ${styles.textChatButtons}`}
                  >
                    <img
                      src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/sms.svg'
                      alt='chat'
                    />
                    Text
                  </a>
                )}
              </div>
            </div>
          )}

          <button
            className={styles.chatLaunch}
            onClick={!isMinimized ? showTextChatOption : handleMinimize}
          >
            <img
              className={styles.oscHead}
              src={
                chatPhoto ??
                'https://cdn.tollbrothers.com/images/osc/0053q00000B3pUhAAJ.jpg'
              }
              alt='osc'
              onError={(e) => {
                e.currentTarget.src =
                  'https://cdn.tollbrothers.com/images/osc/0053q00000B3pUhAAJ.jpg'
              }}
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
      {showChatHeader && !isMinimized && (
        <div className={styles.header}>
          <h2>Chat</h2>
          <div className={styles.panelControls}>
            {hasAgentEngaged && (
              <button onClick={() => handleMinimize()} type='button'>
                <Minus fill='#000' />
              </button>
            )}
            <button onClick={() => handleConfirmationEnd()} type='button'>
              <CloseX fill='#000' />
            </button>
          </div>
        </div>
      )}
      {showWaitMessage && !isMinimized && (
        <>
          <p className={styles.waitMessage}>
            Please wait while we connect you with a representative.
          </p>
          <div className={styles.loading}>
            <span />
            <span />
            <span />
          </div>
        </>
      )}
      {showConfirmationEndMessage && !isMinimized && (
        <div className={styles.confirmationEndMessage}>
          <p>Are you sure you want to leave this chat?</p>
          <div className={styles.buttonWrapper}>
            <button onClick={handleStay}>Stay</button>
            <button onClick={() => handleEndChat(accessToken, conversationId)}>
              Leave
            </button>
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
            placeholder='Full Name*'
            maxLength={240}
          />

          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            pattern='\S+@\S+\.\S+'
            required
            placeholder='Email*'
            maxLength={80}
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

          <button type='submit'>Start Chat</button>
        </form>
      )}

      <div className={styles.messagesWrapper} ref={chatContainerRef}>
        {systemMessage && !isMinimized && (
          <p className={styles.persistentText}>{systemMessage}.</p>
        )}
        {!isMinimized && (
          <>
            {messages.map(
              (message, index) =>
                message.type === 'Message' &&
                !message.text?.includes('::System Message::') && (
                  <React.Fragment key={message.id}>
                    <div className={styles.timestamp}>
                      {convertTimeStamp(message.timestamp)}
                    </div>
                    {message.payload?.formatType === 'RichLink' && (
                      <>
                        {message.text && <ChatMessageText message={message} />}
                        <ChatMessageRichLink
                          richLink={message.payload}
                          leftAlign={
                            message?.role === 'Agent' ||
                            message?.role === 'System'
                          }
                        />
                      </>
                    )}
                    {message.payload?.formatType === 'Attachments' && (
                      <>
                        {message.text && <ChatMessageText message={message} />}
                        <ChatMessageAttachment
                          attachments={message?.payload?.attachments}
                          hasText={Boolean(message.text)}
                          leftAlign={message.role === 'Agent'}
                        />
                      </>
                    )}
                    {(message.payload?.formatType === 'Text' ||
                      message.payload?.formatType === 'Typing') && (
                      <ChatMessageText message={message} />
                    )}
                  </React.Fragment>
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
            apiSfName={apiSfName}
            endPoint={endPoint}
            setError={setError}
          />
        </div>
      )}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
