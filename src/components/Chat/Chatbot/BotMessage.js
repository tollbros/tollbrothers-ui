import React from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './BotMessage.module.scss'
import { formatMessageLinks } from './utils/formatMessageLinks'

const urlTransform = (url) => {
  // Allow tel: and http(s): protocols
  if (url.startsWith('tel:') || url.startsWith('http:') || url.startsWith('https:')) {
    return url
  }
  return url
}

export const BotMessage = ({ message, component, outsideComponent }) => {
  const formattedMessage = message ? formatMessageLinks(message) : message

  const markdownComponents = {
    a: ({ node, href, children, ...props }) => {
      const actualHref = href || ''

      // Tel links should not open in new tab
      if (actualHref.startsWith('tel:')) {
        return (
          <a href={actualHref} {...props}>
            {children}
          </a>
        )
      }
      // All other links (http/https) open in new tab
      return (
        <a href={actualHref} target='_blank' rel='noopener noreferrer' {...props}>
          {children}
        </a>
      )
    }
  }

  return (
    // BotMessage.js
    <article className={styles.container} aria-label='AI Conceirge message'>
      <div className={styles.response}>
        <div className={styles.icon}>
          <img
            src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/chatbot-icon.svg'
            alt=''
            aria-hidden='true'
          />
        </div>
        {formattedMessage && (
          <div className={styles.text}>
            <ReactMarkdown components={markdownComponents} urlTransform={urlTransform}>
              {formattedMessage}
            </ReactMarkdown>
          </div>
        )}
        {component && <div className={styles.component}>{component}</div>}
      </div>
      {outsideComponent && <div className={styles.outsideComponent}>{outsideComponent}</div>}
    </article>
  )
}
