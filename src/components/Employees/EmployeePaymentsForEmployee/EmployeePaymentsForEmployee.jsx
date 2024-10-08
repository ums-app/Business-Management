
import React, { useEffect, useState } from 'react'
import { useStateValue } from '../../../context/StateProvider';
import { t } from 'i18next';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { getAllEmployeePayments } from '../../../Utils/FirebaseTools.ts';
import { EmployeePaymentType } from '../../../constants/Others';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils.js';


function EmployeePaymentsForEmployee() {
    const [{ authentication }, dispatch] = useStateValue()
    const [payments, setPayments] = useState();

    useEffect(() => {
        getAllEmployeePayments(authentication.originalEntityId).then(res => {
            console.log(res);
            setPayments(res)
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
                        </tr>
                    </thead>
                    <tbody>
                        {payments?.map((pay, index) => {
                            console.log(pay.createdDate);
                            return <tr
                                className=" cursor_pointer hover"
                                key={pay.id}
                            >
                                <td>{index + 1}</td>
                                <td>{formatFirebaseDates(pay.date)}</td>
                                <td>{pay.by}</td>
                                <td>{pay.amount}</td>
                                <td>{pay.type == EmployeePaymentType.SALARY ? t('salary') : t('sales')}</td>
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

export default EmployeePaymentsForEmployee