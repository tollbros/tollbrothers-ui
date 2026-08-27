export const sendMessage = async (prompt, { baseUrl, apiKey, onChunk, onDone, onError }) => {
  const headers = {
    'Content-Type': 'application/json'
  }

  if (apiKey) {
    headers['x-api-key'] = apiKey
  }

  try {
    const response = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...prompt, streaming: true })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''
    let sessionId = null
    let conversationTurnId = null
    let uiMessage = null

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          const parsed = JSON.parse(trimmed)

          // Handle acknowledgment message to capture session info
          if (parsed.type === 'ack') {
            sessionId = parsed.session_id
            conversationTurnId = parsed.conversation_turn_id
            continue
          }

          // Stream text messages immediately
          if (onChunk && parsed.type === 'text') {
            onChunk({
              ...parsed,
              session_id: sessionId,
              conversation_turn_id: conversationTurnId
            })
          }

          // Buffer ui message to send after stream is done
          if (parsed.type === 'ui') {
            uiMessage = {
              ...parsed,
              session_id: sessionId,
              conversation_turn_id: conversationTurnId
            }
          }
        } catch {
          // skip non-JSON lines
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim())

        // Handle acknowledgment message to capture session info
        if (parsed.type === 'ack') {
          sessionId = parsed.session_id
          conversationTurnId = parsed.conversation_turn_id
        } else if (parsed.type === 'text' && onChunk) {
          // Stream text messages immediately
          onChunk({
            ...parsed,
            session_id: sessionId,
            conversation_turn_id: conversationTurnId
          })
        } else if (parsed.type === 'ui') {
          // Buffer ui message to send after stream is done
          uiMessage = {
            ...parsed,
            session_id: sessionId,
            conversation_turn_id: conversationTurnId
          }
        }
      } catch {
        // skip non-JSON lines
      }
    }

    // Send the ui message after stream is complete
    if (onChunk && uiMessage) {
      onChunk(uiMessage)
    }

    if (onDone) onDone()
  } catch (error) {
    if (onError) onError(error)
  }
}
