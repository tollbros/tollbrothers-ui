'use client'

import React, { useState } from 'react'
import { postMessage } from '../../../../utils/chat/apis'
import { UserInputField } from '../UserInputField'

import styles from './ChatInput.module.scss'

export default function ChatInput({
  accessToken,
  conversationId,
  apiSfName,
  endPoint,
  setError
}) {
  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    if (!message.trim()) {
      setError('Message cannot be empty')
      return
    }
    setError(null)

    const payload = {
      accessToken,
      conversationId,
      msg: message,
      endPoint,
      apiSfName
    }

    try {
      await postMessage(payload)
      setMessage('')
    } catch (err) {
      setError(
        err?.message?.includes('PRECHAT_FORM_REQUIRED')
          ? 'Your conversation has ended. Please close this window if you wish to start a new chat.'
          : 'Failed to send message. Please try again.'
      )
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={styles.root}>
      <UserInputField
        value={message}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        onSend={sendMessage}
        placeholder='Type Here'
      />
    </div>
  )
}
