export const displayPricing = (priceData) => {
  const pricedFrom = priceData || 0
  const pricedFromFormatted = pricedFrom.toLocaleString('en-US')

  if (
    !pricedFromFormatted ||
    pricedFromFormatted === '0' ||
    pricedFromFormatted === 'null' ||
    priceData === 999999999999
  ) {
    return null // no breaking space
  }

  let moneySign = '$'

  if (Number.isNaN(parseInt(pricedFromFormatted))) {
    moneySign = ''
  }

  return `${moneySign}${pricedFromFormatted}`
}
