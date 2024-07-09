import React from 'react'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import Button from '../primitives/Button'

export default function CommunityOverview({
  overview,
  overviewGallery = [],
  communityTypes,
  homeTypes,
  title,
  bulletPoints = [],
  eventLink = '',
  eventText,
  socialMedia,
  qmis = [],
  communities,
  communityName,
  eventData,
  communityId,
  showRenderOverlay,
  options = [],
  rows = []
}) {
  return (
    <Grid
      container
      component='section'
      direction='column'
      alignItems='center'
      justifyContent='center'
      pt='60px'
    >
      <Grid
        container
        component='aside'
        direction='column'
        alignItems='center'
        justifyContent='center'
        gap={3}
        sx={{
          width: '90%',
          maxWidth: '872px'
        }}
      >
        <Grid item xs={12}>
          <Typography align='center' variant='overline' component='h1'>
            Sterling Grove
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography align='center' variant='h3'>
            Home Starts Here
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography align='center' variant='subtitle2'>
            Golf, Amenities/Resort Community
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography align='center' component='p'>
            Awarded 2023 Master Plan Community of the Year, Sterling Grove is an
            all-ages resort-style community showcasing new homes in the growing
            city of Surprise, Arizona, featuring single-family and 55+
            active-adult collections with a large private clubhouse, spectacular
            resort-style amenities, and Arizona’s newest championship golf
            course.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <section>
            <Typography align='center' component='p'>
              Master Plan Community Including 6 Collections
            </Typography>
            <TableContainer component='article'>
              <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.name}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell component='th' scope='row'>
                        {row.name}
                      </TableCell>
                      <TableCell align='right'>{row.homeType}</TableCell>
                      <TableCell align='right'>{row.sqft}</TableCell>
                      <TableCell align='right'>{row.pricedFrom}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </section>
        </Grid>
        <Grid item xs={12}>
          <Button>{qmis.length} Quick Move-In Homes Available</Button>
        </Grid>
      </Grid>
    </Grid>
  )
}
