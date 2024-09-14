import React from 'react'

function Budget({ size = 'large', number = 0, right = '10px', left = '10px' }) {
    let styles = {
        width: '20px',
        hieght: '20px',
        right: right,
        left: left
    }

    if (size == 'small') {
        styles = {
            width: '10px',
            height: '10px',
            top: '0px',
            right: '0px'
        }
    }

    if (number > 0)

        return (
            <span className="budget" id='budget' style={styles}>{number + 2}</span>
        )
}

export default Budget