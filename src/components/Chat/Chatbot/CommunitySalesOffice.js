import React, { useState } from 'react'
import styles from './CommunitySalesOffice.module.scss'
import { ProductContactButtons } from './ProductContactButtons'
import { HOME_ICON, MAP_PIN_ICON, WALK_IN_ICON, OSC_ICON } from './constants'

const phoneLink = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`

export const getVisitSalesOffices = (product) => {
  const candidates = product?.isMaster && product.communities?.length ? product.communities : [product]
  const officesByAddress = new Map()
  candidates.forEach((candidate, index) => {
    const office = candidate?.salesOffice
    if (!office || office.hideSalesOffice) return

    const address = [office.street, office.city, office.state, office.zip].filter(Boolean).join('|').toLowerCase()
    const key = address || (office.lat && office.lon ? `${office.lat}|${office.lon}` : candidate.communityId || index)
    const name = candidate.cleanName || candidate.name
    if (officesByAddress.has(key)) {
      if (name) officesByAddress.get(key).collectionNames.push(name)
    } else {
      officesByAddress.set(key, { ...candidate, collectionNames: name ? [name] : [] })
    }
  })
  const salesOffices = [...officesByAddress.values()]

  if (product?.isMaster && salesOffices.length === 0 && product.salesOffice && !product.salesOffice.hideSalesOffice) {
    salesOffices.push(product)
  }

  return salesOffices
}

const SalesOfficeLocation = ({ product, utils, showName, futureCommunity }) => {
  const office = product.salesOffice
  const collectionNames = showName ? [...new Set(product.collectionNames || [product.cleanName || product.name])] : []
  const isFuture = Boolean(futureCommunity || product.isFuture || product.communityTypes?.includes('Future'))
  const { options } = utils?.getAllCommunityOptions?.(product) || {}
  const showGeoLocation = utils?.hasOption?.(options, utils?.OPTIONS?.GEO_LOCATION_ENABLED)
  const mapLink = utils?.useMapLink?.({
    lat: office?.lat,
    lon: office?.lon,
    salesOffice: { state: office?.state, street: office?.street, city: office?.city, zip: office?.zip },
    showGeoLocation
  })
  const street = office?.street || (isFuture ? product.street : '')
  const city = office?.city || (isFuture ? product.city : '')
  const state = office?.state || (isFuture ? product.state : '')
  const zip = office?.zip || (isFuture ? product.zip : '')
  const cityStateZip = `${[city, state].filter(Boolean).join(', ')}${zip ? ` ${zip}` : ''}`.trim()
  const addressLines = [street, cityStateZip].filter(Boolean)
  const onSitePhone = office?.salesOfficePhone || office?.salesPeople?.find((person) => person.phone)?.phone

  return (
    <div className={styles.location}>
      {collectionNames.length > 0 && <strong className={styles.locationName}>{collectionNames.join(', ')}</strong>}
      {(addressLines.length > 0 || (onSitePhone && !isFuture)) && (
        <div className={styles.detail}>
          {addressLines.length > 0 && <img className={styles.detailIcon} src={MAP_PIN_ICON} alt='' />}
          <div>
            {addressLines.length > 0 && (
              <strong>
                {isFuture
                  ? 'Future Location'
                  : office?.salesOfficeOffsite
                  ? 'Sales Center (Offsite sales center)'
                  : 'Sales Center'}
              </strong>
            )}
            {addressLines.length > 0 && mapLink && !isFuture && !office?.hideDirections ? (
              <a
                className={styles.addressLink}
                href={mapLink}
                target='_blank'
                rel='noopener noreferrer'
                onClick={() => {
                  if (utils?.dataLayerPush) {
                    utils.dataLayerPush({ event: 'directions-event', variant: 'chatbot' })
                  }
                }}
              >
                {addressLines.map((line, index) => (
                  <span key={line} className={styles.addressLine}>
                    {line}
                    {index === addressLines.length - 1 && (
                      <svg
                        className={styles.externalLinkIcon}
                        width='12'
                        height='12'
                        viewBox='0 0 16 16'
                        fill='none'
                        aria-hidden='true'
                      >
                        <path
                          d='M8.5 2.5H13.5V7.5M13.5 2.5L7 9M12.5 9V12.5C12.5 13.0523 12.0523 13.5 11.5 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V4.5C2.5 3.94772 2.94772 3.5 3.5 3.5H7'
                          stroke='currentColor'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    )}
                  </span>
                ))}
              </a>
            ) : addressLines.length > 0 ? (
              <span>
                {addressLines.map((line) => (
                  <span key={line} className={styles.addressLine}>
                    {line}
                  </span>
                ))}
              </span>
            ) : null}
            {onSitePhone && !isFuture && (
              <a className={styles.addressPhone} href={phoneLink(onSitePhone)}>
                {onSitePhone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const CommunitySalesOffice = ({
  product,
  titleName = product.name,
  utils,
  onMinimizeChat = () => null,
  clearFocusTrap = () => null
}) => {
  const [showWeeklyHours, setShowWeeklyHours] = useState(false)
  const salesOffices = getVisitSalesOffices(product)
  const visitProduct =
    product?.isMaster && product.salesOffice && !product.salesOffice.hideSalesOffice ? product : salesOffices[0]
  if (!visitProduct) return null

  const office = visitProduct.salesOffice
  const isFuture = Boolean(visitProduct.isFuture || visitProduct.communityTypes?.includes('Future'))
  const productIsFuture = Boolean(product.isFuture || product.communityTypes?.includes('Future'))
  const isUrban = product.communityTypes?.includes('Urban')
  const salesTeamTitle = product.dcaDisclaimer ? 'Team' : isUrban ? 'Onsite Sales Team' : 'Online Sales Team'

  const operatingHours = !isFuture && office?.showHours ? office.operatingHours || [] : []
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayIndex = new Date().getDay()
  const todayEntry = operatingHours.find((entry) => entry.fullDay === dayNames[todayIndex])
  const todayHours = todayEntry?.timeString
  const tomorrowHours = operatingHours.find((entry) => entry.fullDay === dayNames[(todayIndex + 1) % 7])?.timeString
  const isClosedToday = Boolean(
    office?.showHours && operatingHours.length > 0 && (!todayHours || /closed/i.test(todayHours))
  )
  const appointmentOnly = Boolean(
    office?.byAppointmentOnly || todayEntry?.appointmentOnly || /appointment/i.test(todayHours || '')
  )
  const todayStatus = isClosedToday
    ? 'Closed today'
    : appointmentOnly
    ? `Today ${todayHours}`
    : `Open today ${todayHours}`
  const weeklyHours = operatingHours.map((entry) => ({ day: entry.day || entry.fullDay, hours: entry.timeString }))
  const { communityModels = [] } = utils?.buildHomeArrays?.(visitProduct?.homes, visitProduct.options) || {}
  const decoratedModels = visitProduct?.commPlanID
    ? []
    : communityModels
        .filter(
          (home) =>
            home.decorated === true || String(home.decorated).toLowerCase() === 'y' || home.isDecoratedModel === true
        )
        .map((home) => home.name)
        .filter(Boolean)
  const oscPhones = [
    ...new Set(
      [visitProduct, ...salesOffices].flatMap((location) =>
        (location.salesOffice?.onlineConcierge || []).map((person) => person.phone)
      )
    )
  ].filter(Boolean)

  return (
    <section className={styles.root} aria-label={isFuture ? 'Future community location' : 'Visit the sales center'}>
      {/* <p className={styles.intro}>
        {appointmentOnly
          ? 'Please schedule an appointment before visiting.'
          : 'Walk-ins are welcome during sales center hours.'}
      </p> */}
      {titleName && <h3 className={styles.title}>{productIsFuture ? titleName : `Visit ${titleName}`}</h3>}
      {(todayHours || isClosedToday) && (
        <p
          className={`${styles.today} ${
            isClosedToday ? styles.todayClosed : appointmentOnly ? styles.todayAppointment : ''
          }`}
        >
          {todayStatus}
        </p>
      )}
      {tomorrowHours && <p className={styles.tomorrow}>Tomorrow {tomorrowHours}</p>}
      {!isFuture && appointmentOnly && !isClosedToday && !/appointment/i.test(todayHours || '') && (
        <p className={styles.appointment}>By appointment only</p>
      )}

      {weeklyHours.length > 0 && (
        <div className={styles.hoursSection}>
          <button
            type='button'
            className={styles.hoursToggle}
            aria-expanded={showWeeklyHours}
            onClick={() => setShowWeeklyHours((current) => !current)}
          >
            <span>View weekly hours</span>
            <svg
              className={`${styles.hoursChevron} ${showWeeklyHours ? styles.expanded : ''}`}
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              aria-hidden='true'
            >
              <path
                d='M3.5 6L8 10.5L12.5 6'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
          {showWeeklyHours && (
            <ul className={styles.weeklyHours}>
              {weeklyHours.map(({ day, hours }) => (
                <li key={day}>
                  <span>{day}</span> <span>{hours}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className={styles.details}>
        {!isFuture && !appointmentOnly && !isClosedToday && (
          <div className={styles.detail}>
            <img className={styles.detailIcon} src={WALK_IN_ICON} alt='' />
            <div>
              <strong>Walk-ins welcome.</strong>
              <span>Appointments also available.</span>
            </div>
          </div>
        )}
        {decoratedModels.length > 0 && (
          <div className={styles.detail}>
            <img className={styles.detailIcon} src={HOME_ICON} alt='' />
            <div>
              <strong>{decoratedModels.length === 1 ? 'Decorated Model' : 'Decorated Models'}</strong>
              <span>{decoratedModels.join(', ')}</span>
            </div>
          </div>
        )}
        {oscPhones.length > 0 && (
          <div className={styles.detail}>
            <img className={`${styles.detailIcon} ${styles.oscIcon}`} src={OSC_ICON} alt='' />
            <div className={styles.phoneList}>
              <strong>{salesTeamTitle}</strong>
              {oscPhones.map((phone) => (
                <a key={phone} href={phoneLink(phone)}>
                  {phone}
                </a>
              ))}
            </div>
          </div>
        )}
        {salesOffices.map((location, index) => (
          <SalesOfficeLocation
            key={location.communityId || location.url || index}
            product={location}
            utils={utils}
            showName={salesOffices.length > 1}
            futureCommunity={isFuture}
          />
        ))}
      </div>

      <div className={styles.actions}>
        <ProductContactButtons
          product={visitProduct}
          utils={utils}
          onMinimizeChat={onMinimizeChat}
          clearFocusTrap={clearFocusTrap}
        />
      </div>
    </section>
  )
}
