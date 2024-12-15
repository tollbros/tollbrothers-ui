import { fetchEventSource } from '@microsoft/fetch-event-source'
import { popNextUUID } from './libs'

// gets osc availability
export const fetchAvailability = async (region, availabilityAPI) => {
  if (!region) {
    console.error('Region is required to fetch availability.')
    return null
  }

  try {
    const response = await fetch(`${availabilityAPI}/${region}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(
        `Failed to fetch availability: ${response.status} ${response.statusText}`
      )
    }

    const responseData = await response.json()

    return { data: responseData, error: null }
  } catch (error) {
    console.error('Error fetching availability:', error)
    return { data: null, error: error.message }
  }
}

export async function handleChatInit(endPoint, apiSfOrgId, apiSfName) {
  try {
    const response = await fetch(
      `${endPoint}/iamessage/api/v2/authorization/unauthenticated/access-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orgId: apiSfOrgId,
          esDeveloperName: apiSfName,
          capabilitiesVersion: '1',
          platform: 'Web'
        })
      }
    )

    if (!response.ok) {
      throw new Error(
        `Failed to fetch access token: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching access token:', error)
    throw error
  }
}

export const startConversation = async (
  payload,
  retries = 2,
  retryDelay = 1000,
  endPoint,
  apiSfName
) => {
  if (!payload || !payload.accessToken || !payload.customerEmail) {
    throw new Error('Invalid payload provided chat.js 143')
  }

  const performRequest = async (remainingRetries) => {
    try {
      const response = await fetch(
        `${payload.endPoint}/iamessage/api/v2/conversation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${payload.accessToken}`
          },
          body: JSON.stringify({
            conversationId: payload.conversationId,
            esDeveloperName: payload.apiSfName,
            routingAttributes: {
              _email: payload.customerEmail,
              _firstName: payload.customerFirstName,
              _lastName: payload.customerLastName,
              region: payload.region
            }
          })
        }
      )

      if (response?.status === 201) {
        return {}
      } else {
        throw new Error(
          `API error chat.js 122: ${response.status} ${response.statusText}`
        )
      }
    } catch (error) {
      if (remainingRetries > 0) {
        console.warn(
          `Retrying... Attempts left: ${remainingRetries}, Error: ${error.message}`
        )
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        return performRequest(remainingRetries - 1)
      } else {
        throw error
      }
    }
  }

  return performRequest(retries)
}

export function listenToConversation(
  retryFunction,
  retryDelay = 1000,
  firstName,
  lastName,
  endPoint,
  apiSfOrgId,
  accessToken,
  conversationId
) {
  const request = async (payload) => {
    let attempts = 0
    const customerFirstName = firstName
    const customerLastName = lastName
    const executeRequest = async () => {
      try {
        await fetchEventSource(`${endPoint}/eventrouter/v1/sse`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${payload.accessToken}`,
            'X-Org-Id': apiSfOrgId
          },
          onmessage: (event) => {
            if (typeof payload.handleChatMessage === 'function') {
              payload.handleChatMessage(
                event,
                customerFirstName,
                customerLastName,
                accessToken,
                conversationId
              )
            } else {
              console.error('handleChatMessage is not a function!')
            }
          }
        })
      } catch (error) {
        console.error('Error in fetchEventSource:', error)
        if (retryFunction && retryFunction(attempts)) {
          attempts += 1
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          return executeRequest()
        } else {
          throw error
        }
      }
    }

    return executeRequest()
  }
  return { request }
}

export const fetchUuid = async () => {
  let data = null
  let error = null
  let loading = true

  try {
    const response = await fetch(`/api/uuid`)

    if (!response.ok) {
      throw new Error('API error')
    }

    const result = await response.json()

    if (result?.uuids) {
      data = result.uuids
    } else {
      error = 'No data found'
    }
  } catch (err) {
    error = err.message
  } finally {
    loading = false
  }

  return { data, loading, error }
}

// end chat
const RETRY_DELAY = 1000 // Adjust retry delay as needed

export const endChat = async (
  { accessToken, conversationId, endPoint, apiSfName },
  retries = 3
) => {
  const performRequest = async () => {
    try {
      const response = await fetch(
        `${endPoint}/iamessage/api/v2/conversation/${conversationId}?esDeveloperName=${apiSfName}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (response.status === 204) {
        return {} // Empty object indicating success
      } else {
        throw new Error('API error')
      }
    } catch (err) {
      if (retries > 0) {
        console.warn(`Retrying... (${retries} attempts left)`)
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
        return await performRequest(retries - 1) // Retry
      } else {
        throw new Error(err.message || 'Failed to end chat after retries.')
      }
    }
  }

  return await performRequest(retries)
}

export const createConversationListener = ({
  firstName,
  lastName,
  endPoint,
  apiSfOrgId,
  accessToken,
  conversationId
}) => {
  const retryFunction = (attempts) => attempts < 3
  const { request } = listenToConversation(
    retryFunction,
    2000,
    firstName,
    lastName,
    endPoint,
    apiSfOrgId,
    accessToken,
    conversationId
  )
  if (typeof request !== 'function') {
    throw new Error(
      'Invalid request function returned from listenToConversation'
    )
  }

  return request
}

export const getConversationHistory = async ({
  conversationId,
  accessToken,
  endPoint
}) => {
  const response = await fetch(
    `${endPoint}/iamessage/api/v2/conversation/${conversationId}/entries?limit=100&direction=FromStart`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
  )

  return await response?.json()
}

export const postMessage = async (payload) => {
  const response = await fetch(
    `${payload.endPoint}/iamessage/api/v2/conversation/${payload.conversationId}/message`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.accessToken}`
      },
      body: JSON.stringify({
        message: {
          id: popNextUUID(),
          messageType: 'StaticContentMessage',
          staticContent: {
            formatType: 'Text',
            text: payload.msg
          }
        },
        esDeveloperName: payload.apiSfName,
        isNewMessagingSession: false
      })
    }
  )

  // if 403, most likely the conversation has ended so let's just end it
  // this could happen if they have chat open in two tabs and the chat was ended

  if (response?.status < 300) {
    return 'success'
  } else {
    console.log('throw the error')
    throw new Error()
  }
}
