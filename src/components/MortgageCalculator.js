import React, { useState, useEffect } from 'react'
import styles from './MortgageCalculator.module.scss'
import { DragSlider } from './DragSlider'

const DEFAULT_SALES = 100000
const SALES_MIN = 100000
const SALES_MAX = 1000000
const SALES_STEP = 1000

const DOWN_PAYMENT_PERCENTAGE_MIN = 0
const DOWN_PAYMENT_PERCENTAGE_MAX = 99
const DOWN_PAYMENT_PERCENTAGE_STEP = 0.5

const DEFAULT_INTEREST_RATE = 3.5
const INTEREST_RATE_MIN = 0
const INTEREST_RATE_MAX = 12
const INTEREST_RATE_STEP = 0.125

const TAX_PERCENTAGE_MIN = 0
const TAX_PERCENTAGE_MAX = 12
const TAX_PERCENTAGE_STEP = 0.01

const INSURANCE_MIN = 0
const INSURANCE_MAX_BASIS = 0.12
const INSURANCE_STEP = 50

const HOA_MIN = 0
const HOA_MAX = 5000
const HOA_STEP = 1

export const MortgageCalculator = ({
  initialSalesNumber = DEFAULT_SALES,
  initialInterestRate = DEFAULT_INTEREST_RATE,
  targetClass,
  maxSalePrice = SALES_MAX
}) => {
  const [salesNumber, setSalesNumber] = useState(initialSalesNumber)
  const [loanTerm, setLoanTerm] = useState(30)
  const [interestNumber, setInterestNumber] = useState(initialInterestRate)
  const [insuranceNumber, setInsuranceNumber] = useState(0)
  const [hoaNumber, setHoaNumber] = useState(0)
  const [piNumber, setPiNumber] = useState(0) // principal and interest
  const [showLegendToggle, setShowLegendToggle] = useState(false)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [downPayment, setDownPayment] = useState(0.2 * initialSalesNumber)
  const [downPaymentPercentage, setDownPaymentPercentage] = useState(20)
  const [tax, setTax] = useState(0)
  const [taxPercentage, setTaxPercentage] = useState(0)
  const [taxDegrees, setTaxDegrees] = useState(0)
  const [insuranceDegrees, setInsuranceDesgrees] = useState(0)
  const [hoaDegrees, setHoaDegrees] = useState(0)
  const [showDefalutGraphic, setShowDefalutGraphic] = useState(true)
  const [showAdvancedToggle, setShowAdvancedToggle] = useState(false)

  let rangeInputs

  const convertToMoney = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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

  const calculateMonthlyPayment = () => {
    const loanAmount = Number(salesNumber) - Number(downPayment)
    const monthlyInterestRate = Number(interestNumber) / 1200 // monthly interest
    const numberOfPayments = loanTerm * 12
    const total = loanAmount * monthlyInterestRate
    const divisor = 1 - Math.pow(1 + monthlyInterestRate, -1 * numberOfPayments)
    let amount = total / divisor < 0 ? 0 : total / divisor
    amount === Infinity ? (amount = 0) : (amount = amount)
    return amount
  }

  const handleSalePriceDirectInput = (value) => {
    const cleanValue = Number(value?.replace(/\D/g, ''))

    if (cleanValue > 0) {
      setSalesNumber(cleanValue)
      setDownPayment(calculateValueByPercent(downPaymentPercentage, cleanValue))
      setTax(calculateValueByPercent(taxPercentage, cleanValue))
    } else {
      setSalesNumber('')
      setDownPayment(0)
      setTax(0)
    }
  }

  const handleDownPercentageDirectInput = (value) => {
    const cleanValue = value?.replace(/[^0-9.]/g, '')

    if (cleanValue >= 0) {
      setDownPaymentPercentage(cleanValue)
      setDownPayment(calculateValueByPercent(cleanValue, salesNumber))
    } else {
      setDownPaymentPercentage('')
      setDownPayment(0)
    }
  }

  const handleDownDirectInput = (value) => {
    const cleanValue = Number(value?.replace(/\D/g, ''))

    if (cleanValue > 0) {
      setDownPayment(cleanValue)
      setDownPaymentPercentage(
        calculateFixedPercentage(cleanValue, salesNumber)
      )
    } else {
      setDownPayment('')
      setDownPaymentPercentage(0)
    }
  }

  const handleInterestDirectInput = (value) => {
    const cleanValue = value?.replace(/[^0-9.]/g, '')

    if (Number(cleanValue) >= 0) {
      setInterestNumber(cleanValue)
    } else {
      setInterestNumber('')
    }
  }

  const handleTaxPercentageDirectInput = (value) => {
    const cleanValue = value?.replace(/[^0-9.]/g, '')

    if (Number(cleanValue) >= 0) {
      setTaxPercentage(cleanValue)
      setTax(calculateValueByPercent(cleanValue, salesNumber))
    } else {
      setTaxPercentage('')
      setTax(0)
    }
  }

  const handleTaxDirectInput = (value) => {
    const cleanValue = Number(value?.replace(/\D/g, ''))

    if (Number(cleanValue) > 0) {
      setTax(cleanValue)
      setTaxPercentage(calculateFixedPercentage(cleanValue, salesNumber))
    } else {
      setTax('')
      setTaxPercentage(0)
    }
  }

  const handleInsuranceDirectInput = (value) => {
    const cleanValue = Number(value?.replace(/\D/g, ''))

    if (Number(cleanValue) > 0) {
      setInsuranceNumber(cleanValue)
    } else {
      setInsuranceNumber('')
    }
  }
  const handleHoaDirectInput = (value) => {
    const cleanValue = Number(value?.replace(/\D/g, ''))

    if (Number(cleanValue) > 0) {
      setHoaNumber(cleanValue)
    } else {
      setHoaNumber('')
    }
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
    setLoanTerm(loanTermArray[loanTermIndex])
  }, [loanTermIndex])

  useEffect(() => {
    rangeInputs = document.querySelectorAll('input[type="range"]')
    rangeInputs.forEach((input) => {
      input.addEventListener('input', handleInputChange)
    })
    const calculatedMonthlyPayment = calculateMonthlyPayment()
    let totalPayment =
      calculatedMonthlyPayment +
      parseFloat(Math.round(tax / 12)) +
      parseFloat(Math.round(insuranceNumber / 12)) +
      parseFloat(hoaNumber)
    isNaN(totalPayment) ? (totalPayment = 0) : (totalPayment = totalPayment)
    setMonthlyPayment(convertToMoney(totalPayment.toFixed(0)))
    const taxPercent = tax / 12 / totalPayment

    const insurancePercent = insuranceNumber / 12 / totalPayment
    const hoaPercent = hoaNumber / totalPayment
    setTaxDegrees(360 * taxPercent)
    setInsuranceDesgrees(360 * insurancePercent)
    setHoaDegrees(360 * hoaPercent)
    setPiNumber(calculatedMonthlyPayment.toFixed(0))
  }, [
    salesNumber,
    loanTerm,
    downPayment,
    interestNumber,
    tax,
    insuranceNumber,
    hoaNumber
  ])

  useEffect(() => {
    targetClass === 'tbdotcom' || targetClass === 'tbmortgage'
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
              onBlur={() => {
                setSalesNumber(Number(salesNumber) ? salesNumber : 0)
              }}
              className={`${styles.input} ${styles.inputFont}`}
              value={`$${convertToMoney(salesNumber)}`}
            />
          </div>
          <div className={styles.dragWrapper}>
            <DragSlider
              minValue={SALES_MIN}
              maxValue={maxSalePrice}
              number={Number(salesNumber) ? salesNumber : 0}
              setNumber={setSalesNumber}
              onChange={(value) => {
                setDownPayment(
                  calculateValueByPercent(downPaymentPercentage, value)
                )
                setTax(calculateValueByPercent(taxPercentage, value))
              }}
              step={SALES_STEP}
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
              value={loanTerm}
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
            <div className={styles.inputWrapper}>
              <input
                id='mort-down-payment'
                type='text'
                onChange={(e) => handleDownDirectInput(e.target.value)}
                onBlur={() =>
                  setDownPayment(Number(downPayment) ? downPayment : 0)
                }
                className={`${styles.input} ${styles.inputFont}`}
                value={`$${convertToMoney(downPayment)}`}
                // size={calculateInputSize(downPayment)}
              />
              <input
                id='mort-down-payment-percent'
                type='text'
                onChange={(e) =>
                  handleDownPercentageDirectInput(e.target.value)
                }
                onBlur={() => {
                  setDownPaymentPercentage(
                    Number(downPaymentPercentage)
                      ? Number(downPaymentPercentage)
                      : 0
                  )
                }}
                className={`${styles.input} ${styles.inputFont} ${styles.inputPercentage}`}
                value={downPaymentPercentage}
                // size='6'
                size={downPaymentPercentage.toString().length + 1}
              />
              <span className={styles.inputFont}>%</span>
            </div>
          </div>
          <div className={styles.dragWrapper}>
            <DragSlider
              minValue={DOWN_PAYMENT_PERCENTAGE_MIN}
              maxValue={DOWN_PAYMENT_PERCENTAGE_MAX}
              number={
                Number(downPaymentPercentage)
                  ? Number(downPaymentPercentage)
                  : 0
              }
              setNumber={(value) => {
                setDownPaymentPercentage(value)
                setDownPayment(calculateValueByPercent(value, salesNumber))
              }}
              step={DOWN_PAYMENT_PERCENTAGE_STEP}
            />
          </div>
        </div>

        <div className={styles.sliderWrapper}>
          <div className={styles.callOutWrapper}>
            <label htmlFor='mort-int-rate'>Interest Rate</label>
            <div>
              <input
                id='mort-int-rate'
                type='text'
                onChange={(e) => handleInterestDirectInput(e.target.value)}
                onBlur={() => {
                  setInterestNumber(
                    Number(interestNumber) ? Number(interestNumber) : 0
                  )
                }}
                className={`${styles.input} ${styles.inputFont} ${styles.inputPercentage}`}
                value={interestNumber}
              />
              <span className={styles.inputFont}>%</span>
            </div>
          </div>
          <div className={styles.dragWrapper}>
            <DragSlider
              minValue={INTEREST_RATE_MIN}
              maxValue={INTEREST_RATE_MAX}
              number={Number(interestNumber) ? Number(interestNumber) : 0}
              setNumber={setInterestNumber}
              step={INTEREST_RATE_STEP}
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
                <div className={styles.inputWrapper}>
                  <input
                    id='mort-taxes-by-amount'
                    type='text'
                    onChange={(e) => {
                      handleTaxDirectInput(e.target.value)
                    }}
                    onBlur={() => setTax(Number(tax) ? tax : 0)}
                    className={`${styles.input} ${styles.inputFont}`}
                    value={`$${convertToMoney(tax)}`}
                    // size={calculateInputSize(tax)}
                  />
                  <input
                    id='mort-taxes-by-percentage'
                    type='text'
                    onChange={(e) =>
                      handleTaxPercentageDirectInput(e.target.value)
                    }
                    onBlur={() =>
                      setTaxPercentage(
                        Number(taxPercentage) ? Number(taxPercentage) : 0
                      )
                    }
                    className={`${styles.input} ${styles.inputFont} ${styles.inputPercentage}`}
                    value={taxPercentage}
                    // size='6'
                  />
                  <span className={styles.inputFont}>%</span>
                </div>
              </div>
              <div className={styles.dragWrapper}>
                <DragSlider
                  minValue={TAX_PERCENTAGE_MIN}
                  maxValue={TAX_PERCENTAGE_MAX}
                  number={Number(taxPercentage) ? Number(taxPercentage) : 0}
                  setNumber={(value) => {
                    setTaxPercentage(value)
                    setTax(calculateValueByPercent(value, salesNumber))
                  }}
                  step={TAX_PERCENTAGE_STEP}
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
                  onBlur={() =>
                    setInsuranceNumber(
                      Number(insuranceNumber) ? insuranceNumber : 0
                    )
                  }
                  className={`${styles.input} ${styles.inputFont}`}
                  value={`$${convertToMoney(insuranceNumber)}`}
                />
              </div>
              <div className={styles.dragWrapper}>
                <DragSlider
                  minValue={INSURANCE_MIN}
                  maxValue={
                    Math.ceil(
                      (INSURANCE_MAX_BASIS * salesNumber) / INSURANCE_STEP
                    ) * INSURANCE_STEP
                  }
                  number={Number(insuranceNumber) ? insuranceNumber : 0}
                  setNumber={setInsuranceNumber}
                  step={INSURANCE_STEP}
                />
              </div>
            </div>

            <div className={styles.sliderWrapper}>
              <div className={styles.callOutWrapper}>
                <label htmlFor='mort-hoa'>HOA (Monthly)</label>
                <input
                  id='mort-hoa'
                  type='text'
                  onChange={(e) => handleHoaDirectInput(e.target.value)}
                  onBlur={() => setHoaNumber(Number(hoaNumber) ? hoaNumber : 0)}
                  className={`${styles.input} ${styles.inputFont}`}
                  value={`$${convertToMoney(hoaNumber)}`}
                />
              </div>
              <div className={styles.dragWrapper}>
                <DragSlider
                  minValue={HOA_MIN}
                  maxValue={HOA_MAX}
                  number={Number(hoaNumber) ? hoaNumber : 0}
                  setNumber={setHoaNumber}
                  step={HOA_STEP}
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
                <span>${convertToMoney(Math.round(tax / 12))}/mo</span>
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
