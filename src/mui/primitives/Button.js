import React from 'react'
import MuiButton from '@mui/material/Button'
import grey from '@mui/material/colors/grey'

const Button = ({
  children,
  color = 'primary',
  variant = 'contained',
  disableElevation = true,
  onClick = () => {},
  sx: overrideSx,
  ...rest
}) => {
  let sx = null
  const isCustomColor = ['contrast'].includes(color)
  if (color === 'contrast') {
    sx = {
      backgroundColor: (theme) => theme.palette.primary.contrastText,
      color: (theme) => theme.palette.primary.main,
      '&:hover': {
        backgroundColor: (theme) => grey[100]
      }
    }
  }
  if (overrideSx) {
    sx = { ...sx, ...overrideSx }
  }
  if (sx) {
    rest.sx = sx
  }
  return (
    <MuiButton
      onClick={onClick}
      color={isCustomColor ? 'primary' : color}
      variant={variant}
      disableElevation={disableElevation}
      {...rest}
    >
      {children}
    </MuiButton>
  )
}

export default Button
