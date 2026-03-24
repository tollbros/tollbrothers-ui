import React from 'react'

import styles from './LiveChatMessage.module.scss'
import { convertTimeStamp } from '../../../../utils/chat/libs'
import ChatMessageText from './ChatMessageText'
import ChatMessageAttachment from './ChatMessageAttachment'
import ChatMessageRichLink from './ChatMessageRichLink'

export const LiveChatMessage = ({ message }) => {
  const formatType = message.payload?.formatType
  const isAgentOrSystem = message?.role === 'Agent' || message?.role === 'System'

  return (
    <>
      <div className={styles.timestamp}>{convertTimeStamp(message.timestamp)}</div>
      {formatType === 'RichLink' && (
        <>
          {message.text && <ChatMessageText message={message} />}
          <ChatMessageRichLink richLink={message.payload} leftAlign={isAgentOrSystem} />
        </>
      )}
      {formatType === 'Attachments' && (
        <>
          {message.text && <ChatMessageText message={message} />}
          <ChatMessageAttachment
            attachments={message?.payload?.attachments}
            hasText={Boolean(message.text)}
            leftAlign={message.role === 'Agent'}
          />
        </>
      )}
      {(formatType === 'Text' || formatType === 'Typing') && <ChatMessageText message={message} />}
    </>
  )
}
