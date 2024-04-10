import React from 'react'
import styles from './HorizontalScroller.module.scss'

export const HorizontalScroller = ({ children }) => {

    return (
        <div className={styles.horizontalScrollWrap}>
            <div className={styles.viewPort}>
                <div className={styles.scrollWrap}>
                   
                    {Object.keys(children).map(key => (
                        <div className={styles.scrollItem} key={key}>
                            {children[key]}
                        </div>
                    ))}
                   
                </div>
            </div>
        </div>
    )
}
