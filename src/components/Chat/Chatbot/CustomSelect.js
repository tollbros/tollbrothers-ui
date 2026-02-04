import React from 'react'
import styles from './CustomSelect.module.scss'

export const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  ariaLabel,
  valueKey = 'value',
  labelKey = 'label'
}) => {
  return (
    <select
      className={styles.select}
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      <option value='' disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option[labelKey]} value={option[valueKey]}>
          {option[labelKey]}
        </option>
      ))}
    </select>
  )
}
