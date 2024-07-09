import React from 'react'
import MuiButton from '@mui/material/Button'

const Button = ({
  children,
  color = 'primary',
  variant = 'contained',
  disableElevation = true,
  onClick = () => {},
  ...rest
}) => {
  return (
    <MuiButton onClick={onClick} color={color} variant={variant} disableElevation={disableElevation} {...rest}>
      {children}
    </MuiButton>
  )
}

export default Button
