'use client'

import React, { useRef, useState, useEffect } from 'react'

import styles from './TollChat.module.scss'
import {
  handleChatInit,
  fetchAvailability,
  startConversation,
  endChat,
  createConversationListener,
  getConversationHistory,
  postMessage
} from '../../../utils/chat/apis'
import {
  convertTimeStamp,
  formatMessage,
  popNextUUID
} from '../../../utils/chat/libs'
import ChatInput from './ChatInput'

import Minus from '../../icons/Minus'
import Plus from '../../icons/Plus'
import CloseX from '../../icons/CloseX'

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
  chatSms
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
  const [showConfirmationEndMessage, setShowConfirmationEndMessage] =
    useState(false)
  const chatContainerRef = useRef(null)
  const [customerFirstName, setCustomerFirstName] = useState('Guest')
  const [customerLastName, setCustomerLastName] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isCurrentlyChatting, setIsCurrentlyChatting] = useState(false) // if therer is an active chat
  const [showActiveTyping, setShowActiveTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [systemMessage, setSystemMessage] = useState('') // system messages
  const [chatPhoto, setChatPhoto] = useState(null) // osc image
  const [agentName, setAgentName] = useState('Agent') // agent name

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

      sendSystemtMessage({
        accessToken: token.accessToken,
        conversationId: newUuid,
        message: '::System Message:: User started chat'
      })

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

        console.log('participant changed:', messagePayload)

        if (messagePayload?.entries?.[0]?.operation === 'remove') {
          afterEndChatReset()
          setSystemMessage(
            messagePayload.entries[0].displayName + ' ended the chat'
          )
        } else {
          for (let i = 0; i < messagePayload?.entries?.length; i++) {
            const entry = messagePayload.entries[i]
            if (entry.operation === 'add') {
              setSystemMessage(`You're chatting with ` + entry.displayName)
              setAgentName(entry.displayName)
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
    e.preventDefault()

    const [firstName, ...lastNameParts] = formData.name.trim().split(' ')
    const lastName = lastNameParts.join(' ') || '(none)'

    setCustomerFirstName(firstName)
    setCustomerLastName(lastName)
    setShowWaitMessage(true)
    setShowForm(false)
    setSystemMessage(null)
    setShowActiveTyping(false)
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

  useEffect(() => {
    const getConversationList = async (tbChat) => {
      try {
        const response = await getConversationHistory({
          accessToken: tbChat.accessToken,
          conversationId: tbChat.conversationId,
          endPoint
        })

        if (response?.conversationEntries?.length > 0) {
          // return only messages
          const messages = response.conversationEntries.filter((entry) => {
            return entry.entryType === 'Message'
          })
          const formattedMessages = messages.map((message, index) => {
            return formatMessage(
              message,
              tbChat.firstName,
              tbChat.lastName,
              index
            )
          })

          let chatWasEndedByAgentWhileOffline = false
          response.conversationEntries.map((entry) => {
            if (
              entry.entryType === 'ParticipantChanged' &&
              entry.entryPayload?.entries?.length > 0
            ) {
              entry.entryPayload.entries.map((entry) => {
                // find the add entry to get agent name
                if (entry.operation === 'add') {
                  setSystemMessage(`You're chatting with ` + entry.displayName)
                  setAgentName(entry.displayName)
                } else if (entry.operation === 'remove') {
                  // see if the agent left the conversation while offline

                  afterEndChatReset()
                  setSystemMessage(entry.displayName + ' ended the chat')
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

    const reestablishConnection = async (tbChat) => {
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
        console.error('Error re-establishing chat: ', error)
      }
    }

    const tbChat = JSON.parse(sessionStorage.getItem('tbChat'))

    if (tbChat?.conversationId && tbChat?.accessToken) {
      setAccessToken(tbChat.accessToken)
      setConversationId(tbChat.conversationId)
      setShowChatButton(false)
      setIsCurrentlyChatting(true)
      setSystemMessage(null)
      setShowActiveTyping(false)
      setShowChat(true)
      setShowChatHeader(true)
      setShowWaitMessage(false)
      setShowTextChatOptions(false)
      reestablishConnection(tbChat)
      getConversationList(tbChat)
      sendSystemtMessage({
        accessToken: tbChat.accessToken,
        conversationId: tbChat.conversationId,
        message: '::System Message:: Guest restored connection'
      })
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

  const afterEndChatReset = () => {
    sessionStorage.setItem('tbChat', JSON.stringify({}))
    setIsMinimized(false)
    setShowChatButton(false)
    setIsCurrentlyChatting(false)
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
  }

  const handleEndChat = async () => {
    afterEndChatReset()
    setShowChatHeader(false)
    setIsChatOpen(false)

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

  console.log('messagessss:', messages)

  return (
    <>
      {showChat && (
        <div
          className={`${styles.chatWrapper} ${
            showChatHeader ? styles.chatPanelOpen : ''
          } ${isMinimized ? styles.isMinimized : ''} ${
            endChat ? styles.endChat : ''
          } js_chatWrapper adjust_chatWrapper`}
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
                      href={chatSms ? `sms:${chatSms}` : '#'}
                      className={`${styles.textButton} ${styles.textChatButtons}`}
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
              <div className={styles.loading}>
                <span />
                <span />
                <span />
              </div>
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
            {systemMessage && (
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
                          <a
                            href={message.payload?.linkItem?.url}
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
                          </a>
                        )}
                        {message.payload?.formatType === 'Attachments' && (
                          <>
                            <a
                              href={message?.payload?.attachments?.[0]?.url}
                              download
                              className={`${styles.messageWrapper}  ${styles.agent}  ${styles.richFormat}`}
                            >
                              {message?.payload?.attachments[0]?.name.endsWith(
                                '.pdf'
                              ) ? (
                                <div
                                  className={`${styles.copyWrapper} ${styles.pdf}`}
                                >
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
                            className={`${styles.messageWrapper}  ${
                              message?.role === 'Agent' ||
                              message?.role === 'System'
                                ? styles.agent
                                : styles.guest
                            }`}
                          >
                            <>
                              {message.image && (
                                <img
                                  src={message.image}
                                  width={30}
                                  height={30}
                                  alt='Agent Thumbnail'
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      'https://cdn.tollbrothers.com/images/osc/0053q00000B3pUhAAJ.jpg'
                                  }}
                                />
                              )}
                              <p className={`${styles.message}`}>
                                {message.text}
                              </p>
                            </>
                          </div>
                        )}
                        {message.payload?.formatType === 'Typing' && (
                          <div
                            key={`index${index}`}
                            className={`${styles.messageWrapper} ${styles.typingIndicator}`}
                          >
                            <p className={`${styles.message}`}>
                              {message.text}
                            </p>
                          </div>
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