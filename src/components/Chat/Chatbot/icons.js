import React from 'react'

export const ZoomInIcon = (props) => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 16 16'
    fill='none'
    aria-hidden='true'
    {...props}
  >
    <path
      d='M8 3v10M3 8h10'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
)

export const ZoomOutIcon = (props) => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 16 16'
    fill='none'
    aria-hidden='true'
    {...props}
  >
    <path
      d='M3 8h10'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
)

export const ResetZoomIcon = (props) => (
  <svg width='16px' height='16px' viewBox='0 0 21 21'>
    <g
      fill='none'
      fillRule='evenodd'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      transform='matrix(0 1 1 0 2.5 2.5)'
    >
      <path
        strokeWidth='2'
        d='m3.98652376 1.07807068c-2.38377179 1.38514556-3.98652376 3.96636605-3.98652376 6.92192932 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8'
      />

      <path strokeWidth='2' d='m4 1v4h-4' transform='matrix(1 0 0 -1 0 6)' />
    </g>
  </svg>
)
