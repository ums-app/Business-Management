import { addDoc, collection, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useStateValue } from '../../../../context/StateProvider';
import { t } from 'i18next';
import { db } from '../../../../constants/FirebaseConfig';
import Collections from '../../../../constants/Collections';
import { useParams } from 'react-router-dom';
import { actionTypes } from '../../../../context/reducer';
import { formatFirebaseDates } from '../../../../Utils/DateTimeUtils';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';
import { getAllCustomerPayments, getCustomerFactors, totalAmountOfAllCustomerPayments, totalAmountOfAllFactors } from '../../../../Utils/FirebaseTools';
import Button from '../../../UI/Button/Button';
import Modal from '../../../UI/modal/Modal';
import { gregorianToJalali, jalaliToGregorian } from 'shamsi-date-converter';
import CustomDatePicker from '../../../UI/DatePicker/CustomDatePicker';
import { toast } from 'react-toastify';
import MoneyStatus from '../../../UI/MoneyStatus/MoneyStatus';
import ICONS from '../../../../constants/Icons';
import { Tooltip } from 'react-tooltip';

function CustomerPayments() {
    const [{ authentication }, dispatch] = useStateValue()
    const { customerId } = useParams();
    const [payments, setPayments] = useState();
    const [factors, setFactors] = useState()
    const paymentsCollectionRef = collection(db, Collections.Payments);
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    // this is for tracking all user payments
    const [userPayment, setUserPayment] = useState({
        amount: 0,
        createdDate: Timestamp.fromDate(new Date()),
        by: authentication.email,
        saleId: null,
        customerId: customerId,
        date: Timestamp.fromDate(new Date()),
        checkNumber: 0
    })

    const [totalPayments, settotalPayments] = useState(0)
    const [totalFactors, settotalFactors] = useState(0)


    useEffect(() => {
        if (payments && factors) {
            settotalPayments(totalAmountOfAllCustomerPayments(payments));
            settotalFactors(totalAmountOfAllFactors(factors));
        }

    }, [factors, payments])



    useEffect(() => {
        getAllCustomerPayments(customerId).then(res => {
            console.log(res);
            setPayments(res)
        })

        getCustomerFactors(customerId)
            .then(res => {
                setFactors(res)
            })
    }, []);

    const sendNewPaymentToAPI = async () => {
        // Start loading
        dispatch({ type: actionTypes.SET_SMALL_LOADING, payload: true });

        try {
            // Validate payment fields
            if (userPayment.checkNumber <= 0) {
                toast.error(t('checkNumberShouldNotBeZeroOrNegative'));
                return;
            }

            if (userPayment.amount <= 0) {
                toast.error(t('amountShouldNotBeZeroOrNegative'));
                return;
            }

            // Log and send payment
            console.log('Sending payment document:', userPayment);

            await addDoc(paymentsCollectionRef, userPayment);
            console.log('Payment successfully sent to Firestore');

            // Update state after successful addition
            setPayments(prevPayments => [...prevPayments, userPayment]);
            toast.success(t('successfullyAdded'));

            // Close the payment modal
            setShowPaymentModal(false);

        } catch (err) {
            console.error('Error adding payment:', err);
            toast.error(err.message || t('An error occurred while adding payment'));
        } finally {
            // Stop loading
            dispatch({ type: actionTypes.SET_SMALL_LOADING, payload: false });
        }
    };


    console.log(payments);


    const showDeleteModal = (id, index) => {
        dispatch({
            type: actionTypes.SHOW_ASKING_MODAL,
            payload: {
                show: true,
                message: "deleteMessage",
                btnAction: () => deleteCustomerPayment(id, index),
                id: id,
            },
        });
    };




    const deleteCustomerPayment = async (id, index) => {
        console.log(id, index);




    }

    if (!payments) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }

    return (
        <div>
            <div className='full_width input margin_bottom_10'>
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

            </div>


            <Button
                text={t('add') + " " + t('payment')}
                onClick={() => setShowPaymentModal(true)}
            />

            <Modal show={showPaymentModal} modalClose={() => setShowPaymentModal(false)}>
                <div className='display_flex flex_direction_column align_items_center  margin_bottom_10 margin_top_20'>
                    <p className='title margin_top_20 margin_bottom_10'>{t('add')} {t('payment')}</p>
                    <table className='margin_top_20'>
                        <tbody>
                            <tr>
                                <td>{t('number')}: </td>
                                <td>
                                    {payments.length + 1}
                                </td>
                            </tr>
                            <tr>
                                <td>{t('checkNumber')}: </td>
                                <td>
                                    <input type="number" onChange={e => setUserPayment({ ...userPayment, checkNumber: e.target.value })} />
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
                                        // console.log(date);
                                        // console.log(new Date(date));
                                        // console.log(gregorianToJalali(new Date(date)).join('-'));

                                        setUserPayment({
                                            ...userPayment,
                                            date: Timestamp.fromDate(new Date(date))
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
                <p className='title_2'>{t('payments')}</p>
                <table className="full_width custom_table">
                    <thead >
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('checkNumber')}</th>
                            <th>{t('createdDate')}</th>
                            <th>{t('employee')}</th>
                            <th>{t('paidAmount')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments?.map((pay, index) => {
                            return <tr
                                className=" cursor_pointer "
                                key={pay.id}
                            >
                                <td>{index + 1}</td>
                                <td>{pay?.checkNumber}</td>
                                <td>{formatFirebaseDates(pay.date)}</td>
                                <td>{pay.by}</td>
                                <td>{pay.amount}</td>
                                <td>
                                    <Button
                                        icon={ICONS.trash}
                                        onClick={() => showDeleteModal(pay.id, index)}
                                        type={'crossBtn'}
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
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CustomerPayments