import React from 'react'
import { OptionButton } from './OptionButton'
import styles from './OptionsList.module.scss'

export const OptionsList = ({ options, onOptionSelect }) => {
  return (
    <div className={styles.optionsContainer}>
      {options.map((option) => (
        <OptionButton
          key={option.id}
          text={option.text}
          onClick={() => onOptionSelect(option)}
          size='lg'
        />
      ))}
    </div>
  )
}
