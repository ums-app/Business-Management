import React, { useState } from 'react'
import { Consumption } from '../AddConsumptions/AddConsumptions'
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils'
import { t } from 'i18next'
import DisplayConsumptions from '../DisplayConsumptions/DisplayConsumptions'
import { ConsumptionsType } from '../../../constants/Others'

const ConstantConsumptions: React.FC = () => {
    const [constantConsumptions, setconstantConsumptions] = useState<Consumption[]>([])
    return (
        <div>


            <DisplayConsumptions type={ConsumptionsType.CONSTANT_CONSUMPTION} />
        </div>
    )
}

export default ConstantConsumptions