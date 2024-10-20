import React, { useEffect, useState } from 'react'
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import HeadingLoadingTemplate from '../../UI/LoadingTemplate/HeadingLoadingTemplate';
import { getAllLogs } from '../../../Utils/FirebaseTools';
import { Log } from '../../../Types/Types';
import { t } from 'i18next';
import { convertToJalali } from '../../../Utils/DateTimeUtils';
import { jalaliToGregorian } from 'shamsi-date-converter';
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker';
import Button from '../../UI/Button/Button';

const AllLogs: React.FC = () => {
    const [loading, setloading] = useState<boolean>(true)
    const [logs, setlogs] = useState<Log[]>([]);
    const [filtered, setFiltered] = useState<Log[]>([])
    const [range, setrange] = useState<Date[]>([])


    useEffect(() => {
        getAllLogs()
            .then(res => {
                setlogs(res)
                setFiltered(res)
            })
            .finally(() => setloading(false))
    }, [])


    const getProductSalesInDatePeriod = async () => {
        const dates: Date[] = range.map(item => new Date(jalaliToGregorian(item.year, item.month.number, item.day).join('/')))
        let consumps: Log[] = logs;
        console.log(dates);

        if (range.length == 1) {
            console.log(range);

            consumps = consumps.filter(item => {
                const elementDate = item.date.toDate(); // Convert Firebase Timestamp to JS Date

                // Create a range for the entire day, accounting for time (start of day to end of day)
                const startOfDay = new Date(dates[0].setHours(0, 0, 0, 0));  // Start of the day (00:00:00)
                const endOfDay = new Date(dates[0].setHours(23, 59, 59, 999)); // End of the day (23:59:59)

                // Check if the element's date falls within the entire day
                return elementDate >= startOfDay && elementDate <= endOfDay;
            });
        }


        if (range.length >= 2) {
            console.log(range);
            const startDay = new Date(dates[0].setHours(0, 0, 0, 0));
            const endDay = new Date(dates[1].setHours(23, 59, 59, 999));

            consumps = consumps.filter(item => {
                console.log(item.createdDate.toDate());


                const elementDate = item.createdDate.toDate(); // Convert Firebase Timestamp to JS Date
                return elementDate >= startDay && elementDate <= endDay;
            })
        }

        setFiltered(consumps)

    }


    return (
        <div className=''>
            <div className='display_flex justify_content_center align_items_center full_width margin_top_20 margin_bottom_10'>
                {/* <span>{t('chooseDatePeriod')}: </span> */}
                <CustomDatePicker
                    range
                    onChange={(e: any) => setrange(e)}
                    placeholder={t('chooseDatePeriod')}
                />
                <Button
                    text={t('apply')}
                    onClick={getProductSalesInDatePeriod}
                />
            </div>

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
        </div>
    )
}

export default AllLogs