import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useStateValue } from '../../../../context/StateProvider';
import { t } from 'i18next';
import { db } from '../../../../constants/FirebaseConfig';
import Collections from '../../../../constants/Collections';
import { useNavigate, useParams } from 'react-router-dom';
import ICONS from '../../../../constants/Icons';
import { actionTypes } from '../../../../context/reducer';
import { formatFirebaseDates } from '../../../../Utils/DateTimeUtils';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';
import { getAllCustomerPayments, getAllEmployeePayments, getCustomerFactors, totalAmountOfAllCustomerPayments, totalAmountOfAllFactors } from '../../../../Utils/FirebaseTools';
import Button from '../../../UI/Button/Button';
import Modal from '../../../UI/modal/Modal';
import { jalaliToGregorian } from 'shamsi-date-converter';
import CustomDatePicker from '../../../UI/DatePicker/CustomDatePicker';
import { toast } from 'react-toastify';
import MoneyStatus from '../../../UI/MoneyStatus/MoneyStatus';
import { Tooltip } from 'react-tooltip';
import { EmployeePaymentType } from '../../../../constants/Others';

function EmployeePayments() {
    const [{ authentication }, dispatch] = useStateValue()
    const { employeeId } = useParams();
    const [payments, setPayments] = useState();
    const paymentsCollectionRef = collection(db, Collections.EmployeePayments);
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    // this is for tracking all user payments
    const [userPayment, setUserPayment] = useState({
        amount: 0,
        createdDate: new Date(),
        by: authentication.email,
        employeeId: employeeId,
        date: new Date(),
        type: EmployeePaymentType.SALARY
    })

    // const [totalPayments, settotalPayments] = useState(0)
    // const [totalFactors, settotalFactors] = useState(0)

    useEffect(() => {
        getAllEmployeePayments(employeeId)
            .then(res => {
                console.log(res);
                setPayments(res)
            })

    }, [])





    useEffect(() => {
        getAllEmployeePayments(employeeId).then(res => {
            console.log(res);
            setPayments(res)
        })

    }, []);

    const sendNewPaymentToAPI = async () => {
        dispatch({
            type: actionTypes.SET_SMALL_LOADING,
            payload: true
        })

        try {
            if (userPayment.amount <= 0) {
                toast.error('amountShouldNotBeZeroOrNegative')
                return
            }
            if (!userPayment.type) {
                toast.error(t('type') + " " + t("isRequireText"))
                return
            }

            console.log('sending payment doc: ', userPayment.amount);
            const added = await addDoc(paymentsCollectionRef, userPayment);
            setPayments([{ ...userPayment, id: added.id }, ...payments])
            toast.success(t('successfullyAdded'));
            setShowPaymentModal(false)

        } catch (err) {
            toast.error(err)
        } finally {
            dispatch({
                type: actionTypes.SET_SMALL_LOADING,
                payload: false
            })
        }
    }

    const showDeleteModal = (id, index) => {
        dispatch({
            type: actionTypes.SHOW_ASKING_MODAL,
            payload: {
                show: true,
                message: "deleteMessage",
                btnAction: () => handleDeletePayment(id, index),
                id: id,
            },
        });
    };



    const handleDeletePayment = async (id, index) => {
        dispatch({
            type: actionTypes.SET_GLOBAL_LOADING,
            payload: { value: true },
        });
        dispatch({
            type: actionTypes.HIDE_ASKING_MODAL,
        });

        const paymentDoc = doc(db, Collections.EmployeePayments, id);

        try {
            await deleteDoc(paymentDoc)
            const temp = [...payments];
            temp.splice(index, 1);
            setPayments(temp);
            toast.success(t('successfullyDeleted'));
        } catch (err) {
            console.log(err);
        } finally {
            dispatch({
                type: actionTypes.SET_GLOBAL_LOADING,
                payload: { value: false },
            });
        }
    }

    console.log(payments);

    if (!payments) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }

    return (
        <div>
            {/* <div className='full_width input margin_bottom_10'>
                <p className='title_2'>{t('status')}</p>
                <div>
                    <table className='custom_table full_width' >
                        <thead>
                            <tr style={{ backgroundColor: '#f744e2' }}>
                                <th>{t('totalAmountOfAllPurchases')} </th>
                                <th>{t('totalAmountOfAllPayments')} </th>
                                <th>{t('totalRemainedAmount')} </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{totalFactors}</td>
                                <td>{totalPayments}</td>
                                <td>
                                    {Math.abs(totalFactors - totalPayments)}
                                    <MoneyStatus number={totalFactors - totalPayments} />
                                </td>
                            </tr>

                        </tbody>
                    </table>


                </div>

            </div> */}


            <Button
                text={t('add') + " " + t('receipt')}
                onClick={() => setShowPaymentModal(true)}
            />

            <Modal show={showPaymentModal} modalClose={() => setShowPaymentModal(false)}>
                <div className='display_flex flex_direction_column align_items_center  margin_bottom_10 margin_top_20'>
                    <p className='title margin_top_20 margin_bottom_10'>{t('add')} {t('receipt')}</p>
                    <table className='margin_top_20'>
                        <tbody>
                            <tr>
                                <td>{t('number')}: </td>
                                <td>
                                    {payments.length + 1}
                                </td>
                            </tr>
                            <tr>
                                <td>{t('receipt')} {t('purpose')}: </td>
                                <td>
                                    <select name="" id=""
                                        onChange={(e) => {
                                            setUserPayment({
                                                ...userPayment,
                                                type: e.target.value
                                            })
                                        }}
                                    >
                                        <option value={EmployeePaymentType.SALARY}>{t('salary')}</option>
                                        <option value={EmployeePaymentType.SALES}>{t('sales')}</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>{t('paidAmount')}:</td>
                                <td>
                                    <input
                                        type="number"
                                        className='full_width'
                                        onChange={e => setUserPayment({ ...userPayment, amount: Number(e.target.value + "") })}
                                    />
                                </td>
                            </tr>
                            <tr className='margin_top_20'>
                                <td>{t('date')}:</td>
                                <td>
                                    <CustomDatePicker onChange={e => {
                                        const date = jalaliToGregorian(e.year, e.month.number, e.day)
                                        const gDate = new Date(date);
                                        setUserPayment({
                                            ...userPayment,
                                            date: gDate
                                        })
                                    }} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className='margin_top_20'>
                        <Button
                            text={t('save')}
                            type={'plusBtn'}
                            id={'add_new_payment'}
                            onClick={sendNewPaymentToAPI}
                        />
                        <Button
                            text={t('cancel')}
                            type={'crossBtn'}
                            id={'cancel_new_payment'}
                            onClick={() => {
                                setUserPayment({
                                    ...userPayment,
                                    amount: 0
                                })
                                setShowPaymentModal(false)
                            }}
                        />
                    </div>
                </div>
            </Modal>



            <div className='table_container margin_top_20 input'>
                <p className='title_2'>{t('receipts')}</p>
                <table className="full_width custom_table table_row_hover">
                    <thead >
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('createdDate')}</th>
                            <th>{t('employee')}</th>
                            <th>{t('paidAmount')}</th>
                            <th>{t('receipt')} {t('purpose')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments?.map((pay, index) => {
                            console.log(pay.createdDate);
                            return <tr
                                className=" cursor_pointer hover"
                                onClick={() => {
                                    // dispatch({
                                    //     type: actionTypes.SET_FACTOR,
                                    //     payload: pay.saleId
                                    // })
                                    // dispatch({
                                    //     type: actionTypes.ADD_CUSTOMER_TO_SALE_FACTOR,
                                    //     payload: factor.customer
                                    // })
                                    // nav('/sales/' + factor.id)
                                }}
                                key={pay.id}
                            >
                                <td>{index + 1}</td>
                                <td>{formatFirebaseDates(pay.createdDate)}</td>
                                <td>{pay.by}</td>
                                <td>{pay.amount}</td>
                                <td>{pay.type == EmployeePaymentType.SALARY ? t('salary') : t('sales')}</td>
                                <td>
                                    <Button
                                        icon={ICONS.trash}
                                        onClick={() => showDeleteModal(pay.id, index)}
                                        type={'crossBtn'}
                                        id={'delete_row'}
                                    />
                                    <Tooltip
                                        anchorSelect="#delete_row"
                                        place="right"
                                        className="toolTip_style"
                                    >
                                        {t("delete")}
                                    </Tooltip>
                                </td>
                            </tr>
                        })
                        }
                        {payments.length == 0 && <tr><td colSpan={6}>{t('notExist')}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default EmployeePayments