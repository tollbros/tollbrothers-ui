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
    const [taxNumber, setTaxNumber] = useState(0); 
    const [insuranceNumber, setInsuranceNumber] = useState(0);
    const [hoaNumber, setHoaNumber] = useState(0);
    
    let insuranceStep = 10;
    let insuranceMin = 0;
    let insuranceMax = 1000;
    let hoaStep = 10;
    let hoaMin = 0;
    let hoaMax = 1000;
    let taxesStep = 10;
    let taxesMin = 0;
    let taxesMax = 1000;
    let salesMin = 100000;
    let salesMax = 1000000;
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

    const calculateMonthlyPayment = () => {
        const loanAmount = salesNumber - downPaymentNumber;
        const monthlyInterestRate = interestNumber / 1200; // monthly interest
        
        const numberOfPayments = loanNumber * 12;
        const total = loanAmount * monthlyInterestRate;
        const divisor = 1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments);
        return total / divisor < 0 ? 0 : total / divisor;
    };

    let graphicTotal = parseFloat(salesNumber) + parseFloat(taxNumber);
    let principalPercent = (parseFloat(salesNumber) / parseFloat(graphicTotal) * 360);

    const [taxDegrees, setTaxDegrees] = useState(0);
    const [insuranceDegrees, setInsuranceDesgrees] = useState(0);
    const [hoaDegrees, setHoaDegrees] = useState(0);

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


    }, [salesNumber, loanNumber, downPaymentNumber, interestNumber, taxNumber, insuranceNumber, hoaNumber]);

    return (
        <div className={styles.calculatorWrapper}>
            <div className={styles.left}>
                <div className={styles.sliderWrapper}>
                    <div className={styles.callOutWrapper}>
                        <p>Sales Price</p>
                        <p>${convertToMoney(salesNumber)}</p>
                    </div>
                    <div className={styles.dragWrapper}>
                        <DragSlider
                            step={salesStep}
                            minValue={salesMin}
                            maxValue={salesMax}
                            number={salesNumber}
                            setNumber={setSalesNumber}
                            setPayment={setMonthlyPayment}
                        />
                    </div>

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
                        <button>Advanced Options</button>

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
                                    number={0}
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
                    <div className={styles.details}>
                        <div>
                            <span>Principal and Interest</span>
                            <span>${convertToMoney(salesNumber)}</span>
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
                </div>
            </div>


        </div >

    )

}