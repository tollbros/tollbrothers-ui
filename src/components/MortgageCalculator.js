import React, { useState, useEffect, useMemo } from 'react'
import styles from './MortgageCalculator.module.scss'
import { DragSlider } from './DragSlider'

export const MortgageCalculator = ({
  salesNumber,
  setSalesNumber,
  loanNumber,
  setLoanNumber,
  downPaymentNumber,
  setDownPaymentNumber,
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
  const [taxPercentage, setTaxPercentage] = useState(null)
  const [insuranceNumber, setInsuranceNumber] = useState(0)
  const [hoaNumber, setHoaNumber] = useState(0)
  const [piNumber, setPiNumber] = useState(0) // principal and interest
  const [showLegendToggle, setShowLegendToggle] = useState(false)

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
  const [insuranceMax, setInsuranceMax] = useState(1000)
  const [hoaMax, setHoaMax] = useState(1000)

  const insuranceMin = 0
  const hoaMin = 0
  const taxesMin = 0
  const salesMin = 10000
  const downPaymentMin = 0
  const loanMin = 1
  const interestMin = 0
  let rangeInputs

  // console.log(maxSalePrice, 'maxSalePrice')

  const convertToMoney = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const getPercentage = (down, price) => {
    const percentage = (parseInt(down) / parseInt(price)) * 100
    return percentage.toFixed(0)
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
    const loanAmount = Number(salesNumber) - Number(downPaymentNumber)
    const monthlyInterestRate = Number(interestNumber) / 1200 // monthly interest
    const numberOfPayments = loanNumber * 12
    const total = loanAmount * monthlyInterestRate
    const divisor = 1 - Math.pow(1 + monthlyInterestRate, -1 * numberOfPayments)
    let amount = total / divisor < 0 ? 0 : total / divisor

    amount === Infinity ? (amount = 0) : (amount = Math.ceil(amount))
    return amount
  }

  const handleSalePriceDirectInput = (value) => {
    const cleanValue = Number(value?.replace(/\D/g, ''))

    if (cleanValue > 0) {
      setPriceError('')
      setSalesNumber(cleanValue)
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

  const handleDownDirectInput = (value) => {
    const cleanValue = Number(value?.replace(/\D/g, ''))

    if (cleanValue > 0) {
      setDownError('')
      setDownPaymentNumber(cleanValue)
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
    setDownPaymentNumber(cleanValue)
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

      setTaxNumber((Number(cleanValue) / 100) * Number(salesNumber))

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
    if (parseInt(value) > 10000) {
      return false
    } else {
      const valueType =
        value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number'
      valueType === 'string'
        ? setInsuranceError('Please enter a number')
        : value.startsWith('0')
        ? setInsuranceError('number cannot start with 0')
        : (setInsuranceError(''), setInsuranceNumber(value))
      setInsuranceMax(value * 2)
    }
  }
  const handleHoaDirectInput = (value) => {
    if (parseInt(value) > 10000) {
      return false
    } else {
      const valueType =
        value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number'
      valueType === 'string'
        ? setHoaError('Please enter a number')
        : value.startsWith('0')
        ? setHoaError('number cannot start with 0')
        : (setHoaError(''), setHoaNumber(value))
      setHoaMax(value * 2)
    }
  }

  const hideSaleInput = (e) => {
    setSalePriceInputShow(false)
  }

  const hideDownInput = (e) => {
    setDownInputShow(false)
  }

  const hideInterestInput = (e) => {
    setInterestInputShow(false)
  }

  const hideTaxesInput = (e) => {
    setTaxInputShow(false)
  }

  const hideInsuranceInput = (e) => {
    setInsuranceInputShow(false)
  }

  const hideHoaInput = (e) => {
    setHoaInputShow(false)
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
      parseFloat(taxNumber) +
      parseFloat(insuranceNumber) +
      parseFloat(hoaNumber)
    isNaN(totalPayment) ? (totalPayment = 0) : (totalPayment = totalPayment)
    setMonthlyPayment(convertToMoney(totalPayment.toFixed(0)))
    const taxPercent = taxNumber / totalPayment

    const insurancePercent = insuranceNumber / totalPayment
    const hoaPercent = hoaNumber / totalPayment
    setTaxDegrees(360 * taxPercent)
    setInsuranceDesgrees(360 * insurancePercent)
    setHoaDegrees(360 * hoaPercent)
    setPiNumber(calculatedMonthlyPayment.toFixed(0))
  }, [
    salesNumber,
    loanNumber,
    downPaymentNumber,
    interestNumber,
    taxNumber,
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
  const downPaymentInputSize = useMemo(() => {
    let cushion = 2
    const downPayment = Number(downPaymentNumber)

    if (downPayment === 0) {
      cushion = 1
    } else if (downPayment >= 1000000) {
      cushion = 3
    } else if (downPayment > 10000000) {
      cushion = 4
    }

    return downPaymentNumber.toString().length + cushion
  }, [downPaymentNumber])

  console.log(taxPercentage)

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
              onChange={resetDownMax()}
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
            <label htmlFor='mort-down-payment'>Down Payment</label>
            <div className={styles.inputWrap}>
              <span className={styles.percent}>
                ({getPercentage(downPaymentNumber, salesNumber)}%)
              </span>
              <input
                id='mort-down-payment'
                type='text'
                onChange={(e) => handleDownDirectInput(e.target.value)}
                className={styles.inputAdjust}
                value={`$${convertToMoney(downPaymentNumber)}`}
                size={downPaymentInputSize}
              />
            </div>
            <span className={styles.error}>{downError}</span>
          </div>
          <div className={styles.dragWrapper}>
            <DragSlider
              minValue={downPaymentMin}
              maxValue={downMax}
              number={downPaymentNumber}
              setNumber={setDownPaymentNumber}
              step={downPaymentStep}
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
                <label htmlFor='mort-taxes'>Taxes</label>
                {/* <p onClick={showTaxInput}>${convertToMoney(taxNumber)}</p> */}
                <input
                  id='mort-taxes-by-percentage'
                  type='text'
                  onChange={(e) =>
                    handleTaxPercentageDirectInput(e.target.value)
                  }
                  className={styles.inputAdjust}
                  value={`${
                    taxPercentage ??
                    (parseInt(taxNumber) / parseInt(salesNumber)) * 100
                  }%`}
                  size={5}
                />
                <input
                  id='mort-taxes'
                  type='text'
                  onChange={(e) => handleTaxDirectInput(e.target.value)}
                  className={styles.inputAdjust}
                  value={`$${convertToMoney(taxNumber)}`}
                />
                <span className={styles.error}>{taxError}</span>
              </div>
              <div className={styles.dragWrapper}>
                <DragSlider
                  minValue={taxesMin}
                  maxValue={taxesMax}
                  number={taxNumber}
                  setNumber={setTaxNumber}
                  onChange={() => setTaxPercentage(null)}
                />
              </div>
            </div>

            <div className={styles.sliderWrapper}>
              <div className={styles.callOutWrapper}>
                <p>Insurance</p>
                <p onClick={showInsuranceInput}>
                  ${convertToMoney(insuranceNumber)}
                </p>
                <span className={styles.error}>{insuranceError}</span>
              </div>
              <div className={styles.dragWrapper}>
                <DragSlider
                  minValue={insuranceMin}
                  maxValue={insuranceMax}
                  number={insuranceNumber}
                  setNumber={setInsuranceNumber}
                />
              </div>
              {insuranceInputShow && (
                <input
                  type='text'
                  onChange={(e) => handleInsuranceDirectInput(e.target.value)}
                  className={styles.inputAdjust}
                  value={insuranceNumber}
                  onMouseOut={hideInsuranceInput}
                />
              )}
            </div>

            <div className={styles.sliderWrapper}>
              <div className={styles.callOutWrapper}>
                <p>HOA</p>
                <p onClick={showHoaInput}>${convertToMoney(hoaNumber)}</p>
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
              {hoaInputShow && (
                <input
                  type='text'
                  onChange={(e) => handleHoaDirectInput(e.target.value)}
                  className={styles.inputAdjust}
                  value={hoaNumber}
                  onMouseOut={hideHoaInput}
                />
              )}
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
                <span>${convertToMoney(piNumber)}</span>
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
                <span>${convertToMoney(taxNumber)}</span>
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
                <span>${convertToMoney(insuranceNumber)}</span>
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
                <span>${convertToMoney(hoaNumber)}</span>
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
