import React, { useState } from 'react'
import styles from './CommunitySalesOffice.module.scss'
import { OptionButton } from './OptionButton'
import { HOME_ICON, MAP_PIN_ICON, WALK_IN_ICON, OSC_ICON } from './constants'

const phoneLink = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`

const SalesOfficeLocation = ({ product, utils, showName, futureCommunity }) => {
  const office = product.salesOffice
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
      {showName && (product.cleanName || product.name) && (
        <strong className={styles.locationName}>{product.cleanName || product.name}</strong>
      )}
      {(addressLines.length > 0 || (onSitePhone && !isFuture)) && (
        <div className={styles.detail}>
          {addressLines.length > 0 && <img className={styles.detailIcon} src={MAP_PIN_ICON} alt='' />}
          <div>
            {addressLines.length > 0 && (
              <strong>
                {isFuture
                  ? 'Future Community Location'
                  : office?.salesOfficeOffsite
                  ? 'Off-site sales center'
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
  salesOffices = [product],
  title,
  utils,
  primaryAction,
  contactAction
}) => {
  const [showWeeklyHours, setShowWeeklyHours] = useState(false)
  const office = product.salesOffice
  const isFuture = Boolean(product.isFuture || product.communityTypes?.includes('Future'))
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
  const { communityModels = [] } = utils?.buildHomeArrays?.(product?.homes, product.options) || {}
  const decoratedModels = product?.commPlanID
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
      [product, ...salesOffices].flatMap((location) =>
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
      {(title || product.name) && <h3 className={styles.title}>{title || product.name}</h3>}
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
              <strong>Online Sales Consultant</strong>
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
        {contactAction && (
          <OptionButton
            text={contactAction.text}
            href={contactAction.href}
            isLink
            utils={utils}
            onClick={contactAction.onClick}
          />
        )}
        {primaryAction && (
          <OptionButton
            text={primaryAction.text}
            href={primaryAction.href}
            isLink
            utils={utils}
            onClick={primaryAction.onClick}
          />
        )}
      </div>
    </section>
  )
}
