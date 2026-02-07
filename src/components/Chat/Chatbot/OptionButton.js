import React from 'react'
import styles from './OptionButton.module.scss'
import { ConditionalLink } from './ConditionalLink'

export const OptionButton = ({
  text,
  onClick = () => null,
  size = '',
  isLink = false,
  href,
  target,
  utils
}) => {
  const style = `${styles.option} ${styles[size] ?? ''}`

  if (isLink) {
    return (
      <ConditionalLink
        className={style}
        href={href}
        utils={utils}
        target={target}
        onClick={onClick}
      >
        {text}
      </ConditionalLink>
    )
  }

  return (
    <button className={style} onClick={onClick} type='button'>
      {text}
    </button>
  )
}
