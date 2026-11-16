import React from 'react'

import { GREEN_OSC_ICON, OSC_ICON } from './constants'

import styles from './FeedbackOSC.module.scss'

export const FeedbackOSC = ({ isOnline, chatPhoto, phone, showContactOptions = true, onAction = () => null }) => {
  const phoneHref = phone ? `tel:${phone.replace(/\D/g, '')}` : null
  const photo = isOnline ? chatPhoto : null
  const fallbackIcon = isOnline ? GREEN_OSC_ICON : OSC_ICON

  if (isOnline && !showContactOptions) return null

  return (
    <div className={styles.root}>
      <div className={styles.heading}>
        <span className={`${styles.iconWrapper} ${isOnline ? '' : styles.offline}`}>
          <img
            className={photo ? styles.chatPhoto : ''}
            src={photo ?? fallbackIcon}
            alt=''
            onError={(event) => {
              event.currentTarget.className = ''
              event.currentTarget.src = fallbackIcon
            }}
          />
        </span>
        <strong>
          Our Online Sales Consultants {isOnline ? 'are online and ready to help.' : 'are offline right now.'}
        </strong>
      </div>

      {!isOnline && (
        <p className={styles.description}>
          Our local experts can provide additional details. Share your contact information, and we will follow up with
          you.
        </p>
      )}

      {phoneHref && (
        <a className={styles.phone} href={phoneHref}>
          Call {phone}
        </a>
      )}

      <button className={styles.action} type='button' onClick={onAction}>
        {isOnline ? (
          <span aria-hidden='true'>●</span>
        ) : (
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            aria-hidden='true'
          >
            <rect x='3' y='5' width='18' height='14' rx='2' />
            <path d='m3 7 9 6 9-6' />
          </svg>
        )}
        {isOnline ? 'Chat with an OSC' : 'Contact Me'}
      </button>
    </div>
  )
}
