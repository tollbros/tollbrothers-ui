import React from 'react'

import styles from './FeedbackCommentForm.module.scss'

export const FeedbackCommentForm = ({
  value,
  onChange,
  onSubmit,
  submitText = 'Submit',
  placeholder = 'Tell us more about your experience',
  ariaLabel = 'Additional comments',
  disabled = false,
  rows = 3,
  id = 'feedback-comments'
}) => {
  return (
    <div className={styles.root}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={1000}
        aria-label={ariaLabel}
      />
      <button type='button' onClick={onSubmit} disabled={disabled}>
        {submitText}
      </button>
    </div>
  )
}
