import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '../primitives/Button'

const ContactButtons = () => {
  return (
    <Box sx={{ flexGrow: 0, display: 'flex', gap: '1rem' }}>
      <Button
        sx={{
          textTransform: 'none',
          fontWeight: '600',
          backgroundColor: (theme) => theme.palette.background.default,
          color: (theme) => theme.palette.primary.main,
          '&:hover': {
            backgroundColor: (theme) => theme.palette.background.default
          }
        }}
      >
        Contact Sales
      </Button>
      <Button sx={{ textTransform: 'none', fontWeight: '600' }}>
        Schedule a Tour
      </Button>
    </Box>
  )
}

export default ContactButtons
