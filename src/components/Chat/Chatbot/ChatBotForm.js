import React, { useEffect, useState } from 'react'
import styles from './ChatBotForm.module.scss'
import { CustomSelect } from './CustomSelect'
import { ChatForm } from '../ChatForm'
import { validateChatForm } from '../utils/validateChatForm'
import { fetchAvailability } from '../../../../utils/chat/apis'
import { ThinkingIndicator } from './ThinkingIndicator'
import { CloseButton } from './CloseButton'

const checkLiveAgentAvailability = async (region, availabilityAPI) => {
  const availability = await fetchAvailability(region, availabilityAPI)
  if (availability?.data?.payload?.length > 0) {
    return true
  }

  return false
}

export const ChatBotForm = ({
  tollRegionsEndpoint,
  availabilityAPI,
  chatRegion,
  productCode,
  onClose
}) => {
  const [selectedValue, setSelectedValue] = useState('')
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [regions, setRegions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAgentAvailable, setIsAgentAvailable] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isThinking, setIsThinking] = useState(true)

  const handleChange = async (e) => {
    const value = e.target.value
    setSelectedValue(value)
    const region = regions.find((r) => r.metroId == value)
    setSelectedRegion(region)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const form = e.target
    const { valid, firstName, lastName } = validateChatForm(form)
    if (!valid) return false

    const email = form.email?.value?.trim()
    const isAgent = form.isAgent?.value ?? '0'
    console.log(
      'Form submitted with data:',
      firstName,
      lastName,
      email,
      isAgent,
      productCode,
      selectedRegion?.chatRegion ?? chatRegion
    )
  }

  useEffect(() => {
    const STORAGE_KEY = 'chatbot_regions'

    const getRegions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const cached = sessionStorage.getItem(STORAGE_KEY)
        if (cached) {
          setRegions(JSON.parse(cached))
          setIsLoading(false)
          return
        }

        const response = await fetch(tollRegionsEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch regions')
        }

        const data = await response.json()

        const seen = new Set()
        const allRegions = data
          .flatMap((state) => state.value?.regions || [])
          .filter((r) => r.region?.acquireId)
          .map((r) => ({
            chatRegion: r.region.acquireId,
            fullName: r.region.fullName,
            metroId: r.region.metroId
          }))
          .filter((r) => {
            if (seen.has(r.fullName)) return false
            seen.add(r.fullName)
            return true
          })
          .sort((a, b) => a.fullName.localeCompare(b.fullName))

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allRegions))
        setRegions(allRegions)
      } catch (err) {
        setError('Unable to load regions. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    getRegions()
  }, [tollRegionsEndpoint])

  useEffect(() => {
    setIsThinking(true)

    const fetchAvailabilityStatus = async () => {
      if (!chatRegion && !selectedRegion) {
        setIsThinking(false)
        setIsAgentAvailable(false)
        return
      }

      const isAvailable = await checkLiveAgentAvailability(
        chatRegion ?? selectedRegion?.chatRegion,
        availabilityAPI
      )

      setTimeout(() => {
        setIsAgentAvailable(isAvailable)
        setIsThinking(false)
      }, 500)
    }

    fetchAvailabilityStatus()
  }, [chatRegion, selectedRegion, availabilityAPI])

  if (error) {
    return <div className={styles.error}>{error}</div>
  }

  let chatFormMessage = ''
  let chatFormButtonText = 'Chat with Local Expert'

  if (!isAgentAvailable) {
    chatFormButtonText = 'Contact Me'
    chatFormMessage = 'Our local experts are currently offline'

    if (chatRegion) {
      chatFormMessage += ' for this area of interest'
    } else if (selectedRegion) {
      chatFormMessage += ` for ${selectedRegion.fullName}`
    }
    chatFormMessage +=
      '. Please provide your contact information below and someone will get back to you.'
  } else {
    chatFormMessage = 'Good news! A local expert is available'

    if (chatRegion) {
      chatFormMessage += ' for this area of interest'
    } else if (selectedRegion) {
      chatFormMessage += ` for ${selectedRegion.fullName}`
    }

    chatFormMessage +=
      '. Please provide your contact information below so I can transfer you.'
  }

  return (
    <div className={styles.root}>
      <CloseButton onClick={onClose} ariaLabel='Close form' />
      {!chatRegion && (
        <div className={styles.regionPrompt}>
          <p className={styles.text}>
            In order to connect you with a local expert, please select your area
            of interest.
          </p>
          <CustomSelect
            value={selectedValue}
            onChange={handleChange}
            options={regions}
            placeholder={
              isLoading ? 'Loading areas of interest...' : 'Select one'
            }
            disabled={isLoading}
            ariaLabel='Select your region'
            valueKey='metroId'
            labelKey='fullName'
          />
        </div>
      )}

      {isThinking && (
        <p className={styles.text}>
          Please wait while I look for an available expert in your area of
          interest.
        </p>
      )}

      <div className={styles.formContainer}>
        {((!chatRegion && !selectedRegion) || isThinking) && (
          <div className={styles.formOverlay}>
            {isThinking && (
              <div className={styles.indicatorContainer}>
                <ThinkingIndicator />
              </div>
            )}
          </div>
        )}
        <p className={styles.text}>{chatFormMessage}</p>
        <ChatForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          cta={chatFormButtonText}
          disabled={(!chatRegion && !selectedRegion) || isThinking}
        />
      </div>
    </div>
  )
}
