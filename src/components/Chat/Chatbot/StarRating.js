import React from 'react'
import styles from './StarRating.module.scss'

const Star = ({ fill = '#d8d8d8' }) => (
  <svg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
    <path
      fill={fill}
      d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
    />
  </svg>
)

export const StarRating = ({ value, onChange, ariaLabel = 'Rating' }) => {
  return (
    <div className={styles.rating}>
      <div className={styles.stars} role='group' aria-label={ariaLabel}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type='button'
            className={styles.star}
            onClick={() => onChange(rating)}
            aria-label={`${rating} star${rating > 1 ? 's' : ''}`}
            aria-pressed={rating <= value}
          >
            <Star fill={rating <= value ? '#0070cd' : '#d8d8d8'} />
          </button>
        ))}
      </div>
      <div className={styles.ratingLabels}>
        <span>Not helpful</span>
        <span>Excellent</span>
      </div>
    </div>
  )
}
