import React from 'react'
import styles from './ConditionalLink.module.scss'

export const ConditionalLink = ({
  href,
  utils,
  className = '',
  target = '_self',
  onClick = () => null,
  children
}) => {
  const cleanHref = utils?.stripUrlDomain?.(href) || href
  const Link = utils?.Link
  const style = `${styles.link} ${className}`

  return Link ? (
    <Link className={style} href={cleanHref} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <a className={style} href={cleanHref} target={target} onClick={onClick}>
      {children}
    </a>
  )
}
