import React, { useState } from 'react'

export default function ChatInput({
  accessToken,
  conversationId,
  popNextUUID,
  apiSfName
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)
  const API_SF_NAME = 'OSC_Web_API' // 'OSC_Web_Chat';

  const API_SF_ENDPOINT =
    'https://tollbros--webchat.sandbox.my.salesforce-scrt.com'

  const sendMessage = async () => {
    if (message.trim() === '') return // Don't send empty messages

    try {
      const nextUuid = popNextUUID() // Get the next UUID for the message

      const payload = {
        accessToken,
        conversationId,
        msg: message,
        nextUuid
      }

      console.log('Sending message with payload:', payload)

      // Update this URL to call the Salesforce API endpoint for sending messages
      const response = await fetch(
        `${API_SF_ENDPOINT}/iamessage/api/v2/conversation/${conversationId}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}` // Authorization header if needed
          },
          body: JSON.stringify({
            conversationId: conversationId,
            esDeveloperName: API_SF_NAME, // Your Salesforce endpoint name
            message: {
              id: nextUuid, // Unique message ID
              messageType: 'StaticContentMessage',
              staticContent: {
                formatType: 'Text',
                text: message
              }
            }
          })
        }
      )

      // Check if the request is successful
      if (!response.ok) {
        const errorText = await response.text() // Get detailed error message
        throw new Error(`Failed to send message: ${errorText}`)
      }

      const data = await response.json()
      console.log('Message sent successfully:', data)

      // Clear message input on success
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      setError(`Error sending message: ${error.message}`) // Display error
    }
  }
  const onKeyUp = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage() // Send message when user presses enter
    } else {
      setMessage(e.target.value)
    }
  }

  return (
    <div key='input'>
      <legend>Chat here</legend>
      <textarea
        rows={4}
        cols={50}
        onChange={(e) => setMessage(e.target.value)} // Update message on input change
        onKeyDown={onKeyUp} // Trigger onKeyUp event when user presses a key
        value={message}
        style={{ color: 'white', backgroundColor: 'black' }}
      />
      <p>Press enter to send</p>
      {error && <div style={{ color: 'red' }}>{error}</div>}{' '}
    </div>
  )
}
