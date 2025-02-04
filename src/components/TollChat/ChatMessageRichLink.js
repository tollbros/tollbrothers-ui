import React from 'react'

import styles from './ChatMessageMedia.module.scss'

const ChatMessageRichLink = ({ richLink, leftAlign }) => {
  if (!richLink) return null

  return (
    <a
      href={richLink.linkItem?.url}
      className={`${styles.root} ${leftAlign ? styles.leftAlign : ''}`}
      title={richLink.linkItem?.titleItem?.title ?? 'Rich Link'}
      target={
        richLink.linkItem?.url?.includes('tollbrothers.com')
          ? '_self'
          : '_blank'
      }
      rel='noreferrer'
    >
      <div className={styles.attachmentImageWrapper}>
        <img
          className={`${styles.attachmentThumbnail}`}
          src={richLink.image?.assetUrl}
          alt='Rich Link Thumbnail'
        />
      </div>
      <div className={`${styles.copyWrapper} ${styles.column}`}>
        <p>{richLink.linkItem?.titleItem?.title}</p>
        <p>{richLink.linkItem?.url}</p>
      </div>
    </a>
  )
}

export default ChatMessageRichLink
