import { useState } from 'react'
import { fetchAvailability } from '../../utils/chat'

export const useChat = (availabilityAPI) => {
  const [chatStatus, setChatStatus] = useState('offline')
  const [isFetching, setIsFeching] = useState(false)

  const setChatRegion = (region) => {
    setIsFeching(true)
    setChatStatus('offline')
    async function getOscInfo() {
      try {
        const availability = await fetchAvailability(region, availabilityAPI)
        if (availability?.data?.payload?.length > 0) {
          setChatStatus('online')
        }
        setIsFeching(false)
      } catch (error) {
        console.error('Error fetching osc data:', error)
        setIsFeching(false)
      }
    }

    if (!isFetching) getOscInfo()
  }

  return {
    chatStatus,
    setChatRegion
  }
}
