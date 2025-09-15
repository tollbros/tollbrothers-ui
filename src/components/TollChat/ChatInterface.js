'use client'

import React from 'react'
import styles from './ChatInterface.module.scss'
import { convertTimeStamp } from '../../../utils/chat/libs'
import Minus from '../../icons/Minus'
import CloseX from '../../icons/CloseX'
import ChatMessageText from './ChatMessageText'
import ChatMessageAttachment from './ChatMessageAttachment'
import ChatMessageRichLink from './ChatMessageRichLink'
import ChatInput from './ChatInput'

export const ChatInterface = ({
  showChatHeader,
  isMinimized,
  showChatButton,
  showTextChatOptions,
  unreadMessagesCount,
  showFormHandler,
  handleMinimize,
  chatPhoto,
  showTextChatOption,
  chatSms,
  hasAgentEngaged,
  handleConfirmationEnd,
  showWaitMessage,
  showConfirmationEndMessage,
  handleStay,
  handleEndChat,
  accessToken,
  conversationId,
  showForm,
  handleSubmit,
  formData,
  handleChange,
  systemMessage,
  messages,
  chatContainerRef,
  apiSfName,
  endPoint,
  setError,
  error
}) => {
  return (
    <div
      className={`${styles.chatWrapper} ${
        showChatHeader ? styles.chatPanelOpen : ''
      } ${isMinimized ? styles.isMinimized : ''}`}
    >
      {(showChatButton || isMinimized) && (
        <>
          {(showTextChatOptions || isMinimized) && (
            <div className={styles.textChatOptions}>
              {unreadMessagesCount?.count > 0 && (
                <div className={styles.unreadMessagesIndicator}>
                  {unreadMessagesCount.count}
                </div>
              )}
              <div className={styles.textChatWrapper}>
                <button
                  className={`${styles.chatButton} ${styles.textChatButtons}`}
                  onClick={!isMinimized ? showFormHandler : handleMinimize}
                >
                  <img
                    src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/chat.svg'
                    alt='chat'
                  />
                  Chat
                </button>
                {!isMinimized && (
                  <a
                    href={chatSms ? `sms:${chatSms}` : '#'}
                    className={`${styles.textButton} ${styles.textChatButtons}`}
                  >
                    <img
                      src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/sms.svg'
                      alt='chat'
                    />
                    Text
                  </a>
                )}
              </div>
            </div>
          )}

          <button
            className={styles.chatLaunch}
            onClick={!isMinimized ? showTextChatOption : handleMinimize}
          >
            <img
              className={styles.oscHead}
              src={
                chatPhoto ??
                'https://cdn.tollbrothers.com/images/osc/0053q00000B3pUhAAJ.jpg'
              }
              alt='osc'
              onError={(e) => {
                e.currentTarget.src =
                  'https://cdn.tollbrothers.com/images/osc/0053q00000B3pUhAAJ.jpg'
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
            {hasAgentEngaged && (
              <button onClick={() => handleMinimize()} type='button'>
                <Minus fill='#000' />
              </button>
            )}
            <button onClick={() => handleConfirmationEnd()} type='button'>
              <CloseX fill='#000' />
            </button>
          </div>
        </div>
      )}
      {showWaitMessage && !isMinimized && (
        <>
          <p className={styles.waitMessage}>
            Please wait while we connect you with a representative.
          </p>
          <div className={styles.loading}>
            <span />
            <span />
            <span />
          </div>
        </>
      )}
      {showConfirmationEndMessage && !isMinimized && (
        <div className={styles.confirmationEndMessage}>
          <p>Are you sure you want to leave this chat?</p>
          <div className={styles.buttonWrapper}>
            <button onClick={handleStay}>Stay</button>
            <button onClick={() => handleEndChat(accessToken, conversationId)}>
              Leave
            </button>
          </div>
        </div>
      )}
      {showForm && !isMinimized && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            required
            pattern='[A-Za-z\s]+'
            title='Name can only contain letters and spaces'
            placeholder='Full Name*'
            maxLength={123}
          />

          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            pattern='\S+@\S+\.\S+'
            required
            placeholder='Email*'
            maxLength={80}
          />

          <br />
          <p className={styles.privacyPolicy}>
            The information you provide will be used in accordance with our{' '}
            <a
              href='https://www.tollbrothers.com/privacy'
              target='_blank'
              rel='noreferrer'
            >
              Privacy Policy
            </a>
            .
          </p>

          <button type='submit'>Start Chat</button>
        </form>
      )}

      <div className={styles.messagesWrapper} ref={chatContainerRef}>
        {systemMessage && !isMinimized && (
          <p className={styles.persistentText}>{systemMessage}.</p>
        )}
        {!isMinimized && (
          <>
            {messages.map(
              (message, index) =>
                message.type === 'Message' &&
                !message.text?.includes('::System Message::') && (
                  <React.Fragment key={message.id}>
                    <div className={styles.timestamp}>
                      {convertTimeStamp(message.timestamp)}
                    </div>
                    {message.payload?.formatType === 'RichLink' && (
                      <>
                        {message.text && <ChatMessageText message={message} />}
                        <ChatMessageRichLink
                          richLink={message.payload}
                          leftAlign={
                            message?.role === 'Agent' ||
                            message?.role === 'System'
                          }
                        />
                      </>
                    )}
                    {message.payload?.formatType === 'Attachments' && (
                      <>
                        {message.text && <ChatMessageText message={message} />}
                        <ChatMessageAttachment
                          attachments={message?.payload?.attachments}
                          hasText={Boolean(message.text)}
                          leftAlign={message.role === 'Agent'}
                        />
                      </>
                    )}
                    {(message.payload?.formatType === 'Text' ||
                      message.payload?.formatType === 'Typing') && (
                      <ChatMessageText message={message} />
                    )}
                  </React.Fragment>
                )
            )}
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
    </div>
  )
}
