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
  sessionId,
  onClose,
  utils,
  // onFormSubmissionStatus,
  // formSubmissionStatus,
  onTransferSuccess,
  chatEndpointId,
  chatApiKey
}) => {
  const [selectedValue, setSelectedValue] = useState('')
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [regions, setRegions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAgentAvailable, setIsAgentAvailable] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [isThinking, setIsThinking] = useState(true)
  const [formSubmissionStatus, setFormSubmissionStatus] = useState(null)

  const handleChange = async (e) => {
    const value = e.target.value
    setSelectedValue(value)
    const region = regions.find((r) => r.metroId == value)
    setSelectedRegion(region)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const form = e.target
    const { valid, firstName, lastName } = validateChatForm(form)
    if (!valid) return false

    const email = form.email?.value?.trim()
    const phone = form.phone?.value?.trim()
    let isAgent = false

    if (form.isAgent?.value === '1') {
      isAgent = true
    }

    const formData = {
      firstName,
      lastName,
      email,
      phone,
      isAgent,
      toll_product_code: productCode,
      toll_division_code: selectedRegion?.chatRegion ?? chatRegion,
      session_id: sessionId
    }

    console.log('Form submitted with data:', formData)

    if (utils?.dataLayerPush) {
      utils.dataLayerPush({
        event: 'chatStarted',
        agent_status: isAgentAvailable ? 'online' : 'offline',
        variant: 'chatbot'
      })
    }

    // FOR TESTING ONLY PLEASE REMOVE WHEN BOT IS READY TO GO LIVE
    const urlParams = new URLSearchParams(window.location.search)
    const endpointId = urlParams.get('endpointId') ?? chatEndpointId
    const apiKey = urlParams.get('apiKey') ?? chatApiKey

    setIsThinking(true)
    setFormSubmissionStatus({
      message: 'Processing your information.'
    })

    const isAvailable = await checkLiveAgentAvailability(chatRegion ?? selectedRegion?.chatRegion, availabilityAPI)
    setIsAgentAvailable(isAvailable)

    setFormSubmissionStatus({
      message: isAvailable
        ? 'Please wait while I transfer you to a local expert.'
        : 'Please wait while I send your information.'
    })

    try {
      const response = await fetch(
        `https://ssadsf${endpointId}.execute-api.us-east-1.amazonaws.com/prod/agent/transfer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify(formData)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      const data = await response.json()
      console.log('Transfer response:', data)
      setFormSubmissionStatus(null)
      setIsThinking(false)

      if (!data.sf_miaw_token || !data.sf_miaw_uuid) {
        setFormSubmissionStatus({
          message: 'Your information was sent successfully. A local expert will contact you soon.'
        })
      } else {
        onTransferSuccess({ ...data, firstName, lastName })
      }
    } catch (err) {
      // TODO - display error to user
      console.error('submit error:', err)
      setIsThinking(false)
      setFormSubmissionStatus(null)
    }
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

      const isAvailable = await checkLiveAgentAvailability(chatRegion ?? selectedRegion?.chatRegion, availabilityAPI)

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
  let chatFormButtonText = 'Speak with Local Expert'

  if (!isAgentAvailable) {
    chatFormButtonText = 'Contact Me'
    chatFormMessage = 'Our local experts are currently offline'

    if (chatRegion) {
      chatFormMessage += ' in this area of interest'
    } else if (selectedRegion) {
      chatFormMessage += ` in ${selectedRegion.fullName}`
    }
    chatFormMessage += '. Share your contact information below and we will get back to you.'
  } else {
    chatFormMessage = 'Good news! A local expert is available'

    if (chatRegion) {
      chatFormMessage += ' for this area of interest'
    } else if (selectedRegion) {
      chatFormMessage += ` for ${selectedRegion.fullName}`
    }

    chatFormMessage += '. Share your contact information below so I can transfer you.'
  }

  if (formSubmissionStatus) {
    return (
      <div className={styles.submittingContainer}>
        <p className={styles.text}>{formSubmissionStatus.message}</p>
        {isThinking && <ThinkingIndicator classes={{ root: styles.thinkingIndicatorOverride }} />}
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <CloseButton onClick={onClose} ariaLabel='Close form' />
      {!chatRegion && (
        <div className={styles.regionPrompt}>
          <p className={styles.text}>
            I'll connect you with a local expert. Select your area of interest below to get started.
          </p>
          <CustomSelect
            value={selectedValue}
            onChange={handleChange}
            options={regions}
            placeholder={isLoading ? 'Loading areas of interest...' : 'Select one'}
            disabled={isLoading}
            ariaLabel='Select your region'
            valueKey='metroId'
            labelKey='fullName'
          />
        </div>
      )}

      {isThinking && (
        <p className={styles.text}>Please wait while I look for an available expert in your area of interest.</p>
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
          isShowPhoneInput
          disabled={(!chatRegion && !selectedRegion) || isThinking}
        />
      </div>
    </div>
  )
}
