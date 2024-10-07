import React from 'react'
import ICONS from '../../../constants/Icons'

function MoneyStatus({ number }) {
    console.log("money ", number);

    if (Number(number).toFixed(0) == 0) return null

    return (
        <span
            className='border_radius_50 margin_5 '
            style={{
                backgroundColor: number > 0 ? 'red' : 'greenyellow',
                width: '20px',
                height: '20px',
                textAlign: 'center',
                display: 'inline-block'
            }}
        >

            <i className={number > 0 ? ICONS.dash : ICONS.plus}></i>
        </span>
    )
}

export default MoneyStatus