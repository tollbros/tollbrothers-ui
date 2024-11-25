import React, { useState, useCallback } from 'react'

export default function ChatInput({
  accessToken,
  conversationId,
  popNextUUID
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const API_SF_NAME = 'OSC_Web_API' // 'OSC_Web_Chat';
  const API_SF_ENDPOINT =
    'https://tollbros--webchat.sandbox.my.salesforce-scrt.com'

  // const popNextUUID = () => crypto.randomUUID();

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
      customerFirstName: 'John'
    }

    try {
      const response = await fetch(
        `${API_SF_ENDPOINT}/iamessage/api/v2/conversation/${payload.conversationId}/message`,
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
            esDeveloperName: API_SF_NAME,
            isNewMessagingSession: false
          })
        }
      )

      if (response.status === 202) {
        setMessage('') // Clear the message input on success
      } else {
        throw new Error(`API error: ${response.statusText}`)
      }
    } catch (err) {
      setError(err.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }, [accessToken, conversationId, message, popNextUUID])

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
      <legend>Chat here</legend>
      <textarea
        rows={4}
        cols={50}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={onKeyUp}
        value={message}
        style={{ color: 'white', backgroundColor: 'black' }}
      />
      <p>Press enter to send</p>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}
