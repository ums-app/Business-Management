
import React, { useState } from 'react'
import DisplayConsumptions from '../DisplayConsumptions/DisplayConsumptions'
import { ConsumptionsType } from '../../../constants/Others'

const RetailConsumptions: React.FC = () => {
    return (
        <div>

            <DisplayConsumptions type={ConsumptionsType.RETAIL_CONSUMPTION} />
        </div>
    )
}

export default RetailConsumptions