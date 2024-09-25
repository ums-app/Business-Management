import { collection, getDocs, query, where } from 'firebase/firestore';
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
import { getAllCustomerPayments, getCustomerFactors, totalAmountOfAllCustomerPayments, totalAmountOfAllFactors } from '../../../../Utils/FirebaseTools';
import Button from '../../../UI/Button/Button';
import Modal from '../../../UI/modal/Modal';
import { jalaliToGregorian } from 'shamsi-date-converter';
import CustomDatePicker from '../../../UI/DatePicker/CustomDatePicker';

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
        createdDate: new Date(),
        by: authentication.email,
        saleId: null,
        customerId: customerId,
        date: new Date()
    })



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

    }


    console.log(payments);

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
                                <td>{totalAmountOfAllFactors(factors)}</td>
                                <td>{totalAmountOfAllCustomerPayments(payments)}</td>
                                <td>{(totalAmountOfAllFactors(factors) - totalAmountOfAllCustomerPayments(payments))}</td>
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
                <div className='display_flex flex_direction_column align_items_center'>
                    <p className='title margin_top_20 margin_bottom_10'>{t('add')} {t('payment')}</p>
                    <div className='margin_top_20 margin_bottom_10  padding_10'>
                        <span className='info_value'>{t('paidAmount')}</span>
                        <span className='info_value'>
                            <input type="number" onChange={e => setUserPayment({ ...userPayment, amount: Number(e.target.value + "") })} />
                        </span>
                    </div>
                    <div className='margin_top_10 margin_bottom_10  padding_10'>
                        <span className='info_value'>{t('date')}: </span>
                        <span className='info_value short_date'>
                            <CustomDatePicker onChange={e => {
                                const date = jalaliToGregorian(e.year, e.month.number, e.day)
                                const gDate = new Date();
                                gDate.setFullYear(date[0])
                                gDate.setMonth(date[1])
                                gDate.setDate(date[2]);
                                setUserPayment({
                                    ...userPayment,
                                    date: gDate
                                })
                            }} />
                        </span>
                    </div>
                    <div>
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
                <table className="full_width custom_table table_row_hover">
                    <thead >
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('createdDate')}</th>
                            <th>{t('employee')}</th>
                            <th>{t('paidAmount')}</th>
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