import React from 'react'
import MuiButton from '@mui/material/Button'

const Button = ({
  children,
  color = 'primary',
  variant = 'contained',
  onClick = () => {},
  ...rest
}) => {
  return (
    <MuiButton onClick={onClick} color={color} variant={variant} {...rest}>
      {children}
    </MuiButton>
  )
}

export default Button
