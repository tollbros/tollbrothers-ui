'use client'

import React, { useRef, useState, useEffect } from 'react'

import { ChatOsc } from './ChatOsc'
import { fetchAvailability } from '../../../utils/chat/apis'

const getGaClientId = () => {
  const gaIds = { gaClientId: '', gaUserId: '', gaTrackId: '' }
  if (
    typeof window.ga !== 'undefined' &&
    typeof window.ga.getAll === 'function'
  ) {
    const gaTracker = window.ga.getAll()[0]
    const gaClientId = gaTracker.get('clientId')
    const gaUserId = gaTracker.get('userId')
    const gaTrackId = gaTracker.get('trackingId')

    if (typeof gaClientId !== 'undefined' && gaClientId !== '') {
      gaIds.gaClientId = gaClientId
    }

    if (typeof gaUserId !== 'undefined' && gaUserId !== '') {
      gaIds.gaUserId = gaUserId
    }

    if (typeof gaTrackId !== 'undefined' && gaTrackId !== '') {
      gaIds.gaTrackId = gaTrackId
    }
  }

  return gaIds
}

export const TollChat = ({
  availabilityAPI,
  endPoint,
  apiSfOrgId,
  apiSfName,
  disableFloatingChatButton = false,
  setChatStatus,
  chatStatus,
  chatRegion,
  setIsChatOpen = () => null,
  isChatOpen, // this is to open chat from a button in the parent app instead of a floating head
  chatSms,
  trackChatEvent = () => null,
  chatClickedEventString = 'chatClicked',
  chatStartedEventString = 'chatStarted'
}) => {
  const [showWaitMessage, setShowWaitMessage] = useState(false)
  const [systemMessage, setSystemMessage] = useState('') // system messages
  const [showChatHeader, setShowChatHeader] = useState(false)
  const [showChatButton, setShowChatButton] = useState(false)
  const [showActiveTyping, setShowActiveTyping] = useState(false)
  const [showTextChatOptions, setShowTextChatOptions] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [chatPhoto, setChatPhoto] = useState(null) // osc image
  const [callbackUrl, setCallbackUrl] = useState(null)
  const [isCurrentlyChatting, setIsCurrentlyChatting] = useState(false) // if therer is an active chat
  const [isChatAvailabilityChecked, setIsChatAvailabilityChecked] =
    useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    const offlineMessage =
      'Our apologies, but all members of our Online Sales Team are currently unavailable. Please try again later.'
    e.preventDefault()
    setError(null)
    setSystemMessage(null)
    setShowActiveTyping(false)

    const form = e.target
    const [firstName, ...lastNameParts] = form.name?.value?.trim().split(' ')
    const lastName = lastNameParts?.join(' ')

    if (
      !firstName ||
      !lastName ||
      firstName?.length < 2 ||
      lastName?.length < 2
    ) {
      form.name.setCustomValidity(
        'First and last name must both be at least 2 characters long.'
      )
      form.reportValidity()
      return false
    } else if (firstName && firstName.trim().length > 40) {
      form.name.setCustomValidity(
        'First name cannot be longer than 40 characters.'
      )
      form.reportValidity()
      return false
    } else if (lastName && lastName.trim().length > 80) {
      form.name.setCustomValidity(
        'Last name cannot be longer than 80 characters.'
      )
      form.reportValidity()
      return false
    }

    setShowWaitMessage(true)
    setShowForm(false)
    trackChatEvent(chatStartedEventString)

    try {
      const availability = await fetchAvailability(chatRegion, availabilityAPI)
      if (availability?.data?.payload?.length > 0) {
        const email = form.email?.value?.trim()
        const gaClientIds = getGaClientId()
        setCallbackUrl(
          `https://hello.tollbrothers.com/l/402642/2025-08-05/2chvs9x?email=${encodeURIComponent(
            email
          )}&fname=${encodeURIComponent(firstName)}&lname=${encodeURIComponent(
            lastName
          )}&gaClientId=${encodeURIComponent(
            gaClientIds.gaClientId
          )}&gaUserId=${encodeURIComponent(
            gaClientIds.gaUserId
          )}&gaTrackId=${encodeURIComponent(gaClientIds.gaTrackId)}`
        )

        setUserInfo({ firstName, lastName, email })
      } else {
        setShowForm(true)
        setShowWaitMessage(false)
        setError(offlineMessage)
      }
    } catch (error) {
      setShowForm(true)
      setShowWaitMessage(false)
      setError(offlineMessage)
    }
  }

  const showFormHandler = (trackEvent) => {
    if (trackEvent) trackChatEvent(chatClickedEventString)
    setIsChatOpen(true)
    setShowChatHeader(true)
    setShowForm(true)
    setShowChatButton(false)
  }

  useEffect(() => {
    async function getOscInfo() {
      try {
        const availability = await fetchAvailability(
          chatRegion,
          availabilityAPI
        )
        if (availability?.data?.payload?.length > 0) {
          setChatStatus('online')
          const index = Math.floor(
            Math.random() * availability.data.payload.length
          )
          if (!isCurrentlyChatting) {
            setChatPhoto(availability.data.payload[index]?.photo)
          }
        }
        setIsChatAvailabilityChecked(true)
      } catch (error) {
        setIsChatAvailabilityChecked(true)
        console.error('Error fetching osc data:', error)
      }
    }

    if (chatRegion) {
      getOscInfo()
    } else {
      // if no chatRegion (pages with no OSC) just set this to true.
      setIsChatAvailabilityChecked(true)
    }

    setChatStatus('offline')
  }, [chatRegion, availabilityAPI])

  return (
    <>
      <ChatOsc
        endPoint={endPoint}
        apiSfOrgId={apiSfOrgId}
        apiSfName={apiSfName}
        disableFloatingChatButton={disableFloatingChatButton}
        chatStatus={chatStatus}
        chatRegion={chatRegion}
        setIsChatOpen={setIsChatOpen}
        isChatOpen={isChatOpen}
        chatSms={chatSms}
        setShowChatHeader={setShowChatHeader}
        showChatHeader={showChatHeader}
        setShowChatButton={setShowChatButton}
        showChatButton={showChatButton}
        showFormHandler={showFormHandler}
        showWaitMessage={showWaitMessage}
        systemMessage={systemMessage}
        showActiveTyping={showActiveTyping}
        showForm={showForm}
        handleSubmit={handleSubmit}
        setChatPhoto={setChatPhoto}
        chatPhoto={chatPhoto}
        isCurrentlyChatting={isCurrentlyChatting}
        setIsCurrentlyChatting={setIsCurrentlyChatting}
        isChatAvailabilityChecked={isChatAvailabilityChecked}
        setShowForm={setShowForm}
        setShowWaitMessage={setShowWaitMessage}
        setSystemMessage={setSystemMessage}
        setShowActiveTyping={setShowActiveTyping}
        setShowTextChatOptions={setShowTextChatOptions}
        showTextChatOptions={showTextChatOptions}
        error={error}
        setError={setError}
        userInfo={userInfo}
      />
      {callbackUrl && (
        <iframe
          style={{ display: 'none', height: 0, width: 0, opacity: 0 }}
          src={callbackUrl}
        />
      )}
    </>
  )
}
