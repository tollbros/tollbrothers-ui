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
    interestCallOut,
    estimatedPayment }) => {


    const convertToMoney = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const getPercentage = (down, price) => {
        let percentage = (down / price) * 100;
        return percentage.toFixed(0);
    };

    const getEstimate = (down, price) => {
        let estimate = (price, down)
        estimate = estimate.toFixed(2)
        return estimate
    };

    return (
        <div className={styles.calculatorWrapper}>
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
            {/* const [estimatedPayment, setEstimatedPayment] = useState(salesNumber); */}
            <div className={`${styles.callOutWrapper} ${styles.estimatedPayment}`}>
                <p>Estimated Monthly Payment<span>(Principal and Interest)</span></p>
                {/* <p>${convertToMoney(getEstimate(downPaymentNumber,salesNumber))}</p> */}
            </div>

        </div>

    )

}