import React, { useEffect, useRef, useState } from 'react'
import { getAllCustomerPayments, getAllPayments, getCustomerFactors, getCustomers, getFactors, totalAmountOfAllCustomerPayments, totalAmountOfAllFactors } from '../../../Utils/FirebaseTools';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils';
import { t } from 'i18next';
import { gregorianToJalali } from 'shamsi-date-converter';
import { actionTypes } from '../../../context/reducer';
import Button from '../../UI/Button/Button';
import print from '../../../constants/PrintCssStyles';
import { useStateValue } from '../../../context/StateProvider';
import ReactToPrint from 'react-to-print';
import ICONS from '../../../constants/Icons';
import "./ShortListedCustomers.css"
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';

function ShortListedCustomers() {
    const [, dispatch] = useStateValue()
    const [customers, setCustomers] = useState();
    const [payments, setpayments] = useState();
    const [factors, setFactors] = useState();
    const [shortListOfCustomers, setshortListOfCustomers] = useState([]);
    let shortListRef = useRef();

    useEffect(() => {
        getCustomers().then(res => {
            setCustomers(res)
        })

        getAllPayments().then(res => {
            setpayments(res)
        })

        getFactors().then(res => {
            setFactors(res)
        })

    }, [])

    console.log(customers, payments, factors);

    useEffect(() => {
        if (customers && payments && factors) {
            console.log('short list added');
            shortListTheCustomer();

        }


    }, [customers, payments, factors])


    console.log(shortListOfCustomers);


    const shortListTheCustomer = () => {
        const list = [];
        customers?.map(customer => {
            const pays = payments.filter(item => item.customerId == customer.id)
                .sort((a, b) => b.createdDate - a.createdDate);

            const facs = factors.filter(item => item?.customer.id == customer.id)
                .sort((a, b) => b.createdDate - a.createdDate);
            ;
            const totalPayments = totalAmountOfAllCustomerPayments(pays);

            const totalAmountOfFactors = totalAmountOfAllFactors(facs);
            const remained = totalAmountOfFactors - totalPayments;
            console.log('name: ', customer.name, pays);
            console.log('name: ', customer.name + " " + customer.lastName, 'totalPayments: ', totalPayments, 'totalamountofFactors: ', totalAmountOfFactors, 'remained: ', remained);


            if (remained > 0) {
                list.push({
                    name: customer.name,
                    lastName: customer.lastName,
                    customerLocation: customer.location,
                    customerPhoneNumber: customer.phoneNumber,
                    lastPurchaseDate: formatFirebaseDates(facs[0]?.createdDate),
                    lastPurchaseAmount: totalAmountOfAllFactors([facs[0]]),
                    lastPaymentDate: pays[0]?.createdDate && formatFirebaseDates(pays[0]?.createdDate),
                    lastPaymentAmount: pays[0]?.amount && pays[0]?.amount,
                    remainedAmount: remained
                })
            }
        })

        setshortListOfCustomers(list);

    }

    if (!customers || !payments || !factors) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>

    }

    return (
        <div>

            <ReactToPrint
                content={() => shortListRef}
                trigger={() => <Button text={t("print")} icon={ICONS.printer} />}
                copyStyles={true}
                onBeforePrint={() => {
                    dispatch({
                        type: actionTypes.SET_GLOBAL_LOADING,
                        payload: {
                            value: true,
                        },
                    });
                }}
                onAfterPrint={() => {
                    dispatch({
                        type: actionTypes.SET_GLOBAL_LOADING,
                        payload: {
                            value: false,
                        },
                    });
                }}
                pageStyle={print({ pageSize: "A4", orientation: "landscape" })}
                documentTitle={t("customerListTitleForShortList")}
            />

            <div ref={(value) => shortListRef = value} className='customers_list'>
                <div className='full_width display_flex flex_direction_column align_items_center'>
                    <p className='title'>{t('customerListTitleForShortList')}</p>
                    <div className='bold full_width display_flex justify_content_end'>
                        <span>{t('date')}:</span>
                        <span className='info_value'>{gregorianToJalali(new Date()).join('/')}</span>
                    </div>
                </div>
                <table className='custom_table full_width'>
                    <thead >
                        <tr style={{ backgroundColor: '#f744e2' }}>
                            <th rowSpan={2}>{t('number')}</th>
                            <th colSpan={2}>{t('nameAndLastName')}</th>
                            <th rowSpan={2}>{t('location')}</th>
                            <th colSpan={2}>{t('lastPurchaseFactor')}</th>
                            <th rowSpan={2}>{t('phoneNumber')}</th>
                            <th colSpan={2}>{t('lastPayment')}</th>
                            <th rowSpan={2}>{t('remainedAmount')}</th>
                            <th th rowSpan={2} > {t('currentAmount')}</th>
                        </tr>
                        <tr style={{ backgroundColor: '#f744e2' }}>
                            <th>{t('name')}</th>
                            <th>{t('lastName')}</th>
                            <th >{t('amount')}</th>
                            <th >{t('date')}</th>
                            <th >{t('amount')}</th>
                            <th>{t('date')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shortListOfCustomers.map((item, index) => {
                            return (
                                <tr style={{ height: '30px' }} key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.name}</td>
                                    <td>{item.lastName}</td>
                                    <td>{item.customerLocation}</td>
                                    <td>{item.lastPurchaseAmount}</td>
                                    <td>{item.lastPurchaseDate}</td>
                                    <td>{item.customerPhoneNumber}</td>
                                    <td>{item?.lastPaymentAmount}</td>
                                    <td>{item?.lastPaymentDate}</td>
                                    <td>{item.remainedAmount}</td>
                                    <td></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ShortListedCustomers