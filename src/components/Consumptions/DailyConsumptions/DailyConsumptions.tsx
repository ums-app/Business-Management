import React, { useEffect, useState } from 'react'
import Button from '../../UI/Button/Button'
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next';
import ICONS from '../../../constants/Icons';
import { Consumption } from '../AddConsumptions/AddConsumptions';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils';
import { getTodayConsumptions } from '../../../Utils/FirebaseTools';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import HeadingLoadingTemplate from '../../UI/LoadingTemplate/HeadingLoadingTemplate';
import { useStateValue } from '../../../context/StateProvider';
import { actionTypes } from '../../../context/reducer';
import { deleteDoc, doc } from 'firebase/firestore';
import Collections from '../../../constants/Collections';
import { db } from '../../../constants/FirebaseConfig';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';

const DailyConsumptions: React.FC = () => {
    const nav = useNavigate();
    const [consumptions, setConsumptions] = useState<Consumption[]>([])
    const [loading, setloading] = useState(true)
    const [{ authentication }, dispatch] = useStateValue()


    useEffect(() => {
        getTodayConsumptions()
            .then(res => {
                setConsumptions(res)
            }).finally(() => setloading(false))

    }, [])


    const totalAll = (): number => {
        let total = 0;
        consumptions.forEach(item => total += Number(item.amount))
        return total;
    }


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
            setConsumptions(temp);

        } catch (err) {
            toast.error(err.message)
        } finally {
            dispatch({
                type: actionTypes.SET_GLOBAL_LOADING,
                payload: { value: false },
            });
        }

    }

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
                {loading ? <HeadingLoadingTemplate /> :
                    <div className='full_width  display_flex justify_content_end'>
                        <div>
                            <span>{t('totalAll')}: </span>
                            <span>{totalAll()}</span>
                        </div>
                    </div>
                }
                {loading ? <ShotLoadingTemplate /> :
                    <table className='custom_table full_width'>
                        <thead style={{ backgroundColor: 'orange' }}>
                            <tr><th colSpan={8}>{t('todayConsumptions')}</th></tr>
                            <tr>
                                <th>#</th>
                                <th>{t('createdDate')}</th>
                                <th>{t('amount')}</th>
                                <th>{t('type')}</th>
                                <th>{t('toAccount')}</th>
                                <th>{t('registrar')}</th>
                                <th>{t('descriptions')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consumptions.map((item, index) => {
                                return <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{formatFirebaseDates(item.createdDate)}</td>
                                    <td>{item.amount}</td>
                                    <td>{t(item.type)}</td>
                                    <td>{item.to?.name} {item.to?.lastName}</td>
                                    <td>{item.registrar}</td>
                                    <td>{item.descriptions}</td>
                                    <td>
                                        <Button
                                            icon={ICONS.trash}
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
                            {consumptions.length == 0 && <tr><td colSpan={8}>{t('notExist')}</td></tr>}
                        </tbody>
                    </table>
                }
            </div>

        </div>
    )
}

export default DailyConsumptions