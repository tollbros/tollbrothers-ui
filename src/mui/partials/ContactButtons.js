import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '../primitives/Button'

const ContactButtons = () => {
  return (
    <Box sx={{ flexGrow: 0, display: 'flex', gap: '1rem' }}>
      <Button color='contrast'>Contact Sales</Button>
      <Button>Schedule a Tour</Button>
    </Box>
  )
}

export default ContactButtons
