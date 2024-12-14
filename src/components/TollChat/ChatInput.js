'use client'

import React, { useState } from 'react'
import ChevronRight from '../../icons/ChevronRight'
import { postMessage } from '../../../utils/chat/apis'

import styles from './ChatInput.module.scss'

export default function ChatInput({
  accessToken,
  conversationId,
  apiSfName,
  endPoint
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)
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
      console.log('catch')
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
    <div
      className={styles.root}
      style={{
        position: 'relative',
        width: '100%',
        height: '60px',
        padding: '0'
      }}
    >
      <textarea
        rows={2}
        cols={50}
        onChange={handleInputChange}
        placeholder='Type Here'
        onKeyDown={onKeyDown}
        value={message}
      />
      {showArrow && (
        <button
          onClick={sendMessage}
          style={{
            position: 'absolute',
            right: '5px',
            bottom: '5px',
            top: '5px',
            width: '52px',
            height: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1463c2',
            cursor: 'pointer'
          }}
        >
          <ChevronRight fill='#fff' />
        </button>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}
