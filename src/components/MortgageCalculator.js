import React, { useState, useEffect } from 'react'
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
    showAdvancedToggle
}) => {
   // const [setNumber, setSetNumber] = useState(0);
    const [taxNumber, setTaxNumber] = useState(0);
    const [insuranceNumber, setInsuranceNumber] = useState(0);
    const [hoaNumber, setHoaNumber] = useState(0);
    const [piNumber, setPiNumber] = useState(0); // principal and interest
    const [showLegendToggle, setShowLegendToggle] = useState(false);
    const [taxDegrees, setTaxDegrees] = useState(0);
    const [insuranceDegrees, setInsuranceDesgrees] = useState(0);
    const [hoaDegrees, setHoaDegrees] = useState(0);
    const [error, setError] = useState('');
    const [salePriceInputShow, setSalePriceInputShow] = useState(false);
    const [loanInputShow, setLoanInputShow] = useState(false);
    const [downInputShow, setDownInputShow] = useState(false);
    const [interestInputShow, setInterestInputShow] = useState(false);
    const [taxInputShow, setTaxInputShow] = useState(false);
    const [insuranceInputShow, setInsuranceInputShow] = useState(false);
    const [hoaInputShow, setHoaInputShow] = useState(false);
    const [salesMax, setSalesMax] = useState(1000000);
    //const [salesMin, setSalesMin] = useState(1000);

    let insuranceStep = 10;
    let insuranceMin = 0;
    let insuranceMax = 1000;
    let hoaStep = 10;
    let hoaMin = 0;
    let hoaMax = 1000;
    let taxesStep = 10;
    let taxesMin = 0;
    let taxesMax = 1000;
    let salesMin = 0;
    //let salesMax = 1000000;
    let salesStep = 10000;
    let downPaymentMin = 0;
    let downPaymentMax = 500000;
    let downPaymentStep = 1000;
    let loanMin = 10;
    let loanMax = 30;
    let loanStep = 1;
    let interestMin = 0.1;
    let interestMax = 10;
    let interestStep = 0.1;
    //let test = 0;

    const convertToMoney = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const getPercentage = (down, price) => {
        let percentage = (down / price) * 100;
        return percentage.toFixed(0);
    };

    const toggleAdvanced = (e) => {
        e.target.parentNode.classList.toggle(styles.isOpened);
    }

    const showLegend = (e) => {
        setShowLegendToggle(!showLegendToggle);
    }

    const showInput = (e) => {
        setSalePriceInputShow(!salePriceInputShow);
    }

    const calculateMonthlyPayment = () => {
        const loanAmount = salesNumber - downPaymentNumber;
        const monthlyInterestRate = interestNumber / 1200; // monthly interest

        const numberOfPayments = loanNumber * 12;
        const total = loanAmount * monthlyInterestRate;
        const divisor = 1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments);
        return total / divisor < 0 ? 0 : total / divisor;
    };


    const handleSalePriceDirectInput = (value) => {
        //value > 5000000 ? value = 5000000 : value = value;
        //setSalesNumber(value);
        const valueType = value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number';
        valueType === 'string' ? setError('Please enter a number') : (setError(''), setSalesNumber(value));
        setSalesMax(value * 2);
        //setSalesMin(value / 10);
        //console.log(value);
    }

    // useEffect(() => {
    //     console.log('testing');
    //     setSalesMax(salesNumber * 2);
    // }, [salesNumber]);

    const hideInput = (e) => {
        setSalePriceInputShow(false)
    }

    useEffect(() => {
        const calculatedMonthlyPayment = calculateMonthlyPayment();
        const totalPayment = calculatedMonthlyPayment + parseFloat(taxNumber) + parseFloat(insuranceNumber) + parseFloat(hoaNumber);
        setMonthlyPayment(convertToMoney(totalPayment.toFixed(0)));

        const taxPercent = taxNumber / totalPayment;
        const insurancePercent = insuranceNumber / totalPayment;
        const hoaPercent = hoaNumber / totalPayment;

        setTaxDegrees(360 * taxPercent);
        setInsuranceDesgrees((360 * insurancePercent));
        setHoaDegrees((360 * hoaPercent));
        setPiNumber(calculatedMonthlyPayment.toFixed(0));
      


    }, [salesNumber, loanNumber, downPaymentNumber, interestNumber, taxNumber, insuranceNumber, hoaNumber]);

    

    return (
        <div className={styles.calculatorWrapper}>
            <div className={styles.left}>
                <div className={styles.sliderWrapper}>
                    <div className={styles.callOutWrapper}>
                        <p>Sales Price</p>
                        <p onClick={showInput}>${convertToMoney(salesNumber)}</p>
                        <span className={styles.error}>{error}</span>
                    </div>
                    <div className={styles.dragWrapper} onClick={hideInput}>
                        <DragSlider
                            //step={salesStep}
                            minValue={salesMin}
                            maxValue={salesMax}
                            //maxValue={salesNumber * 2}
                            number={salesNumber}
                            setNumber={setSalesNumber}
                            setPayment={setMonthlyPayment}
                           
                        />
                        {/* <span className={styles.error}>{error}</span> */}
                    </div>

                    {salePriceInputShow &&
                        <input
                            type="text"
                            onChange={(e) => handleSalePriceDirectInput(e.target.value)}
                            className={styles.inputAdjust}
                            value={salesNumber}
                        />
                    }

                </div>
                <div className={styles.sliderWrapper}>
                    <div className={styles.callOutWrapper}>
                        <p>Loan Term</p>
                        <p>{loanNumber} Years</p>
                    </div>
                    <div className={styles.dragWrapper}>
                        <DragSlider
                            step={loanStep}
                            minValue={loanMin}
                            maxValue={loanMax}
                            number={loanNumber}
                            setNumber={setLoanNumber}
                           // test={test}
                        />
                    </div>
                </div>
                <div className={styles.sliderWrapper}>
                    <div className={`${styles.callOutWrapper} ${styles.down}`}>
                        <p>Down Payment</p>
                        <p><span>({getPercentage(downPaymentNumber, salesNumber)}%)</span> ${convertToMoney(downPaymentNumber)}</p>
                    </div>
                    <div className={styles.dragWrapper}>
                        <DragSlider
                            step={downPaymentStep}
                            minValue={downPaymentMin}
                            maxValue={downPaymentMax}
                            number={downPaymentNumber}
                            setNumber={setDownPaymentNumber}
                        />
                    </div>
                </div>

                <div className={styles.sliderWrapper}>

                    <div className={styles.callOutWrapper}>
                        <p>Interest Rate</p>
                        <p>{interestNumber}%</p>
                    </div>
                    <div className={styles.dragWrapper}>
                        <DragSlider
                            step={interestStep}
                            minValue={interestMin}
                            maxValue={interestMax}
                            number={interestNumber}
                            setNumber={setInterestNumber}
                        />
                    </div>
                </div>

                {showAdvancedToggle &&
                    <div className={styles.advancedButtonWrapper} onClick={toggleAdvanced}>
                        <button onClick={showLegend}>Advanced Options</button>

                        <div className={styles.sliderWrapper}>
                            <div className={styles.callOutWrapper}>
                                <p>Taxes</p>
                                <p>${convertToMoney(taxNumber)}</p>
                            </div>
                            <div className={styles.dragWrapper}>
                                <DragSlider
                                    step={taxesStep}
                                    minValue={taxesMin}
                                    maxValue={taxesMax}
                                    number={taxNumber}
                                    setNumber={setTaxNumber}
                                />
                            </div>
                        </div>

                        <div className={styles.sliderWrapper}>
                            <div className={styles.callOutWrapper}>
                                <p>Insurance</p>
                                <p>${convertToMoney(insuranceNumber)}</p>
                            </div>
                            <div className={styles.dragWrapper}>
                                <DragSlider
                                    step={insuranceStep}
                                    minValue={insuranceMin}
                                    maxValue={insuranceMax}
                                    number={insuranceNumber}
                                    setNumber={setInsuranceNumber}
                                />
                            </div>
                        </div>

                        <div className={styles.sliderWrapper}>
                            <div className={styles.callOutWrapper}>
                                <p>HOA</p>
                                <p>${convertToMoney(hoaNumber)}</p>
                            </div>
                            <div className={styles.dragWrapper}>
                                <DragSlider
                                    step={hoaStep}
                                    minValue={hoaMin}
                                    maxValue={hoaMax}
                                    number={hoaNumber}
                                    setNumber={setHoaNumber}
                                />
                            </div>
                        </div>

                    </div>

                }

            </div>

            <div className={styles.right}>

                <div className={`${styles.callOutWrapper} ${styles.estimatedPayment}`}>
                    <p>Estimated Monthly Payment</p>

                    <div className={styles.graphic}>
                        <p className={styles.taxes}
                            style={{ background: `conic-gradient( #7cbf92 ${taxDegrees}deg, #39484f ${taxDegrees}deg ${insuranceDegrees + taxDegrees}deg, #cec18b ${insuranceDegrees}deg ${insuranceDegrees + taxDegrees + hoaDegrees}deg, #008289 ${hoaDegrees}deg 360deg)` }}><span>${monthlyPayment}<span>Total Estimated Monthly Payment</span></span></p>
                    </div>
                    {showLegendToggle &&
                        <div className={styles.details}>
                            <div>
                                <span>Principal and Interest</span>
                                <span>${convertToMoney(piNumber)}</span>
                            </div>
                            <div>
                                <span>Taxes</span>
                                <span>${convertToMoney(taxNumber)}</span>
                            </div>
                            <div>
                                <span>Insurance</span>
                                <span>${convertToMoney(insuranceNumber)}</span>
                            </div>
                            <div>
                                <span>HOA</span>
                                <span>${convertToMoney(hoaNumber)}</span>
                            </div>
                        </div>
                    }
                </div>
            </div>


        </div >

    )

}