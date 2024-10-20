import React, { useEffect, useState } from 'react'
import { Log } from '../../../Types/Types'
import { getTodayLogs } from '../../../Utils/FirebaseTools'
import { convertToJalali } from '../../../Utils/DateTimeUtils'
import { t } from 'i18next'
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer'
import HeadingLoadingTemplate from '../../UI/LoadingTemplate/HeadingLoadingTemplate'

const DailyLogs: React.FC = () => {
    const [logs, setlogs] = useState<Log[]>([])
    const [loading, setloading] = useState<boolean>(true)

    useEffect(() => {
        getTodayLogs()
            .then(res => {
                setlogs(res)
            })
            .finally(() => setloading(false))
    }, [])



    return (
        <div className='display_flex justify_content_center full_width overflow_x_scroll'>
            {loading ?
                <LoadingTemplateContainer>
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                </LoadingTemplateContainer>
                :
                <table className='custom_table margin_auto'>
                    <thead>
                        <tr><th colSpan={5}>{t('dailyEvents')}</th></tr>
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
            }

        </div>
    )
}

export default DailyLogs