import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils'
import { Consumption } from '../AddConsumptions/AddConsumptions'
import { ConsumptionsType } from '../../../constants/Others'
import { getConsumptionsByType } from '../../../Utils/FirebaseTools'
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate'
import HeadingLoadingTemplate from '../../UI/LoadingTemplate/HeadingLoadingTemplate'
import Button from '../../UI/Button/Button'
import { useStateValue } from '../../../context/StateProvider'
import { actionTypes } from '../../../context/reducer'
import { deleteDoc, doc } from 'firebase/firestore'
import Collections from '../../../constants/Collections'
import { db } from '../../../constants/FirebaseConfig'
import { toast } from 'react-toastify'
import ICONS from '../../../constants/Icons'
import { Tooltip } from 'react-tooltip'
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker'
import { jalaliToGregorian } from 'shamsi-date-converter'
import { date } from 'yup'


interface DisplayConsumptionsProps {
    type: string
}

const DisplayConsumptions: React.FC<DisplayConsumptionsProps> = ({ type = ConsumptionsType.RETAIL_CONSUMPTION }) => {
    const [consumptions, setconsumptions] = useState<Consumption[]>([])
    const [filtered, setFiltered] = useState<Consumption[]>([])
    const [loading, setLoading] = useState(true)
    const [{ authentication }, dispatch] = useStateValue()
    const [range, setrange] = useState<Date[]>([])

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
        getConsumptionsByType(type)
            .then(res => {
                console.log(res);
                setconsumptions(res)
                setFiltered(res)
            })
            .finally(() => setLoading(false))

    }, [])


    const showDeleteModal = (id: string, index: number) => {
        dispatch({
            type: actionTypes.SHOW_ASKING_MODAL,
            payload: {
                show: true,
                message: "deleteMessage",
                btnAction: () => deleteConsumption(id, index)
            },
        });
    };



    const deleteConsumption = async (id: string, index: number) => {
        dispatch({
            type: actionTypes.SET_GLOBAL_LOADING,
            payload: { value: true },
        });
        dispatch({
            type: actionTypes.HIDE_ASKING_MODAL,
        });

        const consumptionDoc = doc(db, Collections.Consumptions, id)
        try {
            await deleteDoc(consumptionDoc)
            toast.success('successfullyDeleted')
            const temp = [...consumptions];
            temp.splice(index, 1);
            setconsumptions(temp);

        } catch (err) {
            toast.error(err.message)
        } finally {
            dispatch({
                type: actionTypes.SET_GLOBAL_LOADING,
                payload: { value: false },
            });
        }

    }

    const totalAll = (): number => {
        let total = 0;
        filtered.forEach(item => total += Number(item.amount))
        return total;
    }

    const getProductSalesInDatePeriod = async () => {
        const dates: Date[] = range.map(item => new Date(jalaliToGregorian(item.year, item.month.number, item.day).join('/')))
        let consumps: Consumption[] = consumptions;
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
                console.log(item.date.toDate());


                const elementDate = item.date.toDate(); // Convert Firebase Timestamp to JS Date
                return elementDate >= startDay && elementDate <= endDay;
            })
        }

        setFiltered(consumps)

    }


    return (
        <div>
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
            <div className='margin_top_20'>
                {loading ? <HeadingLoadingTemplate /> :
                    <div className='full_width  display_flex justify_content_end'>
                        <div className='input display_flex justify_content_end'>
                            <span className='bold'>{t('totalAll')}: </span>
                            <span>{totalAll()}</span>
                        </div>
                    </div>
                }
                {loading ? <ShotLoadingTemplate /> :
                    <div className="full_width overflow_x_scroll">
                        <table className='custom_table full_width'>
                            <thead style={{ backgroundColor: 'orange' }}>
                                <tr><th colSpan={type == ConsumptionsType.WITHDRAW ? 8 : 7}>{getComponent(type)}</th></tr>
                                <tr>
                                    <th>#</th>
                                    <th>{t('createdDate')}</th>
                                    <th>{t('amount')}</th>
                                    <th>{t('type')}</th>
                                    {type == ConsumptionsType.WITHDRAW && <th>{t('toAccount')}</th>}
                                    <th>{t('registrar')}</th>
                                    <th>{t('descriptions')}</th>
                                    <th>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, index) => {
                                    return <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{formatFirebaseDates(item.createdDate)}</td>
                                        <td>{item.amount}</td>
                                        <td>{t(item.type)}</td>
                                        {type == ConsumptionsType.WITHDRAW && <td>{item.to?.name} {item.to?.lastName}</td>}
                                        <td>{item.registrar}</td>
                                        <td>{item.descriptions}</td>
                                        <td>
                                            <Button
                                                text={t('delete')}
                                                onClick={() => showDeleteModal(item.id, index)}
                                                btnType={'crossBtn'}
                                                id={'delete_row' + index}
                                            />
                                            <Tooltip
                                                anchorSelect={"#delete_row" + index}
                                                place="right"
                                                className="toolTip_style"
                                            >
                                                {t("delete")}
                                            </Tooltip>
                                        </td>
                                    </tr>
                                })}
                                {consumptions.length == 0 && <tr><td colSpan={type == ConsumptionsType.WITHDRAW ? 8 : 7}>{t('notExist')}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        </div>

    )
}

export default DisplayConsumptions