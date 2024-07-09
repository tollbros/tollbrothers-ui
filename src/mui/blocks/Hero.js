import * as React from 'react'
import Grid from '@mui/material/Grid'
import ContactButtons from '../partials/ContactButtons'

export default function Hero({
  img = 'https://cdn.tollbrothers.com/communities/masters/768/images-resized/Sterling_Grove_Clubhouse_Pool_2352_conversion1_920.jpg',
  logo = null,
  title = null,
  location = null,
  county = null,
  startingPrice = null,
  homeTypes = []
}) {
  return (
    <section style={{ width: '100%', height: '859px' }}>
      <Grid
        sx={{
          width: '100%',
          margin: 0,
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
        container
      >
        <Grid
          sx={{
            zIndex: 1,
            position: 'relative',
            height: '100%'
          }}
          item
          xs={12}
        >
          <div
            style={{
              position: 'absolute',
              zIndex: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,.3)'
            }}
          />
          <img
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            src={img}
            alt={title}
            loading='lazy'
          />
        </Grid>
        <Grid
          sx={{
            position: 'absolute',
            zIndex: 5,
            width: '100%',
            height: '100%',
            display: 'flex',
            margin: 0
          }}
          container
          spacing={2}
        >
          {logo && (
            <Grid
              sx={{
                height: 'auto',
                margin: 'auto',
                filter:
                  'grayscale(100%) invert(100%) drop-shadow(0 10px 11px rgba(0,0,0,.6))'
              }}
              xs={4}
            >
              <img alt={title} src={logo} />
            </Grid>
          )}
          <Grid
            sx={{
              position: 'absolute',
              zIndex: 5,
              display: 'flex',
              margin: 0,
              bottom: '25px',
              padding: '0 5%'
            }}
            container
            spacing={2}
          >
            <Grid
              xs={12}
              sm={6}
              sx={{
                color: (theme) => theme.palette.primary.contrastText
              }}
            >
              <div>{location}</div>
            </Grid>
            <Grid
              xs={12}
              sm={6}
              sx={{
                display: 'flex',
                width: '100%',
                alignItems: 'flex-end',
                justifyContent: 'flex-end'
              }}
            >
              <ContactButtons />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </section>
  )
}
