import React from 'react'

import { TollButton } from './TollButton'
import styles from './FavoritesSignIn.module.scss'

export const FavoritesSignIn = ({
  onSignInClick = () => null,
  classes = {}
}) => {
  return (
    <article className={`${styles.root} ${classes.root ?? ''}`}>
      <p>
        Start your new home journey off right with My Favorites. Simply register
        for an account and use My Favorites to:
      </p>

      <ul>
        <li>Save communities and home designs that inspire you</li>
        <li>Personalize your own dream home with interactive tools</li>
        <li>
          Keep track of every step of your journey from design selections to
          financing and more
        </li>
      </ul>

      <TollButton className={styles.signInbutton} onClick={onSignInClick}>
        Sign In
      </TollButton>

      <hr />

      <span className={styles.bottom}>
        Don't have an account?{' '}
        <button
          className={`${styles.createAccount} clear-styles`}
          onClick={onSignInClick}
        >
          Create an Account
        </button>
      </span>
    </article>
  )
}
