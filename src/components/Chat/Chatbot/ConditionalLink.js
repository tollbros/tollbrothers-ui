import React from 'react'
import styles from './ConditionalLink.module.scss'

export const ConditionalLink = ({ href, utils, children }) => {
  const cleanHref = utils?.stripUrlDomain?.(href) || href
  const Link = utils?.Link
  return Link ? (
    <Link className={styles.link} href={cleanHref}>
      {children}
    </Link>
  ) : (
    children
  )
}
