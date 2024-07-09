import React from 'react'
import MuiChip from '@mui/material/Chip'

const Chip = ({
  label = '',
  color = 'primary',
  variant = 'contained',
  onClick = () => {},
  ...rest
}) => {
  return (
    <MuiChip
      onClick={onClick}
      color={color}
      variant={variant}
      label={label}
      {...rest}
    />
  )
}

export default Chip
