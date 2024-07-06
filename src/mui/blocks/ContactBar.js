import React from 'react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const ContactBar = ({
  primaryContactImage,
  primaryContactTitle,
  primaryContacts,
  primaryPhone,
  salesImage,
  salesTitle,
  salesStreet,
  salesLocation
}) => {

  return (
    <section style={{ width: '100%', height: 'auto' }}>
      <Grid
        sx={{
          backgroundColor: (theme) => theme.palette.secondary.main,
          padding: '20px 5% 70px 5%'
        }}
        container
      >
        <Grid item xs={12} sm={6}>
          <Grid container>
            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '1rem',
                color: (theme) => theme.palette.secondary.contrastText
              }}
            >
              <img
                alt={primaryContactTitle}
                style={{ width: '40px' }}
                src={primaryContactImage}
              />
              <Typography sx={{ fontWeight: '600' }}>
                {primaryContactTitle}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '1rem',
                color: (theme) => theme.palette.secondary.contrastText
              }}
            >
              <Typography>{primaryContacts}</Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '1rem',
                color: (theme) => theme.palette.secondary.contrastText
              }}
            >
              <Typography>{primaryPhone}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Grid container>
            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '1rem',
                color: (theme) => theme.palette.secondary.contrastText
              }}
            >
              <img
                alt={salesTitle}
                style={{ width: '40px' }}
                src={salesImage}
              />
              <Typography sx={{ fontWeight: '600' }}>{salesTitle}</Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '1rem',
                color: (theme) => theme.palette.secondary.contrastText
              }}
            >
              <Typography>{salesStreet}</Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '1rem',
                color: (theme) => theme.palette.secondary.contrastText
              }}
            >
              <Typography>{salesLocation}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </section>
  )
}

export default ContactBar
