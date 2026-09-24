export const calculateFixedPercentage = (percentage, value, toFixed = 2) => {
  const calc = (100 * (percentage / value)).toFixed(toFixed)
  return calc
}
