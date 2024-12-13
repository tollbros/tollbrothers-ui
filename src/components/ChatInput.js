'use client'

import React, { useState, useCallback, useEffect } from 'react'
import ChevronRight from '../icons/ChevronRight'
import { popNextUUID } from '../../utils/chat/libs'

import styles from './ChatInput.module.scss'

export default function ChatInput({
  accessToken,
  conversationId,
  // popNextUUID,
  customerFirstName,
  customerLastName,
  setCustomerFirstName,
  setCustomerLastName,
  apiSfName,
  endPoint,
  reestablishedConnection
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showArrow, setShowArrow] = useState(false)

  const sendMessage = useCallback(
    async (_event, customMessage) => {
      if (!message.trim() && !customMessage) {
        setError('Message cannot be empty')
        return
      }
      setShowArrow(false)
      setLoading(true)
      setError(null)

      const payload = {
        accessToken,
        conversationId,
        nextUuid: popNextUUID(),
        msg: customMessage || message,
        customerFirstName: customerFirstName,
        customerLastName: customerLastName
      }

      console.log('payload', payload)

      try {
        const response = await fetch(
          `${endPoint}/iamessage/api/v2/conversation/${payload.conversationId}/message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${payload.accessToken}`
            },
            body: JSON.stringify({
              message: {
                id: payload.nextUuid,
                messageType: 'StaticContentMessage',
                staticContent: {
                  formatType: 'Text',
                  text: payload.msg
                }
              },
              esDeveloperName: apiSfName,
              isNewMessagingSession: false
            })
          }
        )

        if (response.status === 202) {
          setMessage('')
          setCustomerFirstName(customerFirstName)
          setCustomerLastName(customerLastName)
        } else {
          throw new Error(`API error chatinput.js 68: ${response.statusText}`)
        }
      } catch (err) {
        setError(err.message || 'Failed to send message')
      } finally {
        setLoading(false)
      }
    },
    [
      accessToken,
      conversationId,
      message,
      popNextUUID,
      setCustomerFirstName,
      setCustomerLastName
    ]
  )

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

  useEffect(() => {
    if (reestablishedConnection)
      sendMessage(null, '::System Message:: Guest restored connection')
  }, [reestablishedConnection])

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
