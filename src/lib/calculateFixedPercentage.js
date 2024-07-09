export const calculateFixedPercentage = (percentage, value, toFixed = 2) => {
  const calculation = (100 * (percentage / value)).toFixed(toFixed)
  return calculation
}
