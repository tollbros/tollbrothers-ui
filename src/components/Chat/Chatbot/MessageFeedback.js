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
  const closeButtonRef = useRef(null)
  const wasKeyboardActivated = useRef(false)

  useEffect(() => {
    if (isCommentShowing && commentFormRef.current) {
      commentFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      if (closeButtonRef.current && wasKeyboardActivated.current) {
        setTimeout(() => closeButtonRef.current.focus(), 300)
      }
    }
  }, [isCommentShowing, feedback])

  const handleFeedback = async (event, direction) => {
    setIsCommentShowing(true)
    if (feedback === direction) return // Prevent resubmitting the same feedback

    wasKeyboardActivated.current = event.detail === 0
    setIsSubmitting(true)
    setFeedback(direction)

    const rating = direction === 'up' ? 1 : -1

    const payload = {
      session_id: msg.session_id,
      conversation_turn_id: msg.conversation_turn_id,
      rating: rating,
      feedback: comment ?? ''
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
      feedback: comment ?? ''
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
          disabled={isSubmitting || isCommentSubmitting}
          onClick={(e) => handleFeedback(e, 'up')}
        >
          <img className={styles.thumbsUpIcon} src={feedback === 'up' ? THUMBS_ICON_SELECTED : THUMBS_ICON} alt='' />
        </button>
        <button
          className={`${styles.messageFeedbackButton} ${feedback === 'dn' ? styles.selected : ''}`}
          type='button'
          aria-label='Thumbs down'
          disabled={isSubmitting || isCommentSubmitting}
          onClick={(e) => handleFeedback(e, 'dn')}
        >
          <img src={feedback === 'dn' ? THUMBS_ICON_SELECTED : THUMBS_ICON} alt='' />
        </button>
      </div>
      {isCommentShowing && (
        <div
          ref={commentFormRef}
          className={`${styles.messageFeedbackComment} ${isCommentFading ? styles.fadeOut : ''}`}
          role='region'
          aria-label='Feedback Comment Form'
          onAnimationEnd={() => {
            setIsCommentFading(false)
            setIsCommentShowing(false)
          }}
        >
          <CloseButton
            ref={closeButtonRef}
            className={styles.closeButton}
            onClick={handleCloseComment}
            ariaLabel='Close feedback comment form'
          />
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
