import React, { useEffect, useState } from 'react'
import styles from './ChatForm.module.scss'

export const ChatForm = ({
  formData,
  setFormData,
  onSubmit,
  cta = 'Start Chat',
  isShowPhoneInput = false,
  isShowAgentFields = false,
  disabled = false,
  isDisableLocalStorageContactInfo = false
}) => {
  const [isAgent, setIsAgent] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    e.target.setCustomValidity('')
    setFormData({ ...formData, [name]: value })
  }

  useEffect(() => {
    const storedUser = localStorage?.getItem('formResponse')
    if (storedUser && !isDisableLocalStorageContactInfo) {
      const storedUserData = JSON.parse(storedUser)

      let fullName = ''
      if (storedUserData?.firstname && storedUserData?.lastname) {
        fullName += storedUserData?.firstname + ` ${storedUserData?.lastname}`
      } else if (storedUserData?.firstname) {
        fullName += `${storedUserData?.firstname}`
      } else if (storedUserData?.lastname) {
        fullName += `${storedUserData?.lastname}`
      }

      const phone = storedUserData?.phone || storedUserData?.homephone || ''

      setFormData({
        name: fullName,
        email: storedUserData?.email ?? '',
        phone: phone?.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') ?? ''
      })
    }
  }, [isDisableLocalStorageContactInfo])

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <input
        type='text'
        id='chat-name'
        name='name'
        value={formData.name}
        onChange={handleChange}
        required
        pattern='[A-Za-z\s]+'
        title='Name can only contain letters and spaces'
        placeholder='Full Name*'
        maxLength={123}
        aria-label='full name'
        disabled={disabled}
      />
      <input
        type='email'
        id='chat-email'
        name='email'
        value={formData.email}
        onChange={handleChange}
        pattern='\S+@\S+\.\S+'
        required
        placeholder='Email*'
        maxLength={80}
        aria-label='email address'
        disabled={disabled}
      />
      {isShowPhoneInput && (
        <input
          type='tel'
          id='chat-phone'
          name='phone'
          value={formData.phone}
          onChange={handleChange}
          pattern='[0-9]{3}(-|)?[0-9]{3}(-|)?[0-9]{4}'
          title='Phone number should be in the format: 123-456-7890 or 1234567890'
          placeholder='Phone Number'
          minLength={10}
          aria-label='phone number'
          disabled={disabled}
        />
      )}

      <div className={styles.agent}>
        <span className={styles.radioLabel}>Are you a Real Estate Agent?</span>
        <div className={styles.radioGroup}>
          <label>
            <input
              type='radio'
              id='chat-is-agent-yes'
              name='isAgent'
              value='1'
              disabled={disabled}
              onChange={() => setIsAgent(true)}
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
              disabled={disabled}
              onChange={() => setIsAgent(false)}
            />
            No
          </label>
        </div>
      </div>

      {isShowAgentFields && isAgent && (
        <div className={styles.agentFields}>
          <input
            type='text'
            id='chat-brokerage'
            name='brokerage'
            value={formData.brokerage}
            onChange={handleChange}
            placeholder='Broker Firm*'
            aria-label='Broker Firm*'
            disabled={disabled}
            required
          />
          <input
            type='text'
            id='chat-brokerage-address'
            name='brokerageAddress'
            value={formData.brokerageAddress}
            onChange={handleChange}
            placeholder='Broker Address*'
            aria-label='Broker Address*'
            disabled={disabled}
            required
          />
          <input
            type='text'
            id='chat-brokerage-state'
            name='brokerageState'
            value={formData.brokerageState}
            onChange={handleChange}
            placeholder='Broker State*'
            aria-label='Broker State*'
            disabled={disabled}
            required
          />
          <input
            type='text'
            id='chat-brokerage-zip'
            name='brokerageZip'
            value={formData.brokerageZip}
            onChange={handleChange}
            placeholder='Broker Zip Code*'
            aria-label='Broker Zip Code*'
            disabled={disabled}
            required
          />
        </div>
      )}

      <p className={styles.privacyPolicy}>
        The information you provide will be used in accordance with our{' '}
        <a
          href='https://www.tollbrothers.com/privacy'
          target='_blank'
          rel='noreferrer'
          tabIndex={disabled ? -1 : undefined}
        >
          Privacy Policy
        </a>
        .
      </p>

      <button type='submit' disabled={disabled}>
        {cta}
      </button>
    </form>
  )
}
