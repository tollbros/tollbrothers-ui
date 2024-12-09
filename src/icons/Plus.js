import React from 'react'

const Plus = ({ fill }) => {
  return (
    <svg
      fill={fill}
      style={{ width: '20', height: '20' }}
      viewBox='0 0 20 20'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11 0H8.99999V9H0V11H8.99999V20H11V11H20V9H11V0Z'
        fill='black'
      />
    </svg>
  )
}

export default Plus
