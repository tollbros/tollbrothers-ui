import React from 'react'
import MuiButton from '@mui/material/Button'

const Button = ({ children, ...rest }) => {
  return <MuiButton {...rest}>{children}</MuiButton>
}

export default Button
