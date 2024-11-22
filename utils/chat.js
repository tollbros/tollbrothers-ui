// import { useState, useEffect } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'

const API_SF_ENDPOINT =
  'https://tollbros--webchat.sandbox.my.salesforce-scrt.com'
const API_OSC_AVAILABILITY =
  'https://7qlgmork2b.execute-api.us-east-1.amazonaws.com/v1/osc'
const API_SF_ORG = '00D17000000ednF'
const API_SF_NAME = 'OSC_Web_API' // 'OSC_Web_Chat';

export const fetchAvailability = async (region) => {
  if (!region) {
    console.error('Region is required to fetch availability.')
    return null
  }

  try {
    const response = await fetch(`${API_OSC_AVAILABILITY}/${region}`, {
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
    // console.log('Availability data:', responseData)

    return { data: responseData, error: null } // Return fetched data
  } catch (error) {
    console.error('Error fetching availability:', error)
    return { data: null, error: error.message } // Return error details
  }
}
export async function handleChatInit() {
  // console.log(
  //   `${API_SF_ENDPOINT}/iamessage/api/v2/authorization/unauthenticated/access-token`,
  //   'Fetching access token...'
  // )
  try {
    const response = await fetch(
      `${API_SF_ENDPOINT}/iamessage/api/v2/authorization/unauthenticated/access-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orgId: API_SF_ORG,
          esDeveloperName: API_SF_NAME,
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
    // console.log('Access token fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Error fetching access token:', error)
    throw error
  }
}

export const startConversation = async (
  payload,
  retries = 1,
  retryDelay = 1000
) => {
  if (!payload || !payload.accessToken || !payload.customerEmail) {
    throw new Error('Invalid payload provided')
  }
  console.log('payload', payload)
  // if (!payload) {
  //   throw new Error('Invalid payload provided')
  // }

  const performRequest = async (remainingRetries) => {
    try {
      const response = await fetch(
        `${API_SF_ENDPOINT}/iamessage/api/v2/conversation`,
        // `${API_SF_ENDPOINT}/iamessage/api/v2/conversation/${payload.conversationId}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${payload.accessToken}`
          },
          body: JSON.stringify({
            conversationId: payload.conversationId,
            esDeveloperName: API_SF_NAME,
            routingAttributes: {
              _email: payload.customerEmail,
              _firstName: payload.customerFirstName,
              _lastName: payload.customerLastName,
              region: payload.region
            }
          })
        }
      )
      console.log('Conversation started successfully:', response)

      if (response.status === 201) {
        return {} // Success, return empty object or appropriate data
      } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      if (remainingRetries > 0) {
        console.warn(`Retrying... Attempts left: ${remainingRetries}`)
        await new Promise((resolve) => setTimeout(resolve, retryDelay)) // Wait before retry
        return performRequest(remainingRetries - 1)
      } else {
        throw error // Exhausted retries, propagate the error
      }
    }
  }

  return performRequest(retries)
}

export async function listenToConversation(payload, accessToken, onMessage) {
  console.log(`Listening to conversation: ${payload}`)
  try {
    await fetchEventSource(
      `${API_SF_ENDPOINT}/iamessage/api/v2/conversation/${payload}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
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
  } catch (error) {
    console.error('Error in SSE connection:', error)
    throw error
  }
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
