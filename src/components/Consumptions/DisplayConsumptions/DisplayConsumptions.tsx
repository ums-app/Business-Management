import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils'
import { Consumption } from '../AddConsumptions/AddConsumptions'
import { ConsumptionsType } from '../../../constants/Others'


interface DisplayConsumptionsProps {
    type: string
}

const DisplayConsumptions: React.FC<DisplayConsumptionsProps> = ({ type = ConsumptionsType.RETAIL_CONSUMPTION }) => {
    const [consumptions, setconsumptions] = useState<Consumption[]>([])



    const getComponent = (type: string) => {
        switch (type) {
            case ConsumptionsType.CONSTANT_CONSUMPTION:
                return t('constantConsumptions');
            case ConsumptionsType.MAJOR_CONSUMPTION:
                return t('majorConsumptions');
            case ConsumptionsType.RETAIL_CONSUMPTION:
                return t('retailConsumptions');
            case ConsumptionsType.WITHDRAW:
                return t('withdrawals');
            default:
                return t('unknown')
        }
    }
    useEffect(() => {
        // getConsumptionsByType()

    }, [])
    return (
        <div>
            <div className='margin_top_20'>
                <table className='custom_table full_width'>
                    <thead style={{ backgroundColor: 'orange' }}>
                        <tr><th colSpan={7}>{getComponent(type)}</th></tr>
                        <tr>
                            <th>#</th>
                            <th>{t('createdDate')}</th>
                            <th>{t('amount')}</th>
                            <th>{t('type')}</th>
                            <th>{t('toAccount')}</th>
                            <th>{t('registrar')}</th>
                            <th>{t('descriptions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {consumptions.map((item, index) => {
                            return <tr>
                                <td>{index + 1}</td>
                                <td>{formatFirebaseDates(item.createdDate)}</td>
                                <td>{item.amount}</td>
                                <td>{item.type}</td>
                                <td>{item.to}</td>
                                <td>{item.registrar}</td>
                                <td>{item.descriptions}</td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>

    )
}

export default DisplayConsumptions