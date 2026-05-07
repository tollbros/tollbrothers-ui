export const submitConversationFeedback = async (payload, { baseUrl, apiKey }) => {
  const headers = {
    'Content-Type': 'application/json'
  }

  if (apiKey) {
    headers['x-api-key'] = apiKey
  }

  const response = await fetch(`${baseUrl}/agent/feedback`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Feedback API error: ${response.status}`)
  }

  const data = await response.json()

  return data
}
