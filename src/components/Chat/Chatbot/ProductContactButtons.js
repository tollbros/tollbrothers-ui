import React from 'react'
import { OptionButton } from './OptionButton'

export const getProductContactActions = (product, utils) => {
  const isFuture = Boolean(product.isFuture || product.communityTypes?.includes('Future'))
  const { everyOptionSharedByEachCollection } = utils?.getAllCommunityOptions?.(product) || {}
  const vipSalesOnly = utils?.hasOption?.(everyOptionSharedByEachCollection, utils?.OPTIONS?.VIP_SALES_ONLY)

  const contact =
    !product.dcaDisclaimer && !isFuture ? { text: 'Contact Sales', hash: '#contact', panel: 'sales' } : null
  let primary

  if (product.dcaDisclaimer) {
    primary = { text: 'Contact Us', hash: '#contact', panel: 'sales' }
  } else if (product.salesOffice?.hideTour) {
    primary = { text: 'Talk to an Expert', hash: '#contact-email', panel: 'email' }
  } else if (isFuture) {
    primary = { text: vipSalesOnly ? 'Contact Sales' : 'Become a VIP', hash: '#join-vip', panel: 'vip' }
  } else {
    primary = {
      text: 'Schedule a Tour',
      hash: product.tour ? '#self-guided-tour' : '#appointment',
      panel: 'tour'
    }
  }

  return { contact, primary }
}

export const ProductContactButtons = ({
  product,
  utils,
  onMinimizeChat = () => null,
  clearFocusTrap = () => null,
  buttonClassName
}) => {
  if (!product?.salesOffice) return null

  const { contact, primary } = getProductContactActions(product, utils)
  const onActionClick = (action) => (e) => {
    onMinimizeChat()
    clearFocusTrap()

    const pathname = new URL(product.url, window.location.origin).pathname
    if (window.location.pathname !== pathname) return

    e.preventDefault()
    e.stopPropagation()
    if (!utils) return

    if (action.panel === 'sales') {
      utils.closeSalesPanel()
      utils.closeEmailPanel()
      utils.closeVIPPanel()
      utils.closeTourPanel()
      setTimeout(() => utils.openSalesPanel(), 350)
      return
    }

    if (action.panel === 'vip') utils.openVIPPanel()
    else if (action.panel === 'email') utils.openEmailPanel()
    else utils.openTourPanel()
    utils.closeSalesPanel()
  }

  const renderButton = (action) => (
    <OptionButton
      key={action.hash}
      classes={{ root: buttonClassName }}
      text={action.text}
      href={product.url + action.hash}
      isLink
      utils={utils}
      onClick={onActionClick(action)}
    />
  )

  return (
    <>
      {contact && renderButton(contact)}
      {renderButton(primary)}
    </>
  )
}
