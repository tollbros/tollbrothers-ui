import React from 'react'
import styles from './ChatForm.module.scss'

export const ChatForm = ({
  formData,
  setFormData,
  onSubmit,
  cta = 'Start Chat'
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    e.target.setCustomValidity('')
    setFormData({ ...formData, [name]: value })
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <input
        type='text'
        id='name'
        name='name'
        value={formData.name}
        onChange={handleChange}
        required
        pattern='[A-Za-z\s]+'
        title='Name can only contain letters and spaces'
        placeholder='Full Name*'
        maxLength={123}
        aria-label='full name'
      />
      <input
        type='email'
        id='email'
        name='email'
        value={formData.email}
        onChange={handleChange}
        pattern='\S+@\S+\.\S+'
        required
        placeholder='Email*'
        maxLength={80}
        aria-label='email address'
      />

      <div className={styles.agent}>
        <span className={styles.radioLabel}>Are you a Real Estate Agent?</span>
        <div className={styles.radioGroup}>
          <label>
            <input
              type='radio'
              id='chat-is-agent-yes'
              name='isAgent'
              value='1'
            />
            Yes
          </label>
          <label>
            <input
              type='radio'
              id='chat-is-agent-no'
              name='isAgent'
              value='0'
              defaultChecked
            />
            No
          </label>
        </div>
      </div>

      <br />
      <p className={styles.privacyPolicy}>
        The information you provide will be used in accordance with our{' '}
        <a
          href='https://www.tollbrothers.com/privacy'
          target='_blank'
          rel='noreferrer'
        >
          Privacy Policy
        </a>
        .
      </p>

      <button type='submit'>{cta}</button>
    </form>
  )
}
