export const getQmiDateLabelText = ({ date, isComingSoon, utils }) => {
  let text = ''
  if (utils?.isMoveInReady?.(date)) {
    text = 'Move-In Ready'
  } else if (isComingSoon) {
    text = 'Coming Soon Quick Move-In'
  } else {
    text = `Quick Move-In ${utils?.getFormattedDate?.(date, utils) || ''}`
  }

  return text
}
