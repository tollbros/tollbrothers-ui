import React, { useState, useRef, useEffect } from 'react'

import { submitFeedback } from './utils/submitFeedback'
import { FeedbackCommentForm } from './FeedbackCommentForm'
import { CloseButton } from './CloseButton'

import styles from './MessageFeedback.module.scss'

const THUMBS_ICON = 'https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/thumbs-down-gray.svg'
const THUMBS_ICON_SELECTED = 'https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/thumbs-down-white.svg'

export const MessageFeedback = ({ msg, chatApiConfig, onChange = (msg, feedback) => null }) => {
  const [feedback, setFeedback] = useState(msg.feedback ?? null) // 'up', 'dn', or null
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)
  const [isCommentShowing, setIsCommentShowing] = useState(false)
  const [isCommentFading, setIsCommentFading] = useState(false)
  const commentFormRef = useRef(null)

  useEffect(() => {
    if (isCommentShowing && commentFormRef.current) {
      commentFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isCommentShowing])

  const handleFeedback = async (direction) => {
    setIsSubmitting(true)
    setFeedback(direction)
    setIsCommentShowing(true)
    const rating = direction === 'up' ? 1 : -1

    const payload = {
      session_id: msg.session_id,
      conversation_turn_id: msg.conversation_turn_id,
      rating: rating
    }

    try {
      await submitFeedback(payload, chatApiConfig)
    } catch (error) {
      console.error('Message feedback submission failed:', error)
    } finally {
      console.log('Feedback submitted:', payload)
      setIsSubmitting(false)
      onChange(msg, direction)
    }
  }

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return // Don't submit empty comments
    setIsCommentSubmitting(true)

    const rating = feedback === 'up' ? 1 : -1
    const payload = {
      session_id: msg.session_id,
      conversation_turn_id: msg.conversation_turn_id,
      rating: rating,
      ...(comment && { comment })
    }

    try {
      await submitFeedback(payload, chatApiConfig)
    } catch (error) {
      console.error('Message feedback submission failed:', error)
    } finally {
      console.log('Feedback submitted:', payload)
      setIsCommentSubmitting(false)
      setIsCommentFading(true)
    }
  }

  const handleCloseComment = () => {
    setIsCommentShowing(false)
    setIsCommentFading(false)
  }

  return (
    <div className={styles.root}>
      <div className={styles.messageFeedback}>
        <button
          className={`${styles.messageFeedbackButton} ${feedback === 'up' ? styles.selected : ''}`}
          type='button'
          aria-label='Thumbs up'
          disabled={isSubmitting || isCommentSubmitting || feedback === 'up'}
          onClick={() => handleFeedback('up')}
        >
          <img className={styles.thumbsUpIcon} src={feedback === 'up' ? THUMBS_ICON_SELECTED : THUMBS_ICON} alt='' />
        </button>
        <button
          className={`${styles.messageFeedbackButton} ${feedback === 'dn' ? styles.selected : ''}`}
          type='button'
          aria-label='Thumbs down'
          disabled={isSubmitting || isCommentSubmitting || feedback === 'dn'}
          onClick={() => handleFeedback('dn')}
        >
          <img src={feedback === 'dn' ? THUMBS_ICON_SELECTED : THUMBS_ICON} alt='' />
        </button>
      </div>
      {isCommentShowing && (
        <div
          ref={commentFormRef}
          className={`${styles.messageFeedbackComment} ${isCommentFading ? styles.fadeOut : ''}`}
          data-feedback-message-id={msg.id}
          onAnimationEnd={() => {
            setIsCommentFading(false)
            setIsCommentShowing(false)
          }}
        >
          <CloseButton className={styles.closeButton} onClick={handleCloseComment} ariaLabel='Close feedback comment' />
          <FeedbackCommentForm
            value={comment}
            onChange={(value) => setComment(value)}
            onSubmit={handleCommentSubmit}
            submitText={isCommentSubmitting ? 'Submitting...' : 'Submit'}
            disabled={isCommentSubmitting || isCommentFading || !comment.trim()}
            aria-label='Additional comments about this response'
            rows={2}
          />
        </div>
      )}
    </div>
  )
}
