'use client'

import React, { useRef, useState, useEffect } from 'react'

import {
  clearLocalStorage,
  getLocalStorage,
  isExpired,
  setLocalStorage
} from '../../lib/utils'
import {
  handleChatInit,
  startConversation,
  endChat,
  getConversationHistory,
  postMessage,
  listenToConversation
} from '../../../utils/chat/apis'
import {
  formatAgentImage,
  formatMessage,
  popNextUUID
} from '../../../utils/chat/libs'

import { ChatInterface } from './ChatInterface'

export const ChatOsc = ({
  endPoint,
  apiSfOrgId,
  apiSfName,
  disableFloatingChatButton,
  chatStatus,
  chatRegion,
  setIsChatOpen,
  isChatOpen, // this is to open chat from a button in the parent app instead of a floating head
  chatSms,
  trackChatEvent,
  chatClickedEventString,
  isChatAvailabilityChecked,
  setShowForm,
  showForm,
  setError,
  error,
  setChatPhoto,
  chatPhoto,
  setSystemMessage,
  systemMessage,
  setShowWaitMessage,
  showWaitMessage,
  setIsCurrentlyChatting,
  isCurrentlyChatting,
  setShowActiveTyping,
  showActiveTyping,
  handleSubmit,
  userInfo
}) => {
  const isTransfering = useRef(false)
  const isInConference = useRef(false)
  const [showChatButton, setShowChatButton] = useState(false)
  const [accessToken, setAccessToken] = useState(null)
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [showChatHeader, setShowChatHeader] = useState(false)
  const [showTextChatOptions, setShowTextChatOptions] = useState(false)
  const [showConfirmationEndMessage, setShowConfirmationEndMessage] =
    useState(false)
  const chatContainerRef = useRef(null)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isMinimized, setIsMinimized] = useState(false)
  const [, setAgentName] = useState('Agent') // agent name
  const [abortController, setAbortController] = useState(null)
  const [hasAgentEngaged, setHasAgentEngaged] = useState(false)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState({
    count: 0,
    lastMessageId: null
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    e.target.setCustomValidity('')
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
        } else if (messagePayload?.routingType === 'Conference') {
          isInConference.current = true
        }

        setIsCurrentlyChatting(true)
        break
      case 'CONVERSATION_PARTICIPANT_CHANGED':
        data = JSON.parse(event.data)
        messagePayload = JSON.parse(data.conversationEntry.entryPayload)
        setShowWaitMessage(false)

        if (
          messagePayload?.entries?.[0]?.operation === 'remove' &&
          messagePayload?.entries?.[0]?.participant?.role !== 'Supervisor'
        ) {
          if (!isTransfering.current && !isInConference.current) {
            afterEndChatReset()
            setSystemMessage(
              messagePayload.entries[0].displayName + ' ended the chat'
            )
          } else {
            setSystemMessage(null)
            if (isTransfering.current) setShowWaitMessage(false)
            isTransfering.current = false
            isInConference.current = false
          }
        } else {
          for (let i = 0; i < messagePayload?.entries?.length; i++) {
            const entry = messagePayload.entries[i]
            if (
              entry.operation === 'add' &&
              entry.participant?.role !== 'Supervisor'
            ) {
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
        data = JSON.parse(event.data)
        setShowActiveTyping(data)
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

        const hasTransferEvent = response.conversationEntries.some((entry) => {
          return (
            entry.entryType === 'RoutingResult' &&
            entry.entryPayload?.routingType === 'Transfer'
          )
        })

        const hasConferenceEvent = response.conversationEntries.some(
          (entry) => {
            return (
              entry.entryType === 'RoutingResult' &&
              entry.entryPayload?.routingType === 'Conference'
            )
          }
        )

        response.conversationEntries.map((entry) => {
          if (
            entry.entryType === 'ParticipantChanged' &&
            entry.entryPayload?.entries?.length > 0
          ) {
            entry.entryPayload.entries.map((entry) => {
              // find the add entry to get agent name
              if (
                entry.operation === 'add' &&
                entry.participant?.role !== 'Supervisor'
              ) {
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
              } else if (
                entry.operation === 'remove' &&
                entry.participant?.role !== 'Supervisor' &&
                !hasTransferEvent &&
                !hasConferenceEvent
              ) {
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
    // const isTabVisiblilityEvent = event && event.type === 'visibilitychange'
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

        // turned this off since it was sending a system message every time the tab was restored
        // can confuse agents
        // if (!isTabVisiblilityEvent) {
        //   sendSystemtMessage({
        //     accessToken: value.accessToken,
        //     conversationId: value.conversationId,
        //     message: '::System Message:: Guest restored connection'
        //   })
        // }
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

  useEffect(() => {
    if (userInfo) {
      console.log('initializing chat...')
      initializeChat(
        userInfo.firstName,
        userInfo.lastName,
        userInfo.email,
        endPoint,
        apiSfOrgId,
        apiSfName
      )
    }
  }, [userInfo])

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
    isInConference.current = false
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
          text:
            showActiveTyping?.conversationEntry?.senderDisplayName +
            ' is typing...',
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
    <ChatInterface
      showChatHeader={showChatHeader}
      isMinimized={isMinimized}
      showChatButton={showChatButton}
      showTextChatOptions={showTextChatOptions}
      unreadMessagesCount={unreadMessagesCount}
      showFormHandler={showFormHandler}
      handleMinimize={handleMinimize}
      chatPhoto={chatPhoto}
      showTextChatOption={showTextChatOption}
      chatSms={chatSms}
      hasAgentEngaged={hasAgentEngaged}
      handleConfirmationEnd={handleConfirmationEnd}
      showWaitMessage={showWaitMessage}
      showConfirmationEndMessage={showConfirmationEndMessage}
      handleStay={handleStay}
      handleEndChat={handleEndChat}
      accessToken={accessToken}
      conversationId={conversationId}
      showForm={showForm}
      handleSubmit={handleSubmit}
      formData={formData}
      handleChange={handleChange}
      systemMessage={systemMessage}
      messages={messages}
      chatContainerRef={chatContainerRef}
      apiSfName={apiSfName}
      endPoint={endPoint}
      setError={setError}
      error={error}
    />
  )
}
