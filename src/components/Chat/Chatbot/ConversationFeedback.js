import React, { forwardRef, useState } from 'react'

import styles from './ConversationFeedback.module.scss'
import { StarRating } from './StarRating'
import { CloseButton } from './CloseButton'
import { submitFeedback } from './utils/submitFeedback'

export const ConversationFeedback = forwardRef(({ sessionId, chatApiConfig, onClose, classes = {} }, ref) => {
  const [rating, setRating] = useState(0)
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      return
    }

    const payload = {
      session_id: sessionId,
      session_rating: rating,
      ...(comments && { feedback: comments })
    }

    try {
      setIsSubmitting(true)
      await submitFeedback(payload, chatApiConfig)
    } catch (error) {
      console.error('Feedback submission failed:', error)
    } finally {
      onClose()
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={`${styles.root} ${classes.root ?? ''}`}
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      role='dialog'
      aria-modal='true'
      aria-labelledby='feedback-title'
      aria-describedby='feedback-description'
    >
      {onClose && <CloseButton className={styles.closeButton} onClick={onClose} ariaLabel='Close feedback' />}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h2 id='feedback-title'>How was your AI Concierge experience?</h2>
        </div>

        <div className={styles.inner}>
          <p id='feedback-description' className={styles.prompt}>
            Please rate your conversation with AI Concierge.
          </p>

          <StarRating value={rating} onChange={setRating} ariaLabel='Conversation rating' />

          <label htmlFor='feedback-comments' className={styles.comments}>
            <span>
              Additional Comments <em>(optional)</em>
            </span>
            <textarea
              id='feedback-comments'
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder='Tell us more about your experience...'
              rows={4}
              maxLength={1000}
              aria-label='Additional comments about your experience'
            />
          </label>
          <button
            className={styles.submit}
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            aria-label={rating === 0 ? 'Please select a rating before submitting' : 'Submit feedback'}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  )
})
