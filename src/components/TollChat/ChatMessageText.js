import React from 'react'

import styles from './ChatMessageText.module.scss'

const ChatMessageText = ({ message }) => {
  return (
    <div
      className={`${styles.messageWrapper}  ${
        message?.role === 'Agent' || message?.role === 'System'
          ? styles.agent
          : styles.guest
      } ${
        message.payload.formatType === 'Typing' ? styles.typingIndicator : ''
      }`}
    >
      <>
        {message.image && (
          <img
            src={message.image}
            width={30}
            height={30}
            alt='Agent Thumbnail'
            onError={(e) => {
              e.currentTarget.src =
                'https://cdn.tollbrothers.com/images/osc/0053q00000B3pUhAAJ.jpg'
            }}
          />
        )}
        <p className={`${styles.message}`}>{message.text}</p>
      </>
    </div>
  )
}

export default ChatMessageText
