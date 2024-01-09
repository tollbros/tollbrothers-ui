import React, { useState, useEffect } from 'react'
import styles from './MortgageCalculator.module.scss'
import { DragSlider } from './DragSlider'


export const MortgageCalculator = ({
    salesNumber,
    setSalesNumber,
    salesStep,
    salesMin,
    salesMax,
    salesCallOut,
    loanNumber,
    setLoanNumber,
    loanStep,
    loanMin,
    loanMax,
    loanCallOut,
    downPaymentNumber,
    setDownPaymentNumber,
    downPaymentStep,
    downPaymentMin,
    downPaymentMax,
    downPaymentCallOut,
    interestNumber,
    setInterestNumber,
    interestStep,
    interestMin,
    interestMax,
    interestCallOut,
    setMonthlyPayment,
    monthlyPayment,
    showAdvancedToggle,
    taxNumber,
    setTaxNumber,
    taxesStep,
    taxesMin,
    taxesMax,
    insuranceStep,
    insuranceMin,
    insuranceMax,
    insuranceNumber,
    setInsuranceNumber,
    hoaStep,
    hoaMin,
    hoaMax,
    hoaNumber,
    setHoaNumber }) => {


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
    let principalPercent = (parseFloat(salesNumber) / parseFloat(graphicTotal) *360);
    let taxPercent = (parseFloat(taxNumber*100 ) / parseFloat(graphicTotal) *360);

    
   
    useEffect(() => {
        const calculatedMonthlyPayment = calculateMonthlyPayment();
        const totalPayment = calculatedMonthlyPayment + parseFloat(taxNumber) + parseFloat(insuranceNumber) + parseFloat(hoaNumber);
        setMonthlyPayment(convertToMoney(totalPayment.toFixed(0)));

        const taxPercent = parseInt((taxNumber /totalPayment) * 100);
        const insurancePercent = parseInt((insuranceNumber /totalPayment) * 100);
        const hoaPercent = parseInt((hoaNumber /totalPayment) * 100);

        console.log(taxPercent, insurancePercent, hoaPercent)

    }, [salesNumber, loanNumber, downPaymentNumber, interestNumber, taxNumber, insuranceNumber, hoaNumber]);
   
    return (
        <div className={styles.calculatorWrapper}>
            <div className={styles.left}>
                <div className={styles.sliderWrapper}>
                    <div className={styles.callOutWrapper}>
                        <p>{salesCallOut}</p>
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
                        <p>{loanCallOut}</p>
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
                        <p>{downPaymentCallOut}</p>
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
                        <p>{interestCallOut}</p>
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

            {


            }
            <div className={styles.right}>

                <div className={`${styles.callOutWrapper} ${styles.estimatedPayment}`}>
                    <p>Estimated Monthly Payment</p>
                    <div className={styles.graphic}>
                   
                        {/* <p className={styles.taxes} style={{background: 'conic-gradient(#7cbf92 300deg, #008289 60deg)'}}><span>${monthlyPayment}<span>Total Estimated Monthly Payment</span></span></p> */}
                        
                        <p className={styles.taxes} style={{background: `conic-gradient( #7cbf92 ${taxPercent}deg, #008289 ${taxPercent}deg ${principalPercent}deg)`}}><span>${monthlyPayment}<span>Total Estimated Monthly Payment</span></span></p> 
                      
                        
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