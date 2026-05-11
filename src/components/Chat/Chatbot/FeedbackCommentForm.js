import React from 'react'

import styles from './FeedbackCommentForm.module.scss'

export const FeedbackCommentForm = ({
  value,
  onChange,
  onSubmit,
  submitText = 'Submit',
  placeholder = 'Tell us more about your experience...',
  ariaLabel = 'Additional comments',
  disabled = false
}) => {
  return (
    <div className={styles.root}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={1000}
        aria-label={ariaLabel}
      />
      <button type='button' onClick={onSubmit} disabled={disabled}>
        {submitText}
      </button>
    </div>
  )
}
