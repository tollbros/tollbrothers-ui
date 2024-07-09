import React from 'react'
import Grid from '@mui/material/Grid'
import Button from './Button'

const ButtonStickerSheet = () => {
  const variants = ['contained', 'outlined', 'text']
  const colors = [
    'primary',
    'secondary',
    'contrast',
    'success',
    'error',
    'info',
    'warning'
  ]
  const sizes = ['small', 'medium', 'large']

  const buttons = variants.reduce((acc, variant, index) => {
    const VariantButtons = () => (
      <Grid item xs={12}>
        <h2>{variant}</h2>
        {colors.map((color, index) => {
          return (
            <Grid container key={color + index}>
              {sizes.map((size) => (
                <Grid item xs={4} key={color + size}>
                  <Button variant={variant} color={color} size={size}>
                    {color} {size}
                  </Button>
                </Grid>
              ))}
            </Grid>
          )
        })}
      </Grid>
    )
    return [...acc, <VariantButtons key={variant + index} />]
  }, [])

  return (
    <Grid container gap={2}>
      {buttons}
    </Grid>
  )
}

export default ButtonStickerSheet
