
import React, { useEffect, useState } from 'react'
import { useStateValue } from '../../../context/StateProvider.js';
import { t } from 'i18next';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer.jsx';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate.jsx';
import { getAllEmployeePayments, getAllVisitorFactors, getCustomerPaymentByCustomerIds, getEmployeeById } from '../../../Utils/FirebaseTools.ts';
import { EmployeePaymentType } from '../../../constants/Others.js';
import { convertFirebaseDatesToDate, formatFirebaseDates, getMonthsBetweenDates } from '../../../Utils/DateTimeUtils.js';
import HeadingMenuTemplate from '../../UI/LoadingTemplate/HeadingMenuTemplate.jsx';
import { CustomerFactor, CustomerPayment, Employee, EmployeePayment } from '../../../Types/Types.ts';
import { FactorType } from '../../../constants/FactorStatus.js';
import MoneyStatus from '../../UI/MoneyStatus/MoneyStatus.jsx';
import HeadingLoadingTemplate from '../../UI/LoadingTemplate/HeadingLoadingTemplate.jsx';


const EmployeePaymentsForEmployee = () => {
    const [{ authentication }, dispatch] = useStateValue()
    const [payments, setPayments] = useState<EmployeePayment[]>([]);
    const [allFactors, setallFactors] = useState<CustomerFactor[]>([]);
    const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([])
    const [loading, setLoading] = useState<boolean>(false)


    const [totalAmount, setTotalAmount] = useState({
        totalAmountOfAllFactors: 0,
        totalAmountOfShareFromSales: 0,
        totalAmountOfCustomerPaid: 0,
        totalAmountSalaries: 0,
        totalAmountPaymentForSalaries: 0,
        totalAmountPaymentForSales: 0,
        totalWidrawableAmount: 0,
        ready: false
    })
    const [employee, setEmployee] = useState<Employee>()

    useEffect(() => {
        // get the employee all payment which we paid to him but the sales payment
        getAllEmployeePayments(authentication.originalEntityId).then(res => {
            setPayments(res)
        })

        getAllVisitorFactors(authentication.originalEntityId)
            .then(res => {
                setallFactors(res)

            }).catch(err => {
                setallFactors([])
            })

        getEmployeeById(authentication.originalEntityId)
            .then(res => {
                setEmployee(res)
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
                    setCustomerPayments(res)
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [allFactors]);

    useEffect(() => {
        calculateTotalAmount(payments, allFactors, customerPayments, employee)
    }, [allFactors, payments, employee, customerPayments])

    // calculate total payments of the employee
    const calculateTotalAmount = (pays: EmployeePayment[], customerFactors: CustomerFactor[], customerPayments: CustomerPayment[], employee: Employee) => {
        console.log('calculate func', pays, customerFactors, customerPayments, employee);

        let totalPaidForSales = 0;
        let totalPaidForSalaries = 0;
        pays.forEach(pay => {
            if (pay.type == EmployeePaymentType.SALES) {
                totalPaidForSales += Number(pay.amount);
            } else if (pay.type == EmployeePaymentType.SALARY) {
                totalPaidForSalaries += Number(pay.amount);
            }
        })
        let totalAmountOfFactors = 0;
        let totalShareOfEmployee = 0
        customerFactors.forEach(fac => {
            totalAmountOfFactors += Number(fac.totalAll)
            totalShareOfEmployee += fac.visitorAccount ? fac?.visitorAccount?.visitorAmount : 0;
        })
        let totalAmountOfCustomerPaid = 0;
        customerPayments.forEach(cp => {
            totalAmountOfCustomerPaid += Number(cp.amount)
        })


        setTotalAmount({
            totalAmountOfAllFactors: totalAmountOfFactors,
            totalAmountPaymentForSalaries: totalPaidForSalaries,
            totalAmountPaymentForSales: totalPaidForSales,
            totalAmountOfCustomerPaid: totalAmountOfCustomerPaid,
            totalAmountOfShareFromSales: totalShareOfEmployee,
            totalAmountSalaries: employee ? calculateMonthlySalaries(employee) : 0,
            totalWidrawableAmount: calculateWithdrawableAmount(totalAmountOfCustomerPaid, totalShareOfEmployee, totalAmountOfFactors, totalPaidForSales),
            ready: (customerPayments && employee && pays && allFactors) ? true : false

        })
        setLoading(false)
    }

    const calculateWithdrawableAmount = (totalCustomersPaid: number, totalShareOfEmployee: number, totalAmountOfAllFactors: number, totalPaidForSales: number) => {
        // console.log('totalCusPaid:', totalCustomersPaid, ' totalshareOdEMp: ', totalShareOfEmployee, " totalAmountOfALLFac: ", totalAmountOfAllFactors)
        if (totalAmountOfAllFactors == 0) return 0
        return ((totalCustomersPaid * totalShareOfEmployee) / totalAmountOfAllFactors) - totalPaidForSales;
    }


    const calculateMonthlySalaries = (employee: Employee) => {
        // console.log(employee);

        const currentDate = new Date();

        let joinedDate = convertFirebaseDatesToDate(employee?.joinedDate); // Convert Firestore timestamp to JS date
        const salaryHistory = employee?.salaryHistory || []; // Fallback to an empty array if salaryHistory is undefined
        const totalMonths = getMonthsBetweenDates(joinedDate, currentDate); // Ensure this function is correct

        let total = 0;

        for (let monthIndex = 0; monthIndex < totalMonths.length - 1; monthIndex++) {
            // Calculate the start date of each month
            let monthStartDate = new Date(joinedDate);
            monthStartDate.setMonth(monthStartDate?.getMonth() + monthIndex);
            let applicableSalary = employee.salary; // Default to employee's current salary
            // Find the most recent salary change applicable to the month
            for (let i = salaryHistory.length - 1; i >= 0; i--) {
                const salaryChangeDate = convertFirebaseDatesToDate(salaryHistory[i]?.date);
                if (salaryChangeDate <= monthStartDate) {
                    applicableSalary = salaryHistory[i].amount;
                    monthStartDate.setDate(convertFirebaseDatesToDate(salaryHistory[i].date).getDate())
                    break;
                }
            }
            total += Number(applicableSalary);

        }
        console.log('salari: ', total);

        return total;
    };

    // console.log(totalAmount);


    if (!employee) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }

    return (
        <div>

            <div className='full_width input margin_bottom_10'>
                {/* <p className='title_2'>{t('status')}</p> */}
                <div>
                    <table className='custom_table full_width'>
                        <thead>
                            <tr style={{ background: 'orange' }}>
                                <th colSpan={7}>{t('status')} {t('sales')}</th>
                            </tr>
                            <tr style={{ background: 'orange' }}>
                                <th>{t('totalAll')} {t('sales')}</th>
                                <th>{t('shareOfSales')}</th>
                                <th>{t('payments')} {t('customers')} </th>
                                <th>{t('remainedAmountOfCustomers')}</th>
                                <th>{t('withdrawableAmount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!totalAmount.ready ? <tr><td colSpan={7}>{<HeadingLoadingTemplate />}</td></tr> :
                                <tr>
                                    {/* <td>{allFactors.length}</td> */}
                                    <td>
                                        {totalAmount.totalAmountOfAllFactors.toFixed(2)}
                                    </td>
                                    <td>
                                        {totalAmount.totalAmountOfShareFromSales.toFixed(2)}
                                    </td>
                                    <td>
                                        {totalAmount.totalAmountOfCustomerPaid}
                                    </td>
                                    <td>
                                        {totalAmount.totalAmountOfAllFactors - totalAmount.totalAmountOfCustomerPaid}
                                    </td>
                                    <td>
                                        {Math.abs(totalAmount.totalWidrawableAmount).toFixed(2)}
                                        <MoneyStatus number={totalAmount.totalWidrawableAmount * -1} />
                                    </td>

                                </tr>
                            }
                        </tbody>
                    </table>
                    <table className='custom_table full_width'>
                        <thead>
                            <tr style={{ background: 'orange' }}>
                                <th colSpan={7}>{t('status')} {t('salary')} </th>
                            </tr>
                            <tr style={{ background: 'orange' }}>
                                <th>{t('collection')} {t('salaries')}</th>
                                <th>{t('totalPaymentForSalary')}</th>
                                <th>{t('result')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!totalAmount.ready ? <tr><td colSpan={3}>{<HeadingLoadingTemplate />}</td></tr> :
                                <tr>
                                    {/* <td>{allFactors.length}</td> */}
                                    <td>{totalAmount.totalAmountSalaries.toFixed(2)}</td>
                                    <td>{totalAmount.totalAmountPaymentForSalaries.toFixed(2)}</td>
                                    <td>
                                        {Math.abs(totalAmount.totalAmountSalaries - totalAmount.totalAmountPaymentForSalaries).toFixed(2)}
                                        <MoneyStatus number={totalAmount.totalAmountSalaries - totalAmount.totalAmountPaymentForSalaries} />
                                    </td>
                                </tr>
                            }
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
                            <span className='bullet bold' style={{ fontSize: '14px' }}>{totalAmount.totalAmountPaymentForSalaries} {t('af')}</span>
                        </div>
                        <div className=' padding_right_10 padding_left_10  border_radius_6  margin_left_10 margin_right_10'>
                            <span className='bold'>{t('totalPaymentForSales')}: </span>
                            <span className='bullet bold' style={{ fontSize: '14px' }}>{totalAmount.totalAmountPaymentForSales} {t('af')}</span>
                        </div>

                    </div>
                    :
                    <HeadingMenuTemplate />
                }
                <table className="full_width custom_table table_row_hover">
                    <thead >
                        <tr><th colSpan={5}>{t('receipts')}</th></tr>
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