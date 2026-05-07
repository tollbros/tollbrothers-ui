import React, { forwardRef, useState } from 'react'

import styles from './ConversationFeedback.module.scss'
import { StarRating } from './StarRating'
import { OptionButton } from './OptionButton'
import { CloseButton } from './CloseButton'

export const ConversationFeedback = forwardRef(({ onSubmit, onClose, className = '' }, ref) => {
  const [rating, setRating] = useState(0)
  const [comments, setComments] = useState('')

  const handleSubmit = (e) => {
    // console.log(rating, 'hell')
    e.preventDefault()
    if (onSubmit) onSubmit({ rating, comments })
  }

  return (
    <div className={`${styles.root} ${className}`} ref={ref} onClick={(e) => e.stopPropagation()}>
      {onClose && <CloseButton className={styles.closeButton} onClick={onClose} ariaLabel='Close feedback' />}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h2>How was your AI Concierge experience?</h2>
        </div>

        <div className={styles.inner}>
          <p className={styles.prompt}>Please rate your conversation with AI Concierge.</p>

          <StarRating value={rating} onChange={setRating} ariaLabel='Conversation rating' />

          <label className={styles.comments}>
            <span>
              Additional Comments <em>(optional)</em>
            </span>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder='Tell us more about your experience...'
              rows={4}
            />
          </label>

          {/* <button className={styles.submit} type='submit'>
            Submit Feedback
          </button> */}

          <OptionButton classes={{ root: styles.submit }} text='Submit Feedback' onClick={handleSubmit} />
        </div>
      </form>
    </div>
  )
})
