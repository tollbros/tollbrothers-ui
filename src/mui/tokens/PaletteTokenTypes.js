import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import React from 'react'

const PaletteTokenTypes = ({
  data,
  dataKey,
  numbersOnly = false,
  isDeep = false
}) => {
  switch (typeof data) {
    case 'string':
      if (data.startsWith('#') || data.startsWith('rgb')) {
        return (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {!isDeep && (
                <Grid item xs={12}>
                  <Typography variant='overline'>{dataKey}</Typography>
                </Grid>
              )}
              <Grid item xs={3}>
                <Box
                  sx={{
                    width: '100%',
                    height: '100px',
                    backgroundColor: data
                  }}
                />
              </Grid>
              <Grid item xs={9}>
                {isDeep && (
                  <pre>
                    <b>{dataKey}</b>
                  </pre>
                )}
                <pre>{data}</pre>
              </Grid>
            </Grid>
          </Grid>
        )
      }
      return (
        <Grid item xs={12}>
          <pre>
            <b>{dataKey}</b>
          </pre>
          <pre>{data}</pre>
        </Grid>
      )
    case 'object':
      if (Array.isArray(data)) {
        return (
          <Grid item xs={12}>
            <pre>{dataKey}</pre>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </Grid>
        )
      }
      return (
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='overline'>{dataKey}</Typography>
            </Grid>
            <Grid item xs={12}>
              {Object.keys(data).map((key) => (
                <PaletteTokenTypes
                  key={key}
                  dataKey={key}
                  data={data[key]}
                  isDeep
                />
              ))}
            </Grid>
          </Grid>
        </Grid>
      )
    case 'number':
      if (!numbersOnly) {
        return null
      }
      return (
        <Grid item xs={12}>
          <pre>{dataKey}</pre>
          <pre>{data}</pre>
        </Grid>
      )
    case 'function': {
      return null
    }
    default:
      return (
        <Grid item xs={12}>
          <pre>{typeof data}</pre>
          <pre>{dataKey}</pre>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </Grid>
      )
  }
}

export default PaletteTokenTypes
