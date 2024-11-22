import React, { useState, useEffect } from 'react'

import styles from './TollChat.module.scss'

import {
  handleChatInit,
  fetchAvailability,
  startConversation,
  listenToConversation
} from '../../utils/chat'
import ChatInput from './ChatInput'

export const TollChat = ({ classes = {} }) => {
  const region = 'FLW'

  const [showChatButton, setShowChatButton] = useState(false) // show chat button if osc is available
  const [accessToken, setAccessToken] = useState(null)
  const [availableOscs, setAvailableOscs] = useState([])
  const [messages, setMessages] = useState([]) // this is the conversation transcript
  const [conversationIds, setConversationIds] = useState([]) // a bunch of uuids to choose from
  const [conversationId, setConversationId] = useState(null)
  const [customerFirstName, setCustomerFirstName] = useState('Jane')
  const [customerLastName, setCustomerLastName] = useState('Doe')
  const [customerEmail, setCustomerEmail] = useState('jane@doe.com')
  const [chatStartReady, setChatStartReady] = useState(false) // trigger to setup the listener
  const [restablishChat, setRestablishChat] = useState(false) // for re-establishing chat on page reload
  const [showActiveTyping, setShowActiveTyping] = useState(false) // to differentiate between initial sender and agent
  const [oscIsActive, setOscIsActive] = useState(false)
  const [isCurrentlyChatting, setIsCurrentlyChatting] = useState(true) // if their is an active chat

  const [showForm, setShowForm] = useState(false)
  const [showOsc, setShowOsc] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const generateConversationId = () => {
    if (!conversationId) {
      const newUuid = crypto.randomUUID()
      setConversationId(newUuid)
      console.log('Generated UUID:', newUuid)
    }
  }

  const popNextUUID = () => {
    const copyUuids = [...conversationIds]
    const nextUuid = copyUuids[copyUuids.length - 1]
    copyUuids.pop()
    setConversationIds(copyUuids)
    return nextUuid
  }

  const initializeChat = async () => {
    try {
      console.log('initialize chat')
      const token = await handleChatInit()
      setAccessToken(token.accessToken)
      console.log(token, 'access token')

      const newUuid = conversationId || crypto.randomUUID()
      if (!conversationId) {
        setConversationId(newUuid)
      }

      const payload = {
        accessToken: token.accessToken,
        customerEmail,
        customerFirstName,
        customerLastName,
        conversationId: newUuid, // Use the local variable
        region
      }

      const conversation = await startConversation(payload)
      setConversationId(payload.conversationId)
      setChatStartReady(!!payload.conversationId)

      console.log(payload.conversationId, 'initialize chat')
      await listenToConversation(
        payload.conversationId,
        token.accessToken,
        (message) => {
          setMessages((prev) => [...prev, JSON.parse(message)])
        }
      )
    } catch (error) {
      console.error('Error initializing chat:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('form submitted')
    setShowForm(false)
    await initializeChat()
    // initializeChat()
  }

  const showFormHandler = () => {
    setShowForm(true)
    setShowOsc(false)
  }

  useEffect(() => {
    async function getOscInfo() {
      try {
        const availability = await fetchAvailability(region)
        setAvailableOscs(availability.data.payload)
      } catch (error) {
        console.error('Error fetching osc data:', error)
      }
    }

    getOscInfo()
  }, [])

  useEffect(() => {
    if (availableOscs && availableOscs.length > 0) {
      setShowChatButton(true)
    } else {
      setShowChatButton(false)
    }
  }, [availableOscs])

  const onKeyUp = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      const nextUuid = randomUUID() // Use a function to generate UUID
      chatMessage.mutate(
        { accessToken, conversationId, msg: message, nextUuid },
        {
          onSuccess: () => {
            setMessage('')
          },
          onError: (err) => {
            setError(`Error sending message: ${JSON.stringify(err)}`)
          }
        }
      )
    } else {
      setMessage(e.target.value)
    }
  }

  return (
    <div className={styles.tollChatWrapper}>
      {/* <h1 className={styles.chatTitle}>Toll Chat</h1> */}
      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor='name'>Name:</label>
          <br />
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            required
            pattern='[A-Za-z\s]+'
            title='Name can only contain letters and spaces'
          />
          <br />
          <br />

          <label htmlFor='email'>Email:</label>
          <br />
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            required
          />
          <br />
          <br />

          <button type='submit'>Submit</button>
        </form>
      )}

      {showChatButton && (
        <button className={styles.chatLaunch} onClick={showFormHandler}>
          {' '}
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
      {conversationId && accessToken && (
        <ChatInput
          accessToken={accessToken}
          conversationId={conversationId}
          popNextUUID={popNextUUID}
        />
      )}
    </div>
  )
}
