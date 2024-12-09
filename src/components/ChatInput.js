import React, { useState, useCallback } from 'react'
export default function ChatInput({
  accessToken,
  conversationId,
  popNextUUID,
  customerFirstName,
  customerLastName,
  setCustomerFirstName,
  setCustomerLastName,
  apiSfName,
  endPoint
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(async () => {
    if (!message.trim()) {
      setError('Message cannot be empty')
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      accessToken,
      conversationId,
      nextUuid: popNextUUID(),
      msg: message,
      customerFirstName: customerFirstName,
      customerLastName: customerLastName
    }

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
  }, [
    accessToken,
    conversationId,
    message,
    popNextUUID,
    setCustomerFirstName,
    setCustomerLastName
  ])

  const onKeyUp = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    } else {
      setMessage(e.target.value)
    }
  }

  return (
    <div>
      {/* <legend>Chat here</legend> */}
      <textarea
        rows={2}
        cols={50}
        onChange={(e) => setMessage(e.target.value)}
        placeholder='Type Here'
        onKeyDown={onKeyUp}
        value={message}
        style={{ color: 'white', backgroundColor: 'black' }}
      />
      {/* <p>Press enter to send</p> */}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}
