import React, { useState } from 'react'

import { submitFeedback } from './utils/submitFeedback'
import { FeedbackCommentForm } from './FeedbackCommentForm'
import { FeedbackOSC } from './FeedbackOSC'

import styles from './MessageFeedback.module.scss'

const THUMBS_ICON = 'https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/thumbs-down-gray.svg'
const THUMBS_ICON_SELECTED = 'https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/thumbs-down-white.svg'

const FEEDBACK_REASONS = ["Didn't answer my question", 'Info looks wrong', 'Too slow', 'Something else']

const formatFeedback = (reason, comment) => [reason, comment].filter(Boolean).join(': ')

export const MessageFeedback = ({ msg, chatApiConfig, oscProps, onChange = (msg, feedback) => null }) => {
  const [feedback, setFeedback] = useState(msg.feedback ?? null) // 'up', 'dn', or null
  const [comment, setComment] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)
  const [isCommentShowing, setIsCommentShowing] = useState(false)
  const [isCommentSent, setIsCommentSent] = useState(false)

  const handleFeedback = async (direction) => {
    if (feedback === direction) return // Prevent resubmitting the same feedback

    setIsSubmitting(true)
    setFeedback(direction)
    setIsCommentSent(false)
    setReason('')
    setComment('')

    const payload = {
      session_id: msg.session_id,
      conversation_turn_id: msg.conversation_turn_id,
      rating: direction === 'up' ? 1 : -1,
      feedback: ''
    }

    try {
      await submitFeedback(payload, chatApiConfig)
    } catch (error) {
      console.error('Message feedback submission failed:', error)
    } finally {
      // console.log('Feedback submitted:', payload)
      setIsSubmitting(false)
      onChange(msg, direction)
    }
  }

  const handleReasonSelect = async (selectedReason) => {
    if (reason === selectedReason) return

    setReason(selectedReason)
    setIsSubmitting(true)

    const payload = {
      session_id: msg.session_id,
      conversation_turn_id: msg.conversation_turn_id,
      rating: -1,
      feedback: formatFeedback(selectedReason, isCommentSent ? comment : '')
    }

    try {
      await submitFeedback(payload, chatApiConfig)
    } catch (error) {
      console.error('Message feedback submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentSubmit = async () => {
    setIsCommentSubmitting(true)

    const rating = feedback === 'up' ? 1 : -1
    const payload = {
      session_id: msg.session_id,
      conversation_turn_id: msg.conversation_turn_id,
      rating: rating,
      feedback: formatFeedback(reason, comment)
    }

    try {
      await submitFeedback(payload, chatApiConfig)
      setIsCommentSent(true)
    } catch (error) {
      console.error('Message feedback submission failed:', error)
    } finally {
      // console.log('Feedback submitted:', payload)
      setIsCommentSubmitting(false)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.feedbackHeader}>
        <span className={styles.feedbackPrompt}>Was this helpful?</span>
        <div className={styles.messageFeedback}>
          <button
            className={`${styles.messageFeedbackButton} ${feedback === 'up' ? styles.selected : ''}`}
            type='button'
            aria-label='Thumbs up'
            aria-pressed={feedback === 'up'}
            disabled={isSubmitting || isCommentSubmitting}
            onClick={() => handleFeedback('up')}
          >
            <img className={styles.thumbsUpIcon} src={feedback === 'up' ? THUMBS_ICON_SELECTED : THUMBS_ICON} alt='' />
          </button>
          <button
            className={`${styles.messageFeedbackButton} ${feedback === 'dn' ? styles.selected : ''}`}
            type='button'
            aria-label='Thumbs down'
            aria-pressed={feedback === 'dn'}
            disabled={isSubmitting || isCommentSubmitting}
            onClick={() => handleFeedback('dn')}
          >
            <img src={feedback === 'dn' ? THUMBS_ICON_SELECTED : THUMBS_ICON} alt='' />
          </button>
        </div>
      </div>
      {feedback === 'up' && (
        <p className={styles.feedbackResponse}>
          <strong>Glad that Helped.</strong> Thanks for letting us know.
        </p>
      )}
      {feedback === 'dn' && (
        <>
          <fieldset className={styles.feedbackReasons}>
            <legend>What went wrong?</legend>
            <div className={styles.feedbackReasonOptions}>
              {FEEDBACK_REASONS.map((option) => (
                <button
                  key={option}
                  className={reason === option ? styles.selectedReason : ''}
                  type='button'
                  aria-pressed={reason === option}
                  disabled={isSubmitting || isCommentSubmitting}
                  onClick={() => handleReasonSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
          <FeedbackOSC {...oscProps} />
        </>
      )}
      {feedback && (
        <div className={styles.messageFeedbackComment}>
          {isCommentSent ? (
            <p className={styles.commentSent}>Thank you, your feedback was sent.</p>
          ) : (
            <>
              <button
                className={styles.commentToggle}
                type='button'
                aria-expanded={isCommentShowing}
                onClick={() => setIsCommentShowing(!isCommentShowing)}
              >
                <span>
                  Anything else? <small>(optional)</small>
                </span>
                <strong>{isCommentShowing ? 'Collapse' : 'Expand'}</strong>
              </button>
              {isCommentShowing && (
                <FeedbackCommentForm
                  value={comment}
                  onChange={(value) => setComment(value)}
                  onSubmit={handleCommentSubmit}
                  submitText={isCommentSubmitting ? 'Sending...' : 'Send'}
                  disabled={isCommentSubmitting}
                  placeholder='Tell us more about your experience (optional)'
                  aria-label='Additional comments about this response (optional)'
                  rows={2}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
