import React, { useState, useEffect, useMemo } from 'react'
import styles from './MortgageCalculator.module.scss'
import { DragSlider } from './DragSlider'

const DOWN_PAYMENT_PERCENTAGE_MIN = 0
const DOWN_PAYMENT_PERCENTAGE_MAX = 99

export const MortgageCalculator = ({
  salesNumber = 100000,
  setSalesNumber,
  loanNumber,
  setLoanNumber,
  // downPaymentNumber,
  // setDownPaymentNumber,
  interestNumber,
  setInterestNumber,
  setMonthlyPayment,
  monthlyPayment,
  showAdvancedToggle,
  setShowAdvancedToggle,
  targetClass,
  resetDownMax,
  downMax,
  salePriceStep = 1000,
  maxSalePrice = 1000000,
  downPaymentStep = 500
}) => {
  const [taxNumber, setTaxNumber] = useState(0)

  const [insuranceNumber, setInsuranceNumber] = useState(0)
  const [hoaNumber, setHoaNumber] = useState(0)
  const [piNumber, setPiNumber] = useState(0) // principal and interest
  const [showLegendToggle, setShowLegendToggle] = useState(false)

  const [downPayment, setDownPayment] = useState(20000)
  const [downPaymentPercentage, setDownPaymentPercentage] = useState(20)
  const [downPaymentBasedOn, setDownPaymentBasedOn] = useState('percentage')

  const [taxDegrees, setTaxDegrees] = useState(0)
  const [insuranceDegrees, setInsuranceDesgrees] = useState(0)
  const [hoaDegrees, setHoaDegrees] = useState(0)

  const [loanError, setLoanError] = useState('')
  const [downError, setDownError] = useState('')
  const [priceError, setPriceError] = useState('')
  const [interestError, setInterestError] = useState('')
  const [taxError, setTaxError] = useState('')
  const [insuranceError, setInsuranceError] = useState('')
  const [hoaError, setHoaError] = useState('')

  const [salePriceInputShow, setSalePriceInputShow] = useState(false)
  const [downInputShow, setDownInputShow] = useState(false)
  const [interestInputShow, setInterestInputShow] = useState(false)
  const [taxInputShow, setTaxInputShow] = useState(false)
  const [insuranceInputShow, setInsuranceInputShow] = useState(false)
  const [hoaInputShow, setHoaInputShow] = useState(false)
  const [showDefalutGraphic, setShowDefalutGraphic] = useState(true)

  const [salesMax, setSalesMax] = useState(maxSalePrice)
  const [loanMax, setLoanMax] = useState(30)
  const [interestMax, setInterestMax] = useState(100000)
  const [taxesMax, setTaxesMax] = useState(1000)
  const [insuranceMax, setInsuranceMax] = useState(
    Math.round(0.2 * salesNumber)
  )
  const [hoaMax, setHoaMax] = useState(1000)

  const [taxPercentageMin, setTaxPercentageMin] = useState(0)
  const [taxPercentageMax, setTaxPercentageMax] = useState(100)
  const [taxPercentage, setTaxPercentage] = useState(1)

  const insuranceMin = 0
  const hoaMin = 0
  const taxesMin = 0
  const salesMin = 10000
  const downPaymentMin = 0
  const loanMin = 1
  const interestMin = 0
  let rangeInputs

  const taxTotal = Math.round((taxPercentage / 100) * salesNumber)

  // console.log(maxSalePrice, 'maxSalePrice')

  const convertToMoney = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const getPercentage = (down, price) => {
    const percentage = (parseInt(down) / parseInt(price)) * 100
    return percentage.toFixed(2)
  }

  const calculateValueByPercent = (percentage, value, toFixed = 2) => {
    const calculation = Math.round(
      ((percentage / 100) * value).toFixed(toFixed)
    )

    return calculation
  }

  const calculateFixedPercentage = (percentage, value, toFixed = 2) => {
    const calculation = (100 * (percentage / value)).toFixed(toFixed)
    return calculation
  }

  const toggleAdvanced = (e) => {
    setShowAdvancedToggle(!showAdvancedToggle)
  }

  const showLegend = (e) => {
    setShowLegendToggle(!showLegendToggle)
  }

  const showSalesInput = (e) => {
    setSalePriceInputShow(!salePriceInputShow)
  }

  const showDownInput = (e) => {
    setDownInputShow(!downInputShow)
  }

  const showInterestInput = (e) => {
    setInterestInputShow(!interestInputShow)
  }

  const showTaxInput = (e) => {
    setTaxInputShow(!taxInputShow)
  }

  const showInsuranceInput = (e) => {
    setInsuranceInputShow(!insuranceInputShow)
  }

  const showHoaInput = (e) => {
    setHoaInputShow(!hoaInputShow)
  }

  const calculateMonthlyPayment = () => {
    const loanAmount = Number(salesNumber) - Number(downPayment)
    const monthlyInterestRate = Number(interestNumber) / 1200 // monthly interest
    const numberOfPayments = loanNumber * 12
    const total = loanAmount * monthlyInterestRate
    const divisor = 1 - Math.pow(1 + monthlyInterestRate, -1 * numberOfPayments)
    let amount = total / divisor < 0 ? 0 : total / divisor
    amount === Infinity ? (amount = 0) : (amount = amount)
    return amount
  }

  const handleSalePriceDirectInput = (value) => {
    const cleanValue = Number(value?.replace(/\D/g, ''))

    if (cleanValue > 0) {
      setPriceError('')
      setSalesNumber(cleanValue)
      setInsuranceMax(Math.round(0.2 * cleanValue))

      if (downPaymentBasedOn === 'percentage') {
        setDownPayment(
          calculateValueByPercent(downPaymentPercentage, cleanValue)
        )
      } else {
        setDownPaymentPercentage(
          calculateFixedPercentage(downPayment, cleanValue)
        )
      }
      return
    }

    // if (parseInt(value) > 10000000) {
    //   return false
    // } else {
    //   const valueType =
    //     value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number'
    //   valueType === 'string'
    //     ? setPriceError('Please enter a number')
    //     : value.startsWith('0')
    //     ? setPriceError('number cannot start with 0')
    //     : (setPriceError(''), setSalesNumber(value))
    //   setSalesMax(value * 2)
    // }
    setPriceError('number cannot start with 0')
    setSalesMax(cleanValue * 2)
  }

  const handleDownPercentageDirectInput = (value) => {
    const cleanValue = value?.replace(/[^0-9.]/g, '')

    if (cleanValue > 0) {
      setDownError('')
      setDownPaymentPercentage(cleanValue)
      setDownPayment(calculateValueByPercent(cleanValue, salesNumber))
      setDownPaymentBasedOn('percentage')
      return
    }

    //   if (parseInt(value) > salesNumber) {
    //     return false
    //   } else {
    //     const valueType =
    //       value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number'
    //     valueType === 'string'
    //       ? setDownError('Please enter a number')
    //       : value.startsWith('0')
    //       ? setDownError('number cannot start with 0')
    //       : (setDownError(''), setDownPaymentNumber(value))
    //   }
    setDownError('number cannot start with 0')
    setDownPaymentPercentage(cleanValue)
  }

  const handleDownDirectInput = (value) => {
    const cleanValue = Number(value?.replace(/\D/g, ''))

    if (cleanValue > 0) {
      setDownError('')
      setDownPayment(cleanValue)
      setDownPaymentPercentage(
        calculateFixedPercentage(cleanValue, salesNumber)
      )
      setDownPaymentBasedOn('amount')
      return
    }

    //   if (parseInt(value) > salesNumber) {
    //     return false
    //   } else {
    //     const valueType =
    //       value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number'
    //     valueType === 'string'
    //       ? setDownError('Please enter a number')
    //       : value.startsWith('0')
    //       ? setDownError('number cannot start with 0')
    //       : (setDownError(''), setDownPaymentNumber(value))
    //   }
    setDownError('number cannot start with 0')
    setDownPayment(cleanValue)
  }
  const handleInterestDirectInput = (value) => {
    const cleanValue = value?.replace(/[^0-9.]/g, '')

    if (Number(cleanValue) > 0) {
      setInterestError('')
      setInterestNumber(cleanValue)
      return
    }
    // if (parseInt(value) > 15) {
    //   return false
    // } else {
    //   const valueType =
    //     value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number'
    //   valueType === 'string'
    //     ? setInterestError('Please enter a number')
    //     : value.startsWith('0')
    //     ? setInterestError('number cannot start with 0')
    //     : (setInterestError(''), setInterestNumber(value))
    //   setHoaMax(value * 2)
    // }
    setInterestError('number cannot start with 0')
    setInterestNumber(cleanValue)
  }

  const handleTaxDirectInput = (value) => {
    const cleanValue = Number(value?.replace(/\D/g, ''))
    setTaxPercentage(null)

    if (Number(cleanValue) > 0) {
      setTaxError('')
      setTaxNumber(cleanValue)
      return
    }
    // if (parseInt(value) > 10000) {
    //   return false
    // } else {
    //   const valueType =
    //     value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number'
    //   valueType === 'string'
    //     ? setTaxError('Please enter a number')
    //     : value.startsWith('0')
    //     ? setTaxError('number cannot start with 0')
    //     : (setTaxError(''), setTaxNumber(value))
    //   setTaxesMax(value * 2)
    // }
    setTaxError('number cannot start with 0')
    setTaxNumber(cleanValue)
  }

  const handleTaxPercentageDirectInput = (value) => {
    const cleanValue = value?.replace(/[^0-9.]/g, '')

    if (Number(cleanValue) > 0) {
      setTaxError('')
      setTaxPercentage(cleanValue)
      // setTaxNumber((Number(cleanValue) / 100) * Number(salesNumber))
      return
    }
    // if (parseInt(value) > 10000) {
    //   return false
    // } else {
    //   const valueType =
    //     value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number'
    //   valueType === 'string'
    //     ? setTaxError('Please enter a number')
    //     : value.startsWith('0')
    //     ? setTaxError('number cannot start with 0')
    //     : (setTaxError(''), setTaxNumber(value))
    //   setTaxesMax(value * 2)
    // }
    setTaxError('number cannot start with 0')
    setTaxPercentage(cleanValue)
  }

  const handleInsuranceDirectInput = (value) => {
    const cleanValue = Number(value?.replace(/\D/g, ''))

    if (Number(cleanValue) > 0) {
      setInsuranceError('')
      setInsuranceNumber(cleanValue)
      setInsuranceMax(cleanValue * 2)
      return
    }
    // if (parseInt(value) > 10000) {
    //   return false
    // } else {
    //   const valueType =
    //     value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number'
    //   valueType === 'string'
    //     ? setInsuranceError('Please enter a number')
    //     : value.startsWith('0')
    //     ? setInsuranceError('number cannot start with 0')
    //     : (setInsuranceError(''), setInsuranceNumber(value))
    //   setInsuranceMax(value * 2)
    // }
    setInsuranceError('Please enter a number')
    setInsuranceNumber(cleanValue)
  }
  const handleHoaDirectInput = (value) => {
    const cleanValue = Number(value?.replace(/\D/g, ''))

    if (Number(cleanValue) > 0) {
      setHoaError('')
      setHoaNumber(cleanValue)
      setHoaMax(cleanValue * 2)
      return
    }

    // if (parseInt(value) > 10000) {
    //   return false
    // } else {
    //   const valueType =
    //     value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number'
    //   valueType === 'string'
    //     ? setHoaError('Please enter a number')
    //     : value.startsWith('0')
    //     ? setHoaError('number cannot start with 0')
    //     : (setHoaError(''), setHoaNumber(value))
    //   setHoaMax(value * 2)
    // }

    setHoaError('Please enter a number')
    setHoaNumber(cleanValue)
  }

  const hideSaleInput = (e) => {
    setSalePriceInputShow(false)
  }

  const launchToolTip = (e) => {
    e.target.nextElementSibling.classList.add(styles.isActive)
  }

  const hideToolTip = (e) => {
    e.target.nextElementSibling.classList.remove(styles.isActive)
  }

  const hideMobileToolTip = (e) => {
    e.target.parentNode.classList.remove(styles.isActive)
  }

  const loanTermArray = [10, 15, 20, 30]
  const [loanTermIndex, setLoanTermIndex] = useState(3)
  const loadDropDown = (e) => {
    const arrayIndex = loanTermArray.indexOf(parseInt(e.target.value))

    setLoanTermIndex(arrayIndex)
  }
  useEffect(() => {
    setLoanNumber(loanTermArray[loanTermIndex])
  }, [loanTermIndex])

  useEffect(() => {
    //  resetDownMax();
    rangeInputs = document.querySelectorAll('input[type="range"]')
    rangeInputs.forEach((input) => {
      input.addEventListener('input', handleInputChange)
    })
    const calculatedMonthlyPayment = calculateMonthlyPayment()
    let totalPayment =
      calculatedMonthlyPayment +
      parseFloat(Math.round(taxTotal / 12)) +
      parseFloat(Math.round(insuranceNumber / 12)) +
      parseFloat(hoaNumber)
    isNaN(totalPayment) ? (totalPayment = 0) : (totalPayment = totalPayment)
    setMonthlyPayment(convertToMoney(totalPayment.toFixed(0)))
    const taxPercent = taxTotal / 12 / totalPayment

    const insurancePercent = insuranceNumber / 12 / totalPayment
    const hoaPercent = hoaNumber / totalPayment
    setTaxDegrees(360 * taxPercent)
    setInsuranceDesgrees(360 * insurancePercent)
    setHoaDegrees(360 * hoaPercent)
    setPiNumber(calculatedMonthlyPayment.toFixed(0))
  }, [
    salesNumber,
    loanNumber,
    downPayment,
    interestNumber,
    taxTotal,
    insuranceNumber,
    hoaNumber
  ])

  useEffect(() => {
    targetClass == 'tbdotcom'
      ? setShowDefalutGraphic(false)
      : setShowDefalutGraphic(true)
  })

  function handleInputChange(e) {
    const target = e.target
    const min = target.min
    const max = target.max
    const val = target.value
    const percentage = ((val - min) * 100) / (max - min)
    target.style.backgroundSize = percentage + '% 100%'
  }

  // TODO: Try to find a better way to handle this
  const calculateInputSize = (value) => {
    let cushion = 2
    const valueNumber = Number(value)

    if (valueNumber === 0) {
      cushion = 1
    } else if (valueNumber >= 1000000) {
      cushion = 3
    } else if (valueNumber > 10000000) {
      cushion = 4
    }

    return value.toString().length + cushion
  }

  // console.log(insuranceMax, 'insuranceMax')
  // console.log(Math.round(0.2 * salesNumber))

  // console.log('sales price step: ', salePriceStep)
  // console.log('down payment step (salesNumber * 0.005): ', salesNumber * 0.005)
  // console.log('interest rate step: ', 0.125)
  // console.log('tax step: ', 0.05)
  // console.log('insurance step: ', 50)
  // console.log('hoa step: ', 1)

  return (
    <div className={`${styles.calculatorWrapper} ${styles[targetClass]}`}>
      <div className={styles.left}>
        <div className={styles.sliderWrapper}>
          <div className={styles.callOutWrapper}>
            <label htmlFor='mort-sale-price'>Sales Price</label>
            <input
              id='mort-sale-price'
              type='text'
              onChange={(e) => handleSalePriceDirectInput(e.target.value)}
              className={styles.inputAdjust}
              value={`$${convertToMoney(salesNumber)}`}
            />
            <span className={styles.error}>{priceError}</span>
          </div>
          <div className={styles.dragWrapper} onClick={hideSaleInput}>
            <DragSlider
              minValue={salesMin}
              maxValue={salesMax}
              number={salesNumber}
              setNumber={setSalesNumber}
              onChange={(value) => {
                // resetDownMax()
                // console.log(Math.round(0.2 * value))
                // console.log(insuranceMax, 'insuranceMax')
                if (downPaymentBasedOn === 'percentage') {
                  setDownPayment(
                    calculateValueByPercent(downPaymentPercentage, value)
                  )
                } else {
                  setDownPaymentPercentage(
                    calculateFixedPercentage(downPayment, value)
                  )
                }

                setInsuranceMax(Math.round(0.2 * value))
              }}
              step={salePriceStep}
            />
          </div>
        </div>
        <div className={`${styles.sliderWrapper} ${styles.loanTerm}`}>
          <div className={styles.callOutWrapper}>
            <label htmlFor='mort-loan-select'>Loan Term</label>
            <span className={styles.dropDownArrow} />
            <select
              className={styles.select}
              name='loanSelect'
              id='mort-loan-select'
              onChange={loadDropDown}
              value={loanNumber}
            >
              <option value='10'>10 Years</option>
              <option value='15'>15 Years</option>
              <option value='20'>20 Years</option>
              <option value='30'>30 Years</option>
            </select>
          </div>
          <div className={styles.dragWrapper}>
            <DragSlider
              minValue={0}
              maxValue={loanTermArray.length - 1}
              number={loanTermIndex}
              setNumber={setLoanTermIndex}
            />
          </div>
        </div>
        <div className={styles.sliderWrapper}>
          <div className={`${styles.callOutWrapper} ${styles.down}`}>
            <label htmlFor='mort-down-payment-percent'>Down Payment</label>
            <div className={styles.inputWrap}>
              {/* <span className={styles.percent}>
                ({getPercentage(downPaymentNumber, salesNumber)}%)
              </span> */}
              <input
                id='mort-down-payment-percent'
                type='text'
                onChange={(e) =>
                  handleDownPercentageDirectInput(e.target.value)
                }
                className={styles.inputAdjust}
                value={`${downPaymentPercentage}%`}
                size='6'
              />
              <input
                id='mort-down-payment'
                type='text'
                onChange={(e) => handleDownDirectInput(e.target.value)}
                className={styles.inputAdjust}
                value={`$${convertToMoney(downPayment)}`}
                size={calculateInputSize(downPayment)}
              />
            </div>
            <span className={styles.error}>{downError}</span>
          </div>
          <div className={styles.dragWrapper}>
            <DragSlider
              minValue={DOWN_PAYMENT_PERCENTAGE_MIN}
              maxValue={DOWN_PAYMENT_PERCENTAGE_MAX}
              number={downPaymentPercentage}
              setNumber={(value) => {
                setDownPaymentPercentage(value)
                setDownPayment(Math.round((value / 100) * salesNumber))
              }}
              step={0.5}
            />
          </div>
        </div>

        <div className={styles.sliderWrapper}>
          <div className={styles.callOutWrapper}>
            <label htmlFor='mort-int-rate'>Interest Rate</label>
            <input
              id='mort-int-rate'
              type='text'
              onChange={(e) => handleInterestDirectInput(e.target.value)}
              className={styles.inputAdjust}
              value={`${interestNumber > 100 ? 100 : interestNumber}%`}
            />
            <span className={styles.error}>{interestError}</span>
          </div>
          <div className={styles.dragWrapper}>
            <DragSlider
              minValue={interestMin}
              maxValue={interestMax > 100 ? 100 : interestMax.toFixed(3)}
              number={interestNumber}
              setNumber={setInterestNumber}
              step={0.125}
            />
          </div>
        </div>

        <div className={styles.advancedButtonWrapper} onClick={toggleAdvanced}>
          <button onClick={showLegend}>Advanced Options</button>
        </div>
        {showAdvancedToggle && (
          <>
            <div className={styles.sliderWrapper}>
              <div className={styles.callOutWrapper}>
                <label htmlFor='mort-taxes'>Taxes (Annual)</label>
                <div className={styles.inputWrap}>
                  <span>{`$${convertToMoney(taxTotal)}`}</span>
                  <input
                    id='mort-taxes-by-percentage'
                    type='text'
                    onChange={(e) =>
                      handleTaxPercentageDirectInput(e.target.value)
                    }
                    className={styles.inputAdjust}
                    value={`${taxPercentage}%`}
                    size={taxPercentage.toString().length + 2}
                  />
                  {/* <input
                    id='mort-taxes'
                    type='text'
                    onChange={(e) => handleTaxDirectInput(e.target.value)}
                    className={styles.inputAdjust}
                    value={`$${convertToMoney(taxNumber)}`}
                    size={calculateInputSize(taxNumber)}
                  /> */}
                </div>
                <span className={styles.error}>{taxError}</span>
              </div>
              <div className={styles.dragWrapper}>
                <DragSlider
                  minValue={taxPercentageMin}
                  maxValue={taxPercentageMax}
                  number={taxPercentage}
                  setNumber={setTaxPercentage}
                  // onChange={() => setTaxPercentage(null)}
                  step={0.05}
                />
              </div>
            </div>

            <div className={styles.sliderWrapper}>
              <div className={styles.callOutWrapper}>
                <label htmlFor='mort-insurance'>Insurance (Annual)</label>
                <input
                  id='mort-insurance'
                  type='text'
                  onChange={(e) => handleInsuranceDirectInput(e.target.value)}
                  className={styles.inputAdjust}
                  value={`$${convertToMoney(insuranceNumber)}`}
                />
                <span className={styles.error}>{insuranceError}</span>
              </div>
              <div className={styles.dragWrapper}>
                <DragSlider
                  minValue={insuranceMin}
                  maxValue={insuranceMax}
                  number={insuranceNumber}
                  setNumber={setInsuranceNumber}
                  step={50} // Math.round(salesNumber * 0.0005)
                />
              </div>
            </div>

            <div className={styles.sliderWrapper}>
              <div className={styles.callOutWrapper}>
                <label htmlFor='mort-hoa'>HOA</label>
                <input
                  id='mort-hoa'
                  type='text'
                  onChange={(e) => handleHoaDirectInput(e.target.value)}
                  className={styles.inputAdjust}
                  value={`$${convertToMoney(hoaNumber)}`}
                />
                <span className={styles.error}>{hoaError}</span>
              </div>
              <div className={styles.dragWrapper}>
                <DragSlider
                  minValue={hoaMin}
                  maxValue={hoaMax}
                  number={hoaNumber}
                  setNumber={setHoaNumber}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.right}>
        <div className={`${styles.callOutWrapper} ${styles.estimatedPayment}`}>
          <div className={styles.graphic}>
            {showDefalutGraphic && (
              <p
                className={`${styles.taxes} ${styles[targetClass]}`}
                style={{
                  background: `conic-gradient( #7cbf92 ${taxDegrees}deg, #39484f ${taxDegrees}deg ${
                    insuranceDegrees + taxDegrees
                  }deg, #cec18b ${insuranceDegrees}deg ${
                    insuranceDegrees + taxDegrees + hoaDegrees
                  }deg, #008289 ${hoaDegrees}deg 360deg)`
                }}
              >
                <span>
                  ${monthlyPayment}
                  <span>Total Estimated Monthly Payment</span>
                </span>
              </p>
            )}
            {!showDefalutGraphic && (
              <p
                className={`${styles.taxes} ${styles[targetClass]} `}
                style={{
                  background: `conic-gradient( #8195A2 ${taxDegrees}deg, #0C223F ${taxDegrees}deg ${
                    insuranceDegrees + taxDegrees
                  }deg, #CEC18B ${insuranceDegrees}deg ${
                    insuranceDegrees + taxDegrees + hoaDegrees
                  }deg, #0070cd ${hoaDegrees}deg 360deg)`
                }}
              >
                <span>
                  ${monthlyPayment}
                  <span>Total Estimated Monthly Payment</span>
                </span>
              </p>
            )}
          </div>
          {showLegendToggle && (
            <div className={styles.details}>
              <div>
                <span>Principal and Interest</span>
                <span>${convertToMoney(piNumber)}/mo</span>
                <span
                  className={styles.toolTipLaunch}
                  onMouseOver={launchToolTip}
                  onMouseOut={hideToolTip}
                />
                <span className={styles.toolTip}>
                  <span className={styles.close} onClick={hideMobileToolTip}>
                    x
                  </span>
                  Principal is the amount borrowed to purchase your home or the
                  amount yet to be repaid. Interest is the cost of borrowing
                  from your lender.
                </span>
              </div>
              <div>
                <span>Taxes</span>
                <span>${convertToMoney(Math.round(taxTotal / 12))}/mo</span>
                <span
                  className={styles.toolTipLaunch}
                  onMouseOver={launchToolTip}
                  onMouseOut={hideToolTip}
                />
                <span className={styles.toolTip}>
                  <span className={styles.close} onClick={hideMobileToolTip}>
                    x
                  </span>
                  Your lender typically puts one-twelfth of your home’s
                  estimated annual property taxes into an escrow account to pay
                  on your behalf.
                </span>
              </div>
              <div>
                <span>Insurance</span>
                <span>
                  ${convertToMoney(Math.round(insuranceNumber / 12))}/mo
                </span>
                <span
                  className={styles.toolTipLaunch}
                  onMouseOver={launchToolTip}
                  onMouseOut={hideToolTip}
                />
                <span className={styles.toolTip}>
                  <span className={styles.close} onClick={hideMobileToolTip}>
                    x
                  </span>
                  Your lender typically puts one-twelfth of your annual
                  homeowners insurance premium into an escrow account to pay on
                  your behalf. If your down payment is less than 20%, you may
                  also be required to pay private mortgage insurance (PMI).
                </span>
              </div>
              <div>
                <span>HOA</span>
                <span>${convertToMoney(hoaNumber)}/mo</span>
                <span
                  className={styles.toolTipLaunch}
                  onMouseOver={launchToolTip}
                  onMouseOut={hideToolTip}
                />
                <span className={styles.toolTip}>
                  <span className={styles.close} onClick={hideMobileToolTip}>
                    x
                  </span>
                  While not part of your mortgage payment, you may be required
                  to pay fees imposed by your homeowners association.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
