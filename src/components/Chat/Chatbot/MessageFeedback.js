import React, { useState, useRef, useEffect } from 'react'

import { submitFeedback } from './utils/submitFeedback'
import { FeedbackCommentForm } from './FeedbackCommentForm'

import styles from './MessageFeedback.module.scss'

const THUMBS_ICON = 'https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/thumbs-down-gray.svg'
const THUMBS_ICON_SELECTED = 'https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/thumbs-down-white.svg'

export const MessageFeedback = ({ msg, chatApiConfig, onChange = (msg, feedback) => null }) => {
  const [feedback, setFeedback] = useState(msg.feedback ?? null) // 'up', 'dn', or null
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)
  const [isCommentShowing, setIsCommentShowing] = useState(true)
  const [isCommentFading, setIsCommentFading] = useState(false)
  const commentFormRef = useRef(null)

  useEffect(() => {
    if (feedback === 'dn' && isCommentShowing && commentFormRef.current) {
      commentFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [feedback, isCommentShowing])

  const handleFeedback = async (direction) => {
    setIsSubmitting(true)
    setFeedback(direction)
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

    const payload = {
      session_id: msg.session_id,
      conversation_turn_id: msg.conversation_turn_id,
      rating: -1,
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

  return (
    <div className={styles.root}>
      <div className={styles.messageFeedback}>
        <button
          className={`${styles.messageFeedbackButton} ${feedback === 'up' ? styles.selected : ''}`}
          type='button'
          aria-label='Thumbs up'
          disabled={isSubmitting || isCommentSubmitting}
          onClick={() => handleFeedback('up')}
        >
          <img className={styles.thumbsUpIcon} src={feedback === 'up' ? THUMBS_ICON_SELECTED : THUMBS_ICON} alt='' />
        </button>
        <button
          className={`${styles.messageFeedbackButton} ${feedback === 'dn' ? styles.selected : ''}`}
          type='button'
          aria-label='Thumbs down'
          disabled={isSubmitting || isCommentSubmitting}
          onClick={() => handleFeedback('dn')}
        >
          <img src={feedback === 'dn' ? THUMBS_ICON_SELECTED : THUMBS_ICON} alt='' />
        </button>
      </div>
      {feedback === 'dn' && isCommentShowing && (
        <div
          ref={commentFormRef}
          className={`${styles.messageFeedbackComment} ${isCommentFading ? styles.fadeOut : ''}`}
          data-feedback-message-id={msg.id}
          onAnimationEnd={() => {
            setIsCommentShowing(false)
          }}
        >
          <FeedbackCommentForm
            value={comment}
            onChange={(value) => setComment(value)}
            onSubmit={handleCommentSubmit}
            submitText={isCommentSubmitting ? 'Submitting...' : 'Submit'}
            disabled={isCommentSubmitting || isCommentFading || !comment.trim()}
            aria-label='Additional comments about this response'
          />
        </div>
      )}
    </div>
  )
}
