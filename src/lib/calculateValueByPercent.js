export const calculateValueByPercent = (percentage, value, toFixed = 2) => {
  const calculation = Math.round(((percentage / 100) * value).toFixed(toFixed))

  return calculation
}
