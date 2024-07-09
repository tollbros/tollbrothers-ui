import Grid from '@mui/material/Grid'
import Button from '../primitives/Button'
import Typography from '@mui/material/Typography'
import React from 'react'

const createRow = ({
  name,
  isActiveCommunity,
  homeType,
  sqft,
  pricedFrom,
  onNameClick
}) => {
  return {
    name: (
      <Grid container direction='column'>
        <Grid item component='span'>
          <Button onClick={onNameClick} variant='text' p={0}>
            {name}
          </Button>
        </Grid>
        {isActiveCommunity && (
          <Grid item component='span'>
            <span>Also Available 55+</span>
          </Grid>
        )}
      </Grid>
    ),
    homeType,
    sqft,
    pricedFrom: (
      <Grid container direction='column'>
        <Grid item component='span'>
          <Typography variant='subtitle2'>Priced From</Typography>
        </Grid>
        <Grid item component='span'>
          <span>{pricedFrom}</span>
        </Grid>
      </Grid>
    )
  }
}

const rows = [
  createRow({
    name: 'Villa Collection',
    isActiveCommunity: false,
    homeType: 'Condo',
    sqft: '1285-2142+ sq ft',
    pricedFrom: '$480,995',
    onNameClick: () => console.log('Villa Collection')
  }),
  createRow({
    name: 'Arlington Collection',
    isActiveCommunity: true,
    homeType: 'Single Family',
    sqft: '1520-3182+ sq ft',
    pricedFrom: '$555,995',
    onNameClick: () => console.log('Arlington Collection')
  }),
  createRow({
    name: 'Concord Collection',
    isActiveCommunity: false,
    homeType: 'Single Family',
    sqft: '2220-3741+ sq ft',
    pricedFrom: '$685,995',
    onNameClick: () => console.log('Concord Collection')
  }),
  createRow({
    name: 'Sonoma Collection',
    isActiveCommunity: false,
    homeType: 'Single Family',
    sqft: '1913-4197+ sq ft',
    pricedFrom: '$745,995',
    onNameClick: () => console.log('Sonoma Collection')
  }),
  createRow({
    name: 'Pasadena Collection',
    isActiveCommunity: false,
    homeType: 'Single Family',
    sqft: '3460-4126+ sq ft',
    pricedFrom: '$1,170,995',
    onNameClick: () => console.log('Pasadena Collection')
  })
]

const data = {
  rows
}

export default data
