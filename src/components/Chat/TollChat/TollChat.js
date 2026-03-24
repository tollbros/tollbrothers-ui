'use client'

import React from 'react'

import styles from './TollChat.module.scss'
import ChatInput from './ChatInput'
import { ChatForm } from '../ChatForm'
import { LiveChatMessage } from './LiveChatMessage'
import { HeaderButtons } from '../HeaderButtons'
import { ConfirmationEndDialog } from '../ConfirmationEndDialog'
import { useTollLiveChat } from '../hooks/useTollLiveChat'
import { CHAT_FALLBACK_IMAGE } from '../Chatbot/constants'

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
  isChatOpen,
  chatSms,
  trackChatEvent = () => null,
  chatClickedEventString = 'chatClicked',
  chatStartedEventString = 'chatStarted',
  productCode,
  utils = {}
}) => {
  const {
    chatContainerRef,
    showChatButton,
    accessToken,
    messages,
    conversationId,
    showForm,
    showChatHeader,
    showTextChatOptions,
    showWaitMessage,
    showConfirmationEndMessage,
    formData,
    isMinimized,
    systemMessage,
    chatPhoto,
    error,
    hasAgentEngaged,
    callbackUrl,
    unreadMessagesCount,
    setFormData,
    setError,
    handleSubmit,
    showTextChatOption,
    showFormHandler,
    handleMinimize,
    handleConfirmationEnd,
    handleStay,
    handleEndChat
  } = useTollLiveChat({
    availabilityAPI,
    endPoint,
    apiSfOrgId,
    apiSfName,
    disableFloatingChatButton,
    setChatStatus,
    chatStatus,
    chatRegion,
    setIsChatOpen,
    isChatOpen,
    trackChatEvent,
    chatClickedEventString,
    chatStartedEventString,
    productCode,
    utils
  })

  return (
    <div
      className={`${styles.chatWrapper} ${showChatHeader ? styles.chatPanelOpen : ''} ${
        isMinimized ? styles.isMinimized : ''
      }`}
    >
      {(showChatButton || isMinimized) && (
        <>
          {(showTextChatOptions || isMinimized) && (
            <div className={styles.textChatOptions}>
              {unreadMessagesCount?.count > 0 && (
                <div className={styles.unreadMessagesIndicator}>{unreadMessagesCount.count}</div>
              )}
              <div className={styles.textChatWrapper}>
                <button
                  className={`${styles.chatButton} ${styles.textChatButtons}`}
                  onClick={!isMinimized ? () => showFormHandler(true) : handleMinimize}
                >
                  <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/chat.svg' alt='chat' />
                  Chat
                </button>
                {!isMinimized && (
                  <a
                    href={chatSms ? `sms:${chatSms}` : '#'}
                    className={`${styles.textButton} ${styles.textChatButtons}`}
                  >
                    <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/sms.svg' alt='chat' />
                    Text
                  </a>
                )}
              </div>
            </div>
          )}

          <button className={styles.chatLaunch} onClick={!isMinimized ? showTextChatOption : handleMinimize}>
            <img
              className={styles.oscHead}
              src={chatPhoto ?? CHAT_FALLBACK_IMAGE}
              alt='osc'
              onError={(e) => {
                e.currentTarget.src = CHAT_FALLBACK_IMAGE
              }}
            />

            {!showTextChatOptions && (
              <span>
                <img
                  className={styles.chatIcon}
                  src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/chat.svg'
                  alt='chat'
                />
              </span>
            )}
            {showTextChatOptions && (
              <span>
                <img
                  className={styles.closeIcon}
                  src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/close.svg'
                  alt='close'
                />
              </span>
            )}
          </button>
        </>
      )}
      {showChatHeader && !isMinimized && (
        <div className={styles.header}>
          <h2>Chat</h2>
          <div className={styles.panelControls}>
            <HeaderButtons
              onMinimize={handleMinimize}
              onClose={handleConfirmationEnd}
              isMinimizeHidden={!hasAgentEngaged}
            />
          </div>
        </div>
      )}
      {showWaitMessage && !isMinimized && (
        <>
          <p className={styles.waitMessage}>Please wait while we connect you with a local expert.</p>
          <div className={styles.loading}>
            <span />
            <span />
            <span />
          </div>
        </>
      )}
      {showConfirmationEndMessage && !isMinimized && (
        <ConfirmationEndDialog onStay={handleStay} onLeave={() => handleEndChat(accessToken, conversationId)} />
      )}
      {showForm && !isMinimized && (
        <div className={styles.formContainer}>
          <ChatForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} cta='Start Chat' />
        </div>
      )}

      {systemMessage && !isMinimized && showChatHeader && <p className={styles.persistentText}>{systemMessage}</p>}

      <div className={styles.messagesWrapper} ref={chatContainerRef}>
        {!isMinimized && (
          <>
            {messages
              .filter(
                (message) =>
                  message.type === 'Message' &&
                  !message.text?.includes('::System Message::') &&
                  !(message.text?.startsWith('/url') && message?.role === 'Agent')
              )
              .map((message) => (
                <LiveChatMessage key={message.id} message={message} />
              ))}
          </>
        )}
      </div>

      {conversationId && accessToken && !isMinimized && (
        <div className={styles.chatInputWrapper}>
          <ChatInput
            accessToken={accessToken}
            conversationId={conversationId}
            apiSfName={apiSfName}
            endPoint={endPoint}
            setError={setError}
          />
        </div>
      )}
      {error && <span className={styles.error}>{error}</span>}
      {callbackUrl && <iframe className={styles.callbackIframe} src={callbackUrl} />}
    </div>
  )
}
