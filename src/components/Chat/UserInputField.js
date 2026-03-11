import React from 'react'
import styles from './UserInputField.module.scss'

export const UserInputField = ({
  value,
  onChange,
  onKeyDown,
  onSend,
  placeholder = 'Type Here',
  id = 'chat-user-input',
  disabled = false
}) => {
  return (
    <div className={styles.inputContainer}>
      <textarea
        autoComplete='off'
        id={id}
        type='text'
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        aria-label={placeholder}
        rows={1}
        cols={50}
        disabled={disabled}
      />

      <button
        className={styles.sendButton}
        onClick={onSend}
        aria-label='Send message'
        type='button'
        disabled={disabled}
      >
        <img src='https://cdn.tollbrothers.com/sites/comtollbrotherswww/icons/up-arrow.svg' alt='' />
      </button>
    </div>
  )
}
