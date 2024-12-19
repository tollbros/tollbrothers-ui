import React from 'react'

import styles from './ChatMessageMedia.module.scss'

const ChatMessageAttachment = ({ attachments, hasText, leftAlign }) => {
  const attachment = attachments?.[0]
  const isPDF = attachment?.name.endsWith('.pdf')

  if (!attachment) return null

  return (
    <a
      href={attachments?.[0]?.url}
      download
      className={`${styles.root} ${leftAlign ? styles.leftAlign : ''} ${
        hasText ? styles.withText : ''
      }`}
      title='Download attachment'
    >
      <div className={styles.attachmentImageWrapper}>
        <img
          src={
            isPDF
              ? 'https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/PDF.svg'
              : attachments[0]?.url
          }
          className={`${styles.attachmentThumbnail} ${isPDF ? styles.pdf : ''}`}
          alt='Attachment Thumbnail'
        />
      </div>
      <div className={styles.copyWrapper}>
        <p>{isPDF ? 'Download PDF' : 'Click to download'}</p>
        <img
          src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/svg/Download.svg'
          alt=''
        />
      </div>
    </a>
  )
}

export default ChatMessageAttachment
