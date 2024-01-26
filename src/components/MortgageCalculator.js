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

    const [loanError, setLoanError] = useState('');
    const [downError, setDownError] = useState('');
    const [priceError, setPriceError] = useState('');
    const [interestError, setInterestError] = useState('');
    const [taxError, setTaxError] = useState('');
    const [insuranceError, setInsuranceError] = useState('');
    const [hoaError, setHoaError] = useState('');

    const [salePriceInputShow, setSalePriceInputShow] = useState(false);
    ///const [loanInputShow, setLoanInputShow] = useState(false);
    const [downInputShow, setDownInputShow] = useState(false);
    const [interestInputShow, setInterestInputShow] = useState(false);
    const [taxInputShow, setTaxInputShow] = useState(false);
    const [insuranceInputShow, setInsuranceInputShow] = useState(false);
    const [hoaInputShow, setHoaInputShow] = useState(false);
    const [dropDown, setDropDown] = useState(0);

    const [salesMax, setSalesMax] = useState(1000000);
    const [loanMax, setLoanMax] = useState(30);
    const [downMax, setDownMax] = useState(100000);
    const [interestMax, setInterestMax] = useState(100000);
    const [taxesMax, setTaxesMax] = useState(1000);
    const [insuranceMax, setInsuranceMax] = useState(1000);
    const [hoaMax, setHoaMax] = useState(1000);

    //let loanStep = 50;

    let insuranceStep = 10;
    let insuranceMin = 0;
    //let insuranceMax = 1000;
    //let hoaStep = 10;
    let hoaMin = 0;
    //let hoaMax = 1000;
    //let taxesStep = 10;
    let taxesMin = 0;
    //let taxesMax = 1000;
    let salesMin = 0;
    //let salesMax = 1000000;
    //let salesStep = 10000;
    let downPaymentMin = 0;
    //let downPaymentMax = 500000;
    //let downPaymentStep = 1000;
    let loanMin = 1;
    //let loanMax = 30;
    //let loanStep = 1;
    let interestMin = 0;
    //let interestMax = 10;
    //let interestStep = 0.1;

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

    const showSalesInput = (e) => {
        setSalePriceInputShow(!salePriceInputShow);
    }

    // const showLoanInput = (e) => {
    //     setLoanInputShow(!loanInputShow);
    // }

    const showDownInput = (e) => {
        setDownInputShow(!downInputShow);
    }

    const showInterestInput = (e) => {
        setInterestInputShow(!interestInputShow);
    }

    const showTaxInput = (e) => {
        setTaxInputShow(!taxInputShow);
    }

    const showInsuranceInput = (e) => {
        setInsuranceInputShow(!insuranceInputShow);
    }

    const showHoaInput = (e) => {
        setHoaInputShow(!hoaInputShow);
    }

    const calculateMonthlyPayment = () => {
        const loanAmount = salesNumber - downPaymentNumber;
        const monthlyInterestRate = interestNumber / 1200; // monthly interest
        const numberOfPayments = loanNumber * 12;
        const total = loanAmount * monthlyInterestRate;
        const divisor = 1 - Math.pow(1 + monthlyInterestRate, - numberOfPayments);
        let amount = total / divisor < 0 ? 0 : total / divisor;
        //(amount === Infinity || isNaN(amount)) ? amount = 0 : amount = amount;
        amount === Infinity ? amount = 0 : amount = parseInt(amount);
        return amount;
    };

    const handleSalePriceDirectInput = (value) => {
        const valueType = value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number';
        valueType === 'string' ? setPriceError('Please enter a number') :
            value.startsWith('0') ? setPriceError('number cannot start with 0') : (setPriceError(''), setSalesNumber(value));
        setSalesMax(value * 2);
    }

    const handleDownDirectInput = (value) => {
        const valueType = value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number';
        valueType === 'string' ? setDownError('Please enter a number') :
            value.startsWith('0') ? setDownError('number cannot start with 0') : (setDownError(''), setDownPaymentNumber(value));
        setDownMax(value * 2);
    }
    const handleInterestDirectInput = (value) => {
        const valueType = value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number';
        valueType === 'string' ? setInterestError('Please enter a number') :
            value.startsWith('0') ? setInterestError('number cannot start with 0') : (setInterestError(''), setInterestNumber(value));
        // value === ' ' ? setInterestMax(0) : setInterestMax(value * 2);
        // value === '' ? console.log('nan') : console.log(value);
        setHoaMax(value * 2);
    }
    const handleTaxDirectInput = (value) => {
        const valueType = value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number';
        valueType === 'string' ? setTaxError('Please enter a number') :
            value.startsWith('0') ? setTaxError('number cannot start with 0') : (setTaxError(''), setTaxNumber(value));
        setTaxesMax(value * 2);
    }
    const handleInsuranceDirectInput = (value) => {
        const valueType = value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number';
        valueType === 'string' ? setInsuranceError('Please enter a number') :
            value.startsWith('0') ? setInsuranceError('number cannot start with 0') : (setInsuranceError(''), setInsuranceNumber(value));
        setInsuranceMax(value * 2);
    }
    const handleHoaDirectInput = (value) => {
        const valueType = value.length > 0 && value.match(/[a-z]/i) ? 'string' : 'number';
        valueType === 'string' ? setHoaError('Please enter a number') :
            value.startsWith('0') ? setHoaError('number cannot start with 0') : (setHoaError(''), setHoaNumber(value));
        setHoaMax(value * 2);
    }

    const hideInput = (e) => {
        setSalePriceInputShow(false)
    }

    const launchToolTip = (e) => {
        e.target.nextElementSibling.classList.add(styles.isActive);
    }

    const hideToolTip = (e) => {
        e.target.nextElementSibling.classList.remove(styles.isActive);
    }

    const hideMobileToolTip = (e) => {
        e.target.parentNode.classList.remove(styles.isActive);
    }

    const handleLoanSliderChange = (e) => {
        // alert('parent');
        // console.log('parent');
        
        // const values = [1, 3, 5, 10, 20, 50, 100];

        

        // setNumber(values[e.target])

    };

    const output = document.getElementById('loanSelect');


    useEffect(() => {
        const calculatedMonthlyPayment = calculateMonthlyPayment();
        let totalPayment = calculatedMonthlyPayment + parseFloat(taxNumber) + parseFloat(insuranceNumber) + parseFloat(hoaNumber);
        isNaN(totalPayment) ? totalPayment = 0 : totalPayment = totalPayment;
        setMonthlyPayment(convertToMoney(totalPayment.toFixed(0)));

        const taxPercent = taxNumber / totalPayment;
        const insurancePercent = insuranceNumber / totalPayment;
        const hoaPercent = hoaNumber / totalPayment;

        setTaxDegrees(360 * taxPercent);
        setInsuranceDesgrees((360 * insurancePercent));
        setHoaDegrees((360 * hoaPercent));
        setPiNumber(calculatedMonthlyPayment.toFixed(0));
        //getLoanOptions();
    }, [salesNumber, loanNumber, downPaymentNumber, interestNumber, taxNumber, insuranceNumber, hoaNumber]);



    return (
        <div className={styles.calculatorWrapper}>
            <div className={styles.left}>
                <div className={styles.sliderWrapper}>
                    <div className={styles.callOutWrapper}>
                        <p>Sales Price</p>
                        <p onClick={showSalesInput}>${convertToMoney(salesNumber)}</p>
                        <span className={styles.error}>{priceError}</span>
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
                <div className={`${styles.sliderWrapper} ${styles.loanTerm}`}>
                    <div className={styles.callOutWrapper}>
                        <p>Loan Term</p>
                        <select className={styles.select} name="loanSelect" id="loanSelect" onChange={(e) => setLoanNumber(e.target.value)} value={loanNumber}>
                            <option value="10">10 Years</option>
                            <option value="15">15 Years</option>
                            <option value="20">20 Years</option>
                            <option value="30">30 Years</option>
                           
                        </select>
                    </div>
                    <div className={styles.dragWrapper}>
                        <DragSlider
                            step={1}
                            // minValue={loanMin}
                            // maxValue={loanMax}
                            minValue={10}
                            maxValue={30}
                            //onSliderChange={handleLoanSliderChange}
                            number={loanNumber}
                            setNumber={setLoanNumber}
                            onChange={handleLoanSliderChange}
                            loanTerm={true}
                            select={output}
                        />

                    </div>
                   
                </div>
                <div className={styles.sliderWrapper}>
                    <div className={`${styles.callOutWrapper} ${styles.down}`}>
                        <p>Down Payment</p>
                        <p onClick={showDownInput}><span>({getPercentage(downPaymentNumber, salesNumber)}%)</span> ${convertToMoney(downPaymentNumber)}</p>
                        <span className={styles.error}>{downError}</span>
                    </div>
                    <div className={styles.dragWrapper}>
                        <DragSlider
                            //step={downPaymentStep}
                            minValue={downPaymentMin}
                            maxValue={downMax}
                            number={downPaymentNumber}
                            setNumber={setDownPaymentNumber}
                        />
                    </div>
                    {downInputShow &&
                        <input
                            type="text"
                            onChange={(e) => handleDownDirectInput(e.target.value)}
                            className={styles.inputAdjust}
                            value={downPaymentNumber}
                        />
                    }
                </div>

                <div className={styles.sliderWrapper}>

                    <div className={styles.callOutWrapper}>
                        <p>Interest Rate</p>
                        <p onClick={showInterestInput}>{interestNumber}%</p>
                        <span className={styles.error}>{interestError}</span>
                    </div>
                    <div className={styles.dragWrapper}>
                        <DragSlider
                            //step={interestStep}
                            minValue={interestMin}
                            maxValue={interestMax > 100 ? 100 : interestMax.toFixed(3)}
                            number={interestNumber}
                            setNumber={setInterestNumber}
                        />
                    </div>
                    {interestInputShow &&
                        <input
                            type="text"
                            onChange={(e) => handleInterestDirectInput(e.target.value)}
                            className={styles.inputAdjust}
                            value={interestNumber > 100 ? 100 : interestNumber}
                        />
                    }
                </div>

                {showAdvancedToggle &&
                    <div className={styles.advancedButtonWrapper} onClick={toggleAdvanced}>
                        <button onClick={showLegend}>Advanced Options</button>

                        <div className={styles.sliderWrapper}>
                            <div className={styles.callOutWrapper}>
                                <p>Taxes</p>
                                <p onClick={showTaxInput}>${convertToMoney(taxNumber)}</p>
                                <span className={styles.error}>{taxError}</span>
                            </div>
                            <div className={styles.dragWrapper}>
                                <DragSlider
                                    //step={taxesStep}
                                    minValue={taxesMin}
                                    maxValue={taxesMax}
                                    number={taxNumber}
                                    setNumber={setTaxNumber}
                                />
                            </div>
                            {taxInputShow &&
                                <input
                                    type="text"
                                    onChange={(e) => handleTaxDirectInput(e.target.value)}
                                    className={styles.inputAdjust}
                                    value={taxNumber}
                                />
                            }
                        </div>

                        <div className={styles.sliderWrapper}>
                            <div className={styles.callOutWrapper}>
                                <p>Insurance</p>
                                <p onClick={showInsuranceInput}>${convertToMoney(insuranceNumber)}</p>
                                <span className={styles.error}>{insuranceError}</span>
                            </div>
                            <div className={styles.dragWrapper}>
                                <DragSlider
                                    //step={insuranceStep}
                                    minValue={insuranceMin}
                                    maxValue={insuranceMax}
                                    number={insuranceNumber}
                                    setNumber={setInsuranceNumber}
                                />
                            </div>
                            {insuranceInputShow &&
                                <input
                                    type="text"
                                    onChange={(e) => handleInsuranceDirectInput(e.target.value)}
                                    className={styles.inputAdjust}
                                    value={insuranceNumber}
                                />
                            }
                        </div>

                        <div className={styles.sliderWrapper}>
                            <div className={styles.callOutWrapper}>
                                <p>HOA</p>
                                <p onClick={showHoaInput}>${convertToMoney(hoaNumber)}</p>
                                <span className={styles.error}>{hoaError}</span>
                            </div>
                            <div className={styles.dragWrapper}>
                                <DragSlider
                                    //step={hoaStep}
                                    minValue={hoaMin}
                                    maxValue={hoaMax}
                                    number={hoaNumber}
                                    setNumber={setHoaNumber}
                                />
                            </div>
                            {hoaInputShow &&
                                <input
                                    type="text"
                                    onChange={(e) => handleHoaDirectInput(e.target.value)}
                                    className={styles.inputAdjust}
                                    value={hoaNumber}
                                />
                            }
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
                                <span className={styles.toolTipLaunch} onMouseOver={launchToolTip} onMouseOut={hideToolTip}></span>
                                <span className={styles.toolTip}><span className={styles.close} onClick={hideMobileToolTip}>x</span>Principal is the amount borrowed to purchase your home or the amount yet to be repaid. Interest is the cost of borrowing from your lender.</span>
                            </div>
                            <div>
                                <span>Taxes</span>
                                <span>${convertToMoney(taxNumber)}</span>
                                <span className={styles.toolTipLaunch} onMouseOver={launchToolTip} onMouseOut={hideToolTip}></span>
                                <span className={styles.toolTip}><span className={styles.close} onClick={hideMobileToolTip}>x</span>Your lender typically puts one-twelfth of your home’s estimated annual property taxes into an escrow account to pay on your behalf.</span>
                            </div>
                            <div>
                                <span>Insurance</span>
                                <span>${convertToMoney(insuranceNumber)}</span>
                                <span className={styles.toolTipLaunch} onMouseOver={launchToolTip} onMouseOut={hideToolTip}></span>
                                <span className={styles.toolTip}><span className={styles.close} onClick={hideMobileToolTip}>x</span>Your lender typically puts one-twelfth of your annual homeowners insurance premium into an escrow account to pay on your behalf. If your down payment is less than 20%, you may also be required to pay private mortgage insurance (PMI).</span>
                            </div>
                            <div>
                                <span>HOA</span>
                                <span>${convertToMoney(hoaNumber)}</span>
                                <span className={styles.toolTipLaunch} onMouseOver={launchToolTip} onMouseOut={hideToolTip}></span>
                                <span className={styles.toolTip}><span className={styles.close} onClick={hideMobileToolTip}>x</span>While not part of your mortgage payment, you may be required to pay fees imposed by your homeowners association.</span>
                            </div>
                        </div>
                    }
                </div>

            </div>

        </div >

    )

}