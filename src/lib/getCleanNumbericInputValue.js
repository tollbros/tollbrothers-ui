export const getCleanNumbericInputValue = (
  value,
  removeStartingZero,
  allowDecimal = true
) => {
  let cleanValue = value?.replace(/[^0-9.]/g, '')

  if (!allowDecimal) {
    cleanValue = value?.replace(/[^0-9]/g, '')
  }

  if (
    removeStartingZero &&
    cleanValue?.length > 1 &&
    cleanValue.startsWith('0')
  ) {
    cleanValue = cleanValue.slice(1)
  }

  return cleanValue
}
