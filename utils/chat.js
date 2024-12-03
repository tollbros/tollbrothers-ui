import { fetchEventSource } from '@microsoft/fetch-event-source'

// const API_SF_ENDPOINT =
//   'https://tollbros--webchat.sandbox.my.salesforce-scrt.com'
// const API_OSC_AVAILABILITY =
//   'https://7qlgmork2b.execute-api.us-east-1.amazonaws.com/v1/osc'
// const API_SF_ORG = '00D17000000ednF'
// const API_SF_NAME = 'OSC_Web_API' // 'OSC_Web_Chat';

// gets osc availability
export const fetchAvailability = async (region, endPoint, oscAvailable) => {
  if (!region) {
    console.error('Region is required to fetch availability.')
    return null
  }

  try {
    const response = await fetch(`${oscAvailable}/${region}`, {
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
  console.log(payload.apiSfName, 'endPoint 148')
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
  apiSfOrgId
) {
  const request = async (payload) => {
    console.log(apiSfOrgId, ' endPoint 151')
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
                endPoint
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
  console.log('request', request)
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
