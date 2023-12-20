import React from 'react'
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
    interestCallOut }) => {


    const convertToMoney = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    


    return (
        <div className={styles.calculatorWrapper}>
            <div className={styles.sliderWrapper}>
                <div className={styles.callOutWrapper}>
                    <p>{salesCallOut}</p>
                    <p>${convertToMoney(salesNumber)}</p>
                </div>
                <DragSlider
                    step={salesStep}
                    minValue={salesMin}
                    maxValue={salesMax}
                    number={salesNumber}
                    setNumber={setSalesNumber}
                />

            </div>
            <div className={styles.sliderWrapper}>
                <div className={styles.callOutWrapper}>
                    <p>{loanCallOut}</p>
                    <p>{loanNumber} Years</p>
                </div>
                <DragSlider
                    step={loanStep}
                    minValue={loanMin}
                    maxValue={loanMax}
                    number={loanNumber}
                    setNumber={setLoanNumber}
                />
            </div>
            <div className={styles.sliderWrapper}>
                <div className={styles.callOutWrapper}>
                    <p>{downPaymentCallOut}</p>
                    <p><span>down percent</span>${convertToMoney(downPaymentNumber)}</p>
                </div>
                <DragSlider
                    step={downPaymentStep}
                    minValue={downPaymentMin}
                    maxValue={downPaymentMax}
                    number={downPaymentNumber}
                    setNumber={setDownPaymentNumber}
                />
            </div>
            <div className={styles.sliderWrapper}>

                <div className={styles.callOutWrapper}>
                    <p>{interestCallOut}</p>
                    <p>{interestNumber}%</p>
                </div>
                <DragSlider
                    step={interestStep}
                    minValue={interestMin}
                    maxValue={interestMax}
                    number={interestNumber}
                    setNumber={setInterestNumber}
                />
            </div>




        </div>

    )

}