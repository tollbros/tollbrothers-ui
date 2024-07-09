import React from 'react'
import Grid from '@mui/material/Grid'
import * as styles from '@mui/material/styles'
import PaletteTokenTypes from './PaletteTokenTypes'

const Palette = () => {
  const theme = styles.useTheme()
  console.log('theme', theme)
  return (
    <Grid container spacing={2}>
      {Object.keys(theme.palette).map((key) => (
        <PaletteTokenTypes key={key} dataKey={key} data={theme.palette[key]} />
      ))}
    </Grid>
  )
}

export default Palette
