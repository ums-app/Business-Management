import { collection } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useStateValue } from '../../../context/StateProvider';
import { t } from 'i18next';
import { db } from '../../../constants/FirebaseConfig';
import Collections from '../../../constants/Collections';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { getAllCustomerPayments, getCustomerFactors, totalAmountOfAllCustomerPayments, totalAmountOfAllFactors } from '../../../Utils/FirebaseTools.ts';
import MoneyStatus from '../../UI/MoneyStatus/MoneyStatus';

function CustomerPaymentsForCustomer() {
    const [{ authentication }, dispatch] = useStateValue()
    const [payments, setPayments] = useState();
    const [factors, setFactors] = useState()
    const [totalPayments, settotalPayments] = useState(0)
    const [totalFactors, settotalFactors] = useState(0)


    useEffect(() => {
        if (payments && factors) {
            settotalPayments(totalAmountOfAllCustomerPayments(payments));
            settotalFactors(totalAmountOfAllFactors(factors));
        }

    }, [factors, payments])



    useEffect(() => {
        getAllCustomerPayments(authentication.originalEntityId).then(res => {
            console.log(res);
            setPayments(res)
        })

        getCustomerFactors(authentication.originalEntityId)
            .then(res => {
                setFactors(res)
            })
    }, []);



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
                            </tr>
                        })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CustomerPaymentsForCustomer