import React, { useEffect, useState } from 'react'
import styles from './ChatBotForm.module.scss'
import { CustomSelect } from './CustomSelect'
import { ChatForm } from '../ChatForm'
import { validateChatForm } from '../utils/validateChatForm'
import { fetchAvailability } from '../../../../utils/chat/apis'
import { ThinkingIndicator } from './ThinkingIndicator'
import { CloseButton } from './CloseButton'
import { ActionButton } from './ActionButton'

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
  onTransferSuccess,
  setChatFormDialog,
  setWasFormSubmitted = () => null,
  setFormSuccessCallback = () => null,
  bypassLiveAgent = false,
  chatFormDialog,
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
      session_id: sessionId,
      bypassLiveAgent: false
    }

    if (bypassLiveAgent) {
      formData.bypassLiveAgent = true
    }

    console.log('Form submitted with data:', formData)

    // FOR TESTING ONLY PLEASE REMOVE WHEN BOT IS READY TO GO LIVE
    const urlParams = new URLSearchParams(window.location.search)
    const endpointId = urlParams.get('endpointId') ?? chatEndpointId
    const apiKey = urlParams.get('apiKey') ?? chatApiKey

    setChatFormDialog({
      message: 'Routing your request...',
      isSending: true
    })

    const isAvailable = await checkLiveAgentAvailability(chatRegion ?? selectedRegion?.chatRegion, availabilityAPI)
    setIsAgentAvailable(isAvailable)

    setChatFormDialog({
      message:
        isAvailable && !bypassLiveAgent
          ? 'Please wait while I transfer you to a local expert.'
          : 'Please wait while I send your information.',
      isSending: true
    })

    try {
      const response = await fetch(`https://${endpointId}.execute-api.us-east-1.amazonaws.com/prod/agent/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      const data = await response.json()
      console.log('Transfer response:', data)

      const { clientId, email_sha256, gaTrackId } = (await utils?.getGaTrackingIds?.(email)) || {}

      if (utils?.dataLayerPush) {
        utils.dataLayerPush({
          event: 'chatStarted',
          agent_status: isAgentAvailable ? 'online' : 'offline',
          variant: 'chatbot'
        })
        if (email_sha256) utils.dataLayerPush({ email_sha256: email_sha256 })
      }

      setFormSuccessCallback(
        `https://hello.tollbrothers.com/l/402642/2026-04-07/2cv3sc1?email=${encodeURIComponent(
          email
        )}&fname=${encodeURIComponent(firstName)}&lname=${encodeURIComponent(lastName)}&gaClientId=${encodeURIComponent(
          clientId ?? ''
        )}&gaUserId=${encodeURIComponent(email_sha256 ?? '')}&gaTrackId=${encodeURIComponent(gaTrackId ?? '')}`
      )

      if (!data.sf_miaw_token || !data.sf_miaw_uuid) {
        setChatFormDialog({
          message: 'Your information was sent successfully. A local expert will contact you soon.',
          showConfirmation: true
        })
      } else {
        onTransferSuccess({ ...data, firstName, lastName })
      }
      setWasFormSubmitted(true)

      try {
        const formDataToStore = {
          email: email,
          firstname: firstName,
          lastname: lastName,
          phone: phone
        }
        if (email_sha256) {
          formDataToStore.shaEmail = email_sha256
        }
        if (utils?.mergeFormResponseToLocalStorage) utils.mergeFormResponseToLocalStorage(formDataToStore)
      } catch (err) {}
    } catch (err) {
      setChatFormDialog({
        message: 'There was an issue with your request. Please try again later.',
        showConfirmation: true
      })
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

  // console.log('bypassLiveAgent:', bypassLiveAgent)

  if (bypassLiveAgent) {
    chatFormButtonText = 'Contact Me'
    chatFormMessage += 'Please share your contact information below and we will get back to you.'
  } else if (!isAgentAvailable) {
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

  if (chatFormDialog) {
    return (
      <div className={styles.submittingContainer}>
        <p className={styles.text}>{chatFormDialog.message}</p>
        {chatFormDialog?.isSending && <ThinkingIndicator classes={{ root: styles.thinkingIndicatorOverride }} />}
        {chatFormDialog?.showConfirmation && (
          <ActionButton onClick={onClose} ariaLabel='Close form'>
            OK
          </ActionButton>
        )}
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

      {isThinking && !bypassLiveAgent && (
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
