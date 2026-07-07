'use client'

import { useRef, useState, useEffect } from 'react'

import { clearLocalStorage, getLocalStorage, isExpired, setLocalStorage } from '../../../lib/utils'
import {
  handleChatInit,
  fetchAvailability,
  startConversation,
  endChat,
  getConversationHistory,
  postMessage,
  listenToConversation
} from '../../../../utils/chat/apis'
import { formatAgentImage, formatMessage, popNextUUID } from '../../../../utils/chat/libs'
import { validateChatForm } from '../utils/validateChatForm'

export const useTollLiveChat = ({
  availabilityAPI,
  endPoint,
  apiSfOrgId,
  apiSfName,
  disableFloatingChatButton = false,
  setChatStatus = () => null,
  chatStatus,
  chatRegion,
  setIsChatOpen = () => null,
  isChatOpen,
  trackChatEvent = () => null,
  chatClickedEventString = 'chatClicked',
  chatStartedEventString = 'chatStarted',
  productCode,
  utils = {}
}) => {
  const isTransfering = useRef(false)
  const isInConference = useRef(false)
  const chatContainerRef = useRef(null)

  const [showChatButton, setShowChatButton] = useState(false)
  const [accessToken, setAccessToken] = useState(null)
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showChatHeader, setShowChatHeader] = useState(false)
  const [showTextChatOptions, setShowTextChatOptions] = useState(false)
  const [showWaitMessage, setShowWaitMessage] = useState(false)
  const [showConfirmationEndMessage, setShowConfirmationEndMessage] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isCurrentlyChatting, setIsCurrentlyChatting] = useState(false)
  const [showActiveTyping, setShowActiveTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [systemMessage, setSystemMessage] = useState('')
  const [chatPhoto, setChatPhoto] = useState(null)
  const [agentName, setAgentName] = useState('Agent')
  const [error, setError] = useState(null)
  const [abortController, setAbortController] = useState(null)
  const [isChatAvailabilityChecked, setIsChatAvailabilityChecked] = useState(null)
  const [hasAgentEngaged, setHasAgentEngaged] = useState(false)
  const [callbackUrl, setCallbackUrl] = useState(null)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState({
    count: 0,
    lastMessageId: null
  })

  const sendSystemtMessage = async ({ accessToken, conversationId, message }) => {
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

  const handleAddAgent = (entry) => {
    setChatPhoto(formatAgentImage(entry.participant?.subject))
    setSystemMessage(`You're chatting with ` + entry.displayName)
    setAgentName(entry.displayName)
    setShowWaitMessage(false)
    setHasAgentEngaged(true)
    setShowForm(false)
    setIsCurrentlyChatting(true)
  }

  const handleChatMessage = async (event, firstName, lastName, accessToken, conversationId) => {
    const messages = []
    let message = {}
    let data, messagePayload

    switch (event.event) {
      case 'ping':
        break
      case 'CONVERSATION_ROUTING_RESULT':
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
          setSystemMessage(messagePayload.entries[0].displayName + ' left the conversation')
        } else {
          for (let i = 0; i < messagePayload?.entries?.length; i++) {
            const entry = messagePayload.entries[i]
            if (entry.operation === 'add' && entry.participant?.role !== 'Supervisor') {
              handleAddAgent(entry)
              continue
            }
          }
        }

        break
      case 'CONVERSATION_MESSAGE':
        data = JSON.parse(event.data)

        message = formatMessage(
          {
            ...data.conversationEntry,
            entryPayload: JSON.parse(data.conversationEntry.entryPayload)
          },
          firstName,
          lastName
        )

        if (
          accessToken &&
          conversationId &&
          message.role === 'Agent' &&
          message.payload?.formatType === 'Text' &&
          message.payload?.text === '/url'
        ) {
          sendSystemtMessage({
            accessToken: accessToken,
            conversationId: conversationId,
            message: '::System Message:: User on page: (' + location.href + ')'
          })

          return
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
        data = JSON.parse(event.data)
        setShowActiveTyping(data)
        break
      case 'CONVERSATION_TYPING_STOPPED_INDICATOR':
        setShowActiveTyping(false)
        break
      case 'CONVERSATION_CLOSE_CONVERSATION':
        console.log('conversation close conversation...')
        break
      case 'CONVERSATION_SESSION_STATUS_CHANGED':
        data = JSON.parse(event.data)
        messagePayload = JSON.parse(data.conversationEntry.entryPayload)
        if (
          messagePayload?.entryType === 'SessionStatusChanged' &&
          messagePayload?.sessionStatus === 'Ended' &&
          messagePayload?.sessionEndedByRole !== 'Supervisor'
        ) {
          handleEndChat()
          setSystemMessage('Conversation ended with local expert.')
        }
        break
      default:
        console.log('Unknown event:', event)
        break
    }

    if (messages.length > 0) {
      setMessages((prevMessages) => [...prevMessages, ...messages])
    }
  }

  const afterEndChatReset = () => {
    setError(null)
    clearLocalStorage('tbChat')
    setIsMinimized(false)
    setShowChatButton(false)
    setIsCurrentlyChatting(false)
    setHasAgentEngaged(false)
    setConversationId(null)
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
      abortController.abort()
      setAbortController(null)
    }
  }

  const handleEndChat = async (accessTokenParam, conversationIdParam) => {
    afterEndChatReset()
    setShowChatHeader(false)
    setIsChatOpen(false)

    if (!accessTokenParam || !conversationIdParam) {
      return
    }

    try {
      console.log('Ending chat...')
      await endChat({
        accessToken: accessTokenParam,
        conversationId: conversationIdParam,
        endPoint,
        apiSfName
      })
    } catch (error) {
      console.error('Chat end error:', error.message)
    }
  }

  const initializeChat = async (firstName, lastName, email, isAgent, productCode, endPoint, apiSfOrgId, apiSfName) => {
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
        isAgent: isAgent,
        conversationId: newUuid,
        region: chatRegion,
        endPoint,
        apiSfOrgId,
        apiSfName
      }

      if (productCode) {
        payload.productCode = productCode
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
            1000 * 60 * 60 * 2
          )

          sendSystemtMessage({
            accessToken: token.accessToken,
            conversationId: newUuid,
            message: '::System Message:: User initiated chat(' + location.href + ')'
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
            setError('There was an error initializing the chat. Please try again.')
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

  const handleSubmit = async (e) => {
    const offlineMessage =
      'Our apologies, but all members of our Online Sales Team are currently unavailable. Please try again later.'
    e.preventDefault()
    setError(null)
    setSystemMessage(null)
    setShowActiveTyping(false)

    const form = e.target
    const { valid, firstName, lastName } = validateChatForm(form)
    if (!valid) return false

    setShowWaitMessage(true)
    setShowForm(false)
    trackChatEvent(chatStartedEventString)

    try {
      const availability = await fetchAvailability(chatRegion, availabilityAPI)
      if (availability?.data?.payload?.length > 0) {
        const email = form.email?.value?.trim()
        const isAgent = form.isAgent?.value ?? '0'

        const { clientId, email_sha256, gaTrackId } = (await utils?.getGaTrackingIds?.(email)) || {}

        setCallbackUrl(
          `https://hello.tollbrothers.com/l/402642/2025-08-05/2chvs9x?email=${encodeURIComponent(
            email
          )}&fname=${encodeURIComponent(firstName)}&lname=${encodeURIComponent(
            lastName
          )}&gaClientId=${encodeURIComponent(clientId ?? '')}&gaUserId=${encodeURIComponent(
            email_sha256 ?? ''
          )}&gaTrackId=${encodeURIComponent(gaTrackId ?? '')}`
        )

        await initializeChat(firstName, lastName, email, isAgent, productCode, endPoint, apiSfOrgId, apiSfName)
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

  const getConversationList = async (tbChat) => {
    try {
      const response = await getConversationHistory({
        accessToken: tbChat.accessToken,
        conversationId: tbChat.conversationId,
        endPoint
      })

      setShowWaitMessage(true)
      if (response?.conversationEntries?.length > 0) {
        const messages = response.conversationEntries.filter((entry) => {
          return entry.entryType === 'Message'
        })
        const formattedMessages = messages.map((message) => {
          return formatMessage(message, tbChat.firstName, tbChat.lastName)
        })

        let chatWasEndedByAgentWhileOffline = false
        const tbChatBackup = { ...tbChat }

        const hasTransferEvent = response.conversationEntries.some((entry) => {
          return entry.entryType === 'RoutingResult' && entry.entryPayload?.routingType === 'Transfer'
        })

        const hasConferenceEvent = response.conversationEntries.some((entry) => {
          return entry.entryType === 'RoutingResult' && entry.entryPayload?.routingType === 'Conference'
        })

        response.conversationEntries.map((entry) => {
          if (entry.entryType === 'ParticipantChanged' && entry.entryPayload?.entries?.length > 0) {
            entry.entryPayload.entries.map((entry) => {
              if (entry.operation === 'add' && entry.participant?.role !== 'Supervisor') {
                handleAddAgent(entry)
                setLocalStorage(
                  'tbChat',
                  {
                    accessToken: tbChatBackup.accessToken,
                    conversationId: tbChatBackup.conversationId,
                    firstName: tbChatBackup.firstName,
                    lastName: tbChatBackup.lastName
                  },
                  1000 * 60 * 60 * 2
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
                setSystemMessage(entry.displayName + ' left the conversation')
                setHasAgentEngaged(false)
                chatWasEndedByAgentWhileOffline = true
              }
            })
          } else if (
            entry.entryType === 'SessionStatusChanged' &&
            entry.entryPayload?.sessionStatus === 'Ended' &&
            entry.entryPayload?.sessionEndedByRole !== 'Supervisor' &&
            (hasTransferEvent || hasConferenceEvent)
          ) {
            handleEndChat()
            setSystemMessage('Conversation ended with local expert.')
            chatWasEndedByAgentWhileOffline = true
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

  const reestablishConnection = (event, chatBotTransferData) => {
    if (event && event.type === 'visibilitychange' && document.hidden) {
      return
    }

    let initialize = false
    const tbChat = getLocalStorage('tbChat') ?? chatBotTransferData

    if (!tbChat || isExpired(tbChat.expiry)) {
      clearLocalStorage('tbChat')
      return
    }

    const value = tbChat.value ?? tbChat
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
        setShowTextChatOptions(false)
        getConversationList(value)
        setShowWaitMessage(false)

        if (chatBotTransferData) {
          setLocalStorage(
            'tbChat',
            {
              accessToken: value.accessToken,
              conversationId: value.conversationId,
              firstName: value.firstName,
              lastName: value.lastName
            },
            1000 * 60 * 60 * 2
          )

          sendSystemtMessage({
            accessToken: value.accessToken,
            conversationId: value.conversationId,
            message: '::System Message:: User on page: (' + location.href + ')'
          })
        }

        setAbortController(abortController)
        setIsChatOpen(true)
      }
    })
  }

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

  // Effect: Handle chat status and visibility
  useEffect(() => {
    // if (!chatBotTransferData) {
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
    // }
  }, [chatStatus, isCurrentlyChatting, disableFloatingChatButton, isChatOpen, chatRegion])

  // Effect: Fetch OSC availability info
  useEffect(() => {
    async function getOscInfo() {
      try {
        const availability = await fetchAvailability(chatRegion, availabilityAPI)
        if (availability?.data?.payload?.length > 0) {
          setChatStatus('online')
          const index = Math.floor(Math.random() * availability.data.payload.length)
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
      setIsChatAvailabilityChecked(true)
    }

    setChatStatus('offline')
  }, [chatRegion, availabilityAPI])

  // Effect: Add visibility change listener
  useEffect(() => {
    window.addEventListener('visibilitychange', reestablishConnection)

    return () => {
      window.removeEventListener('visibilitychange', reestablishConnection)
    }
  }, [])

  // Effect: Reestablish connection after availability check
  useEffect(() => {
    console.log('Chat availability checked:', isChatAvailabilityChecked)
    if (isChatAvailabilityChecked) {
      reestablishConnection()
    }
  }, [isChatAvailabilityChecked])

  // Effect: Handle chatbot transfer
  // useEffect(() => {
  //   if (chatBotTransferData) {
  //     setShowChatButton(false)
  //     setShowChatHeader(true)
  //     setShowWaitMessage(true)
  //     setShowTextChatOptions(false)
  //     setIsChatOpen(true)
  //   }
  // }, [chatBotTransferData, setIsChatOpen])

  // Effect: Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isMinimized])

  // Effect: Handle typing indicator
  useEffect(() => {
    const typingMessageExists = messages.some((message) => {
      return message.payload?.formatType === 'Typing'
    })

    if (typingMessageExists && showActiveTyping) return

    if (showActiveTyping) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: popNextUUID(),
          type: 'Message',
          text: showActiveTyping?.conversationEntry?.senderDisplayName + ' is typing...',
          payload: { formatType: 'Typing' },
          role: 'Agent'
        }
      ])
    } else {
      setMessages((prevMessages) => {
        return prevMessages.filter((message) => {
          return message.payload?.formatType !== 'Typing'
        })
      })
    }
  }, [showActiveTyping])

  // Effect: Track unread messages
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

  return {
    // Refs
    chatContainerRef,

    // State
    showChatButton,
    accessToken,
    messages,
    conversationId,
    showForm,
    showChatHeader,
    showTextChatOptions,
    showWaitMessage,
    showConfirmationEndMessage,
    formData,
    isCurrentlyChatting,
    isMinimized,
    systemMessage,
    chatPhoto,
    agentName,
    error,
    hasAgentEngaged,
    callbackUrl,
    unreadMessagesCount,
    showActiveTyping,

    // Setters
    setFormData,
    setError,

    // Handlers
    handleSubmit,
    showTextChatOption,
    showFormHandler,
    handleMinimize,
    handleConfirmationEnd,
    handleStay,
    handleEndChat,
    setShowActiveTyping,
    reestablishConnection
  }
}
