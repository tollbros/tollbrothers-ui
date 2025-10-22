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
  retryDelay = 1000
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
              region: payload.region,
              isAgent: payload.isAgent,
              productCode: payload.productCode
            }
          })
        }
      )

      if (response?.ok) {
        return {}
      } else {
        throw new Error()
      }
    } catch (error) {
      if (remainingRetries > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        return performRequest(remainingRetries - 1)
      } else {
        throw error
      }
    }
  }

  return performRequest(retries)
}

export function listenToConversation({
  handleChatMessage,
  onSuccess,
  firstName,
  lastName,
  endPoint,
  apiSfOrgId,
  accessToken,
  conversationId,
  onError
}) {
  try {
    let retryErrorCount = 0
    const retryErrorOnOpenCount = 0
    const abortController = new AbortController()

    fetchEventSource(`${endPoint}/eventrouter/v1/sse`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Org-Id': apiSfOrgId
      },
      signal: abortController.signal,
      openWhenHidden: true,
      async onopen(res) {
        if (res.ok) {
          if (onSuccess) onSuccess(abortController)
        } else if (
          res.status >= 400 &&
          res.status < 500 &&
          res.status !== 429
        ) {
          throw new Error('FatalError')
        } else {
          throw new Error()
        }
      },
      onmessage: (msg) => {
        if (msg.event === 'FatalError') {
          console.log('message error?')
          throw new Error('FatalError')
        }

        if (typeof handleChatMessage === 'function') {
          handleChatMessage(
            msg,
            firstName,
            lastName,
            accessToken,
            conversationId
          )
        } else {
          console.error('handleChatMessage is not a function!')
        }
      },
      onclose() {
        abortController.abort()
      },
      onerror(err) {
        if (
          err === 'FatalError' ||
          retryErrorCount > 2 ||
          retryErrorOnOpenCount > 2
        ) {
          throw err // rethrow to stop the operation
        } else {
          retryErrorCount++
        }
      }
    }).catch((error) => {
      console.log(error)
      abortController.abort()
      if (onError) onError()
    })
  } catch (error) {
    if (onError) onError()
  }
}

// end chat
const RETRY_DELAY = 1000 // Adjust retry delay as needed

export const endChat = async (
  { accessToken, conversationId, endPoint, apiSfName },
  retries = 2
) => {
  const performRequest = async (remainingRetries) => {
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
      if (remainingRetries > 0) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
        return await performRequest(remainingRetries - 1) // Retry
      } else {
        throw new Error(err.message)
      }
    }
  }

  return await performRequest(retries)
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
