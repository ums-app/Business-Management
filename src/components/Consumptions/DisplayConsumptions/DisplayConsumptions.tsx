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


interface DisplayConsumptionsProps {
    type: string
}

const DisplayConsumptions: React.FC<DisplayConsumptionsProps> = ({ type = ConsumptionsType.RETAIL_CONSUMPTION }) => {
    const [consumptions, setconsumptions] = useState<Consumption[]>([])
    const [loading, setLoading] = useState(true)
    const [{ authentication }, dispatch] = useStateValue()

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
        consumptions.forEach(item => total += Number(item.amount))
        return total;
    }

    return (
        <div>
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
                            {consumptions.map((item, index) => {
                                return <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{formatFirebaseDates(item.createdDate)}</td>
                                    <td>{item.amount}</td>
                                    <td>{t(item.type)}</td>
                                    {type == ConsumptionsType.WITHDRAW && <td>{item.to}</td>}
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
                            {consumptions.length == 0 && <tr><td colSpan={type == ConsumptionsType.WITHDRAW ? 8 : 7}>{t('notExist')}</td></tr>}
                        </tbody>
                    </table>
                }
            </div>
        </div>

    )
}

export default DisplayConsumptions