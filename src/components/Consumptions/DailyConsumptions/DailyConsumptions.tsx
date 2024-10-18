import React, { useEffect, useState } from 'react'
import Button from '../../UI/Button/Button'
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next';
import ICONS from '../../../constants/Icons';
import { Consumption } from '../AddConsumptions/AddConsumptions';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils';
import { getTodayConsumptions } from '../../../Utils/FirebaseTools';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';

const DailyConsumptions: React.FC = () => {
    const nav = useNavigate();
    const [consumptions, setConsumptions] = useState<Consumption[]>([])
    const [loading, setloading] = useState(true)


    useEffect(() => {
        getTodayConsumptions()
            .then(res => {
                setConsumptions(res)
            }).finally(() => setloading(false))

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
                {loading ? <ShotLoadingTemplate /> :
                    <table className='custom_table full_width'>
                        <thead style={{ backgroundColor: 'orange' }}>
                            <tr><th colSpan={7}>{t('todayConsumptions')}</th></tr>
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
                                return <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{formatFirebaseDates(item.createdDate)}</td>
                                    <td>{item.amount}</td>
                                    <td>{t(item.type)}</td>
                                    <td>{item.to}</td>
                                    <td>{item.registrar}</td>
                                    <td>{item.descriptions}</td>
                                </tr>
                            })}
                            {consumptions.length == 0 && <tr><td colSpan={7}>{t('notExist')}</td></tr>}
                        </tbody>
                    </table>
                }
            </div>

        </div>
    )
}

export default DailyConsumptions