import React, { forwardRef, useState, useEffect } from 'react'

import styles from './ConversationFeedback.module.scss'
import { StarRating } from './StarRating'
import { CloseButton } from './CloseButton'
import { submitFeedback } from './utils/submitFeedback'

export const ConversationFeedback = forwardRef(
  ({ sessionId, chatApiConfig, onClose = () => null, classes = {} }, ref) => {
    const [rating, setRating] = useState(0)
    const [comments, setComments] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
      if (submitted) {
        const timer = setTimeout(() => {
          onClose()
        }, 6000)

        return () => clearTimeout(timer)
      }
    }, [submitted])

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
        setSubmitted(true)
      } catch (error) {
        console.error('Feedback submission failed:', error)
        onClose()
      } finally {
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
        {submitted ? (
          <div className={styles.thankYou}>
            <div className={styles.header}>
              <h2 id='feedback-title'>Thank You!</h2>
            </div>
            <div className={styles.inner}>
              <p className={styles.description} id='feedback-description'>
                Your feedback has been submitted successfully. We appreciate your input!
              </p>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.header}>
              <h2 id='feedback-title'>How was your AI Concierge experience?</h2>
            </div>

            <div className={styles.inner}>
              <p className={styles.description} id='feedback-description'>
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
        )}
      </div>
    )
  }
)
