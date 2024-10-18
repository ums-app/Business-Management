import React, { useEffect, useState } from 'react'
import Button from '../../UI/Button/Button'
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next';
import ICONS from '../../../constants/Icons';
import { Consumption } from '../AddConsumptions/AddConsumptions';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils';

const DailyConsumptions: React.FC = () => {
    const nav = useNavigate();
    const [dailyConsumptions, setDailyConsumptions] = useState<Consumption[]>([])

    useEffect(() => {
        // getTodayConsumptions()

    }, [])

    return (
        <div>
            <p className='title'>{t('dailyConsumptions')}</p>
            <div>
                <Button
                    icon={ICONS.plus}
                    text={t('add')}
                    onClick={() => nav('add')}
                />
            </div>

            <div className='margin_top_20'>
                <table className='custom_table full_width'>
                    <thead style={{ backgroundColor: 'orange' }}>
                        <tr><th colSpan={6}>{t('todayConsumptions')}</th></tr>
                        <tr>
                            <th>#</th>
                            <th>{t('createdDate')}</th>
                            <th>{t('amount')}</th>
                            <th>{t('type')}</th>
                            <th>{t('toAccount')}</th>
                            <th>{t('registrar')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dailyConsumptions.map((item, index) => {
                            return <tr>
                                <td>{index + 1}</td>
                                <td>{formatFirebaseDates(item.createdDate)}</td>
                                <td>{item.amount}</td>
                                <td>{item.type}</td>
                                <td>{item.to}</td>
                                <td>{item.registrar}</td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default DailyConsumptions