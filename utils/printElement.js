const printElement = (pelm) => {
  if (!pelm) return

  pelm.classList.add('printable')

  let parent = pelm.parentElement

  while (parent && parent !== document.body) {
    const style = window.getComputedStyle(parent)
    const displayValue = style.display
    if (!parent.style.display && !parent.classList.contains('js-noprint')) {
      parent.style.setProperty('display', displayValue, 'important')
      parent.classList.add('js-clear-display-style')
    }
    parent = parent.parentElement
  }

  document.body.classList.add('print-mode')

  const cleanup = () => {
    document.body.classList.remove('print-mode')
    pelm.classList.remove('printable')

    document.querySelectorAll('.js-clear-display-style').forEach((el) => {
      el.classList.remove('js-clear-display-style')
      el.style.removeProperty('display')
    })

    window.removeEventListener('afterprint', cleanup)
  }

  window.addEventListener('afterprint', cleanup)

  setTimeout(() => {
    // sigh safari
    window.print()
  }, 200)
}

export { printElement }
