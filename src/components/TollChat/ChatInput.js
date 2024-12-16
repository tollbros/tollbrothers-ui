'use client'

import React, { useState } from 'react'
import ChevronRight from '../../icons/ChevronRight'
import { postMessage } from '../../../utils/chat/apis'

import styles from './ChatInput.module.scss'

export default function ChatInput({
  accessToken,
  conversationId,
  apiSfName,
  endPoint,
  setError
}) {
  const [message, setMessage] = useState('')
  const [showArrow, setShowArrow] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) {
      setError('Message cannot be empty')
      return
    }
    setShowArrow(false)
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
      if (message) setShowArrow(true)
      setError('Failed to send message. Please try again.')
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value)

    // Show the arrow if there's input
    if (e.target.value.trim() !== '') {
      setShowArrow(true)
    } else {
      setShowArrow(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={styles.root}>
      <textarea
        rows={2}
        cols={50}
        onChange={handleInputChange}
        placeholder='Type Here'
        onKeyDown={onKeyDown}
        value={message}
      />
      {showArrow && (
        <button onClick={sendMessage}>
          <ChevronRight fill='#fff' />
        </button>
      )}
    </div>
  )
}
