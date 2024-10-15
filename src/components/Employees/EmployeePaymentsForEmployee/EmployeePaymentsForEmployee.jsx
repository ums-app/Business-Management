
import React, { useEffect, useState } from 'react'
import { useStateValue } from '../../../context/StateProvider';
import { t } from 'i18next';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { getAllEmployeePayments } from '../../../Utils/FirebaseTools.ts';
import { EmployeePaymentType } from '../../../constants/Others';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils.js';
import HeadingMenuTemplate from '../../UI/LoadingTemplate/HeadingMenuTemplate.jsx';


function EmployeePaymentsForEmployee() {
    const [{ authentication }, dispatch] = useStateValue()
    const [payments, setPayments] = useState();
    const [totalAmount, settotalAmount] = useState({
        totalAmountOfSalary: 0,
        totalAmountofSales: 0
    })

    useEffect(() => {
        getAllEmployeePayments(authentication.originalEntityId).then(res => {
            console.log(res);
            setPayments(res)
            calculateTotals(res)
        })

    }, []);

    const calculateTotals = (pays) => {
        let totalSalary = 0;
        let totalSales = 0;

        pays.forEach(pay => {
            if (pay.type == EmployeePaymentType.SALARY) {
                totalSalary += Number(pay.amount);
            } else if (pay.type == EmployeePaymentType.SALES) {
                totalSales += Number(pay.amount)
            }
        })
        settotalAmount({
            totalAmountOfSalary: totalSalary,
            totalAmountofSales: totalSales
        })
    }


    console.log(payments);

    if (!payments) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }

    return (
        <div>


            <div className='table_container margin_top_20 input'>
                <p className='title_2'>{t('receipts')}</p>
                {totalAmount ?
                    <div className='display_flex input justify_content_space_between '>
                        <div className=' padding_right_10 padding_left_10 border_radius_6 margin_left_10 margin_right_10'>
                            <span className='bold'>{t('totalPaymentForSalary')}: </span>
                            <span className='bullet bold' style={{ fontSize: '14px' }}>{totalAmount.totalAmountOfSalary} {t('af')}</span>
                        </div>
                        <div className=' padding_right_10 padding_left_10  border_radius_6  margin_left_10 margin_right_10'>
                            <span className='bold'>{t('totalPaymentForSales')}: </span>
                            <span className='bullet bold' style={{ fontSize: '14px' }}>{totalAmount.totalAmountofSales} {t('af')}</span>
                        </div>

                    </div>
                    :
                    <HeadingMenuTemplate />
                }
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