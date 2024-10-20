import React, { useEffect, useState } from 'react'
import { Log } from '../../../Types/Types'
import { getTodayLogs } from '../../../Utils/FirebaseTools'
import { convertToJalali } from '../../../Utils/DateTimeUtils'
import { t } from 'i18next'

const DailyLogs: React.FC = () => {
    const [logs, setlogs] = useState<Log[]>([])

    useEffect(() => {
        getTodayLogs()
            .then(res => {
                setlogs(res)
            })


    })



    return (
        <div className='display_flex justify_content_center full_width overflow_x_scroll'>
            <table className='custom_table margin_auto'>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{t('title')}</th>
                        <th>{t('message')}</th>
                        <th>{t('registrar')}</th>
                        <th>{t('date')}</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((item, index) => {
                        console.log(item);

                        return <tr>
                            <td>{index + 1}</td>
                            <td>{item.title}</td>
                            <td>{item.message}</td>
                            <td>{item.registrar}</td>
                            <td>
                                <span className='bullet'>
                                    {convertToJalali(item.createdDate)}
                                </span>
                            </td>
                        </tr>
                    })}
                </tbody>
            </table>

        </div>
    )
}

export default DailyLogs