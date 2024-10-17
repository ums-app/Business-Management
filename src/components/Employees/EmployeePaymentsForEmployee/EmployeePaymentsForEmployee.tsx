
import React, { useEffect, useState } from 'react'
import { useStateValue } from '../../../context/StateProvider.js';
import { t } from 'i18next';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer.jsx';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate.jsx';
import { getAllEmployeePayments, getAllVisitorFactors, getCustomerPaymentByCustomerIds } from '../../../Utils/FirebaseTools.ts';
import { EmployeePaymentType } from '../../../constants/Others.js';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils.js';
import HeadingMenuTemplate from '../../UI/LoadingTemplate/HeadingMenuTemplate.jsx';
import { CustomerFactor, EmployeePayment } from '../../../Types/Types.ts';
import ButtonLoadingTemplate from '../../UI/LoadingTemplate/ButtonLoadingTemplate.jsx';
import { FactorType } from '../../../constants/FactorStatus.js';
import MoneyStatus from '../../UI/MoneyStatus/MoneyStatus.jsx';


const EmployeePaymentsForEmployee = () => {
    const [{ authentication }, dispatch] = useStateValue()
    const [payments, setPayments] = useState<EmployeePayment[]>();
    const [allFactors, setallFactors] = useState<CustomerFactor[]>([]);
    const [loading, setLoading] = useState<boolean>(false)
    const [totalAmount, settotalAmount] = useState({
        totalAmountOfSalary: 0,
        totalAmountofSales: 0
    })
    const [totalShareOfEmployee, setTotalShareOfEmployee] = useState<number>(0)
    const [totalAmountOfAllFactors, setTotalAmountOfAllFactors] = useState<number>(0)
    const [totalCustomersPaid, setTotalCustomersPaid] = useState<number>(0);

    useEffect(() => {
        getAllEmployeePayments(authentication.originalEntityId).then(res => {
            console.log(res);
            setPayments(res)
            calculateTotals(res)

        })

        getAllVisitorFactors(authentication.originalEntityId)
            .then(res => {
                getTotalAmountOfFactors(res);
                setallFactors(res)

            }).catch(err => {
                setallFactors([])
            })

    }, []);


    useEffect(() => {
        if (allFactors) {
            setLoading(true);

            // Use Array.from to ensure compatibility across all browsers (including Safari)
            const ids: string[] = Array.from(
                new Set(
                    allFactors
                        .filter(item => item.type === FactorType.STANDARD_FACTOR)
                        .map(item => item.customer.id)
                )
            );

            getCustomerPaymentByCustomerIds(ids)
                .then(res => {
                    console.log(res);
                    let total = 0;
                    res.forEach(item => total += item.amount);
                    setTotalCustomersPaid(total);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [allFactors]);


    const getTotalAmountOfFactors = (factors: CustomerFactor[]) => {
        let total = 0;
        let totalShareOfEmployee = 0
        if (factors) {
            factors.forEach(item => {
                total += item.totalAll;
                console.log("factor: ", item);
                totalShareOfEmployee += item.visitorAccount ? item?.visitorAccount?.visitorAmount : 0;
            })
        }
        // console.log('totalamount ofAllFactor: ', total);
        // console.log('total share of employee: ', totalShareOfEmployee);

        setTotalAmountOfAllFactors(total);
        setTotalShareOfEmployee(totalShareOfEmployee);

    }
    const calculateTotals = (pays: EmployeePayment[]) => {
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


    const calculateWithdrawableAmount = () => {
        // console.log('totalCusPaid:', totalCustomersPaid, ' totalshareOdEMp: ', totalShareOfEmployee, " totalAmountOfALLFac: ", totalAmountOfAllFactors)
        if (totalAmountOfAllFactors == 0) return 0
        return (totalCustomersPaid * totalShareOfEmployee) / totalAmountOfAllFactors;
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
                    <table className='custom_table full_width'>
                        <thead>
                            <tr style={{ background: 'orange' }}>
                                <th colSpan={6}>{t('sales')}</th>
                            </tr>
                            <tr style={{ background: 'orange' }}>
                                <th>{t('total')} {t('sales')}</th>
                                <th>{t('totalAll')} {t('sales')}</th>
                                <th>{t('shareOfSales')}</th>
                                <th>{t('payments')} {t('customers')} </th>
                                <th>{t('withdrawableAmount')}</th>
                                <th>{t('remainedAmountOfCustomers')}</th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr>
                                <td>{allFactors.length}</td>
                                <td>{totalAmountOfAllFactors.toFixed(2)}</td>
                                <td>{totalShareOfEmployee.toFixed(2)}</td>
                                <td>
                                    {loading ? <ButtonLoadingTemplate /> :
                                        totalCustomersPaid.toFixed(2)}
                                </td>
                                <td>
                                    {Math.abs(calculateWithdrawableAmount() - totalAmount.totalAmountofSales).toFixed(2)}
                                    <MoneyStatus number={calculateWithdrawableAmount() - totalAmount.totalAmountofSales > 0 ? -1 : calculateWithdrawableAmount() - totalAmount.totalAmountofSales == 0 ? 0 : 1} />
                                </td>
                                <td>
                                    {loading ? <ButtonLoadingTemplate /> :
                                        <>
                                            {Math.abs(totalAmountOfAllFactors - totalCustomersPaid).toFixed(2)}
                                            <MoneyStatus number={totalAmountOfAllFactors - totalCustomersPaid} />
                                        </>}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

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