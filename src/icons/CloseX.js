import React from 'react'

const CloseX = ({ fill }) => {
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
        d='M9.99999 8.58579L1.41202 -0.00218201L-0.00219727 1.41203L8.58577 10L-0.00219727 18.588L1.41202 20.0022L9.99999 11.4142L18.588 20.0022L20.0022 18.588L11.4142 10L20.0022 1.41203L18.588 -0.00218201L9.99999 8.58579Z'
        fill='black'
      />
    </svg>
  )
}

export default CloseX
