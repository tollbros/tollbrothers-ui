import * as React from 'react'
import MuiCard from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Button from '../primitives/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'

export default function Card({
  title = 'Beacon Estrella',
  pricedFrom = '$5,000,000',
  location = 'Goodyear, AZ',
  county = 'Maricopa County',
  communityType = 'Active Adult',
  homeType = 'Single Family',
  squareFootage = '1,500 - 3,000',
  bedrooms = '2 - 4',
  bathrooms = '2 - 3',
  garages = '2 - 3',
  linkText = 'View Community',
  ctaText = 'Schedule a Tour',
  image = 'https://cdn.tollbrothers.com/communities/13479/images-resized/Beacon_in_Estrella_Peletier_Patio_1428_CC_RET_RGB_920.jpg'
}) {
  return (
    <MuiCard sx={{ maxWidth: 345 }}>
      <CardMedia sx={{ height: 225 }} image={image} title={title} />
      <CardContent>
        <Grid container spacing={1}>
          <Grid xs={9}>
            <Typography gutterBottom variant='h3' component='div'>
              {title}
            </Typography>
          </Grid>
          <Grid xs={3}>
            <Typography variant='body2' color='text.secondary'>
              Priced at
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {pricedFrom}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Button variant='outlined' size='small'>
          {linkText}
        </Button>
        <Button size='small'>{ctaText}</Button>
      </CardActions>
    </MuiCard>
  )
}
