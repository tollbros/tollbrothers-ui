import React, { useState } from 'react'
import styles from './AmenitiesList.module.scss'

const MAX_VISIBLE_AMENITIES = 6

export const AmenitiesList = ({ amenities = [] }) => {
  const [showAll, setShowAll] = useState(false)

  if (!amenities?.length) return null

  const visibleAmenities = showAll
    ? amenities
    : amenities.slice(0, MAX_VISIBLE_AMENITIES)
  const hasMore = amenities.length > MAX_VISIBLE_AMENITIES
  const isOddCount = visibleAmenities.length % 2 !== 0

  return (
    <div className={styles.amenitiesSection}>
      <h3 className={styles.amenitiesTitle}>Amenities</h3>
      <ul
        className={`${styles.amenitiesGrid} ${
          isOddCount ? styles.oddCount : styles.evenCount
        }`}
      >
        {visibleAmenities.map((amenity, index) => (
          <li key={index} className={`${styles.amenityItem}`}>
            <img
              src={`https://cdn.tollbrothers.com/sites/comtollbrotherswww/amenities/${amenity?.icon}`}
              alt={amenity?.name || 'Amenity'}
            />
            <span>{amenity?.name}</span>
          </li>
        ))}
      </ul>
      {hasMore && !showAll && (
        <button
          className={styles.showMoreButton}
          onClick={() => setShowAll(!showAll)}
        >
          Show More ({amenities.length - MAX_VISIBLE_AMENITIES})
        </button>
      )}
    </div>
  )
}
