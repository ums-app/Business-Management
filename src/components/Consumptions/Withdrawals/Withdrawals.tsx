import React, { useState } from 'react'
import { Consumption } from '../AddConsumptions/AddConsumptions'
import { t } from 'i18next'
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils'
import DisplayConsumptions from '../DisplayConsumptions/DisplayConsumptions'
import { ConsumptionsType } from '../../../constants/Others'




const Withdrawals: React.FC = () => {
    const [withdraw, setwithdraw] = useState<Consumption[]>([])
    return (
        <div>

            <DisplayConsumptions type={ConsumptionsType.WITHDRAW} />
        </div>
    )
}

export default Withdrawals