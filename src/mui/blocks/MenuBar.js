import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Button from '../primitives/Button'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import ContactButtons from '../partials/ContactButtons'

const pages = [
  'Details',
  'Amenities',
  'Homes',
  'Gallery',
  'Availability',
  'Financing'
]

function ElevationScroll(props) {
  const { children, window } = props
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined
  })

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0
  })
}

const MenuBar = (props) => {
  return (
    <ElevationScroll {...props}>
      <AppBar
        position='sticky'
        sx={{
          backgroundColor: (theme) => theme.palette.background.grey
        }}
      >
        <Container maxWidth='xl'>
          <Toolbar disableGutters>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  sx={{
                    my: 2,
                    color: (theme) => theme.palette.text.primary,
                    display: 'block',
                    textTransform: 'capitalize',
                    fontWeight: '500',
                    padding: '0 1rem'
                  }}
                  variant='text'
                >
                  {page}
                </Button>
              ))}
            </Box>

            <ContactButtons />
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  )
}

export default MenuBar
