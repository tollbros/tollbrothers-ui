export const sendMessage = async (
  query,
  { baseUrl, apiKey, onChunk, onDone, onError }
) => {
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
      body: JSON.stringify({ prompt: query })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

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
          if (onChunk && parsed.response) onChunk(parsed.response)
        } catch {
          // skip non-JSON lines
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim())
        if (onChunk && parsed.response) onChunk(parsed.response)
      } catch {
        // skip non-JSON lines
      }
    }

    if (onDone) onDone()
  } catch (error) {
    if (onError) onError(error)
  }
}
