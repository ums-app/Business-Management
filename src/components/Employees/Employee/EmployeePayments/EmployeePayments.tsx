import { addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useStateValue } from '../../../../context/StateProvider.js';
import { t } from 'i18next';
import { db } from '../../../../constants/FirebaseConfig.js';
import Collections from '../../../../constants/Collections.js';
import { useNavigate, useParams } from 'react-router-dom';
import ICONS from '../../../../constants/Icons.js';
import { actionTypes } from '../../../../context/reducer.js';
import { convertFirebaseDatesToDate, formatFirebaseDates, getMonthsBetweenDates } from '../../../../Utils/DateTimeUtils.js';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer.jsx';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate.jsx';
import { getAllCustomerPayments, getAllEmployeePayments, getAllVisitorFactors, getCustomerFactors, getCustomerPaymentByCustomerIds, getEmployeeById, sendLog, totalAmountOfAllCustomerPayments, totalAmountOfAllFactors } from '../../../../Utils/FirebaseTools.ts';
import Button from '../../../UI/Button/Button.tsx';
import Modal from '../../../UI/modal/Modal.jsx';
import { jalaliToGregorian } from 'shamsi-date-converter';
import CustomDatePicker from '../../../UI/DatePicker/CustomDatePicker.jsx';
import { toast } from 'react-toastify';
import MoneyStatus from '../../../UI/MoneyStatus/MoneyStatus.jsx';
import { Tooltip } from 'react-tooltip';
import { EmployeePaymentType } from '../../../../constants/Others.js';
import { CustomerFactor, CustomerPayment, Employee, EmployeePayment } from '../../../../Types/Types.ts';
import { FactorType } from '../../../../constants/FactorStatus.js';
import HeadingLoadingTemplate from '../../../UI/LoadingTemplate/HeadingLoadingTemplate.jsx';
import BtnTypes from '../../../../constants/BtnTypes.js';

function EmployeePayments(): React.FC {
    const [{ authentication }, dispatch] = useStateValue()
    const { employeeId } = useParams();
    const [payments, setPayments] = useState<EmployeePayment[]>([]);
    const paymentsCollectionRef = collection(db, Collections.EmployeePayments);
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    const [allFactors, setallFactors] = useState<CustomerFactor[]>([]);
    const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([])
    const [loading, setLoading] = useState<boolean>(false)


    // this is for tracking all user payments
    const [userPayment, setUserPayment] = useState({
        amount: 0,
        createdDate: Timestamp.fromDate(new Date()),
        by: `${authentication.name} ${authentication.lastname}`,
        employeeId: employeeId,
        date: Timestamp.fromDate(new Date()),
        type: EmployeePaymentType.SALARY
    })


    useEffect(() => {
        if (employeeId)
            getAllEmployeePayments(employeeId).then(res => {
                console.log(res);
                setPayments(res)
            })

    }, []);


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
        if (!employeeId) return;
        // get the employee all payment which we paid to him but the sales payment
        getAllEmployeePayments(employeeId).then(res => {
            setPayments(res)
        })

        getAllVisitorFactors(employeeId)
            .then(res => {
                setallFactors(res)

            }).catch(err => {
                setallFactors([])
            })

        getEmployeeById(employeeId)
            .then(res => {
                setEmployee(res)
            })
    }, [employeeId]);


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

            const log = {
                createdDate: new Date(),
                registrar: `${authentication.name} ${authentication.lastname}`, // Assume you have a way to track the current user
                title: `${t('add')} ${t('payment')} ${t('of')} ${t('employee')}`,
                message: `${t('payment')} [${employee?.name} ${employee?.lastName} : ${t('amount')}:(${userPayment.amount})] ${t('successfullyAdded')}`,
                data: { ...userPayment, id: added.id }
            };
            await sendLog(log);

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

    const showDeleteModal = (id: string, index: number) => {
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

    const handleDeletePayment = async (id: string, index: number) => {
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
            const log = {
                createdDate: new Date(),
                registrar: `${authentication.name} ${authentication.lastname}`, // Assume you have a way to track the current user
                title: `${t('delete')} ${t('payment')}  ${t('of')} ${t('employee')}`,
                message: `${t('payment')} [${employee?.name} ${employee?.lastName} : ${t('amount')}:(${payments[index].amount})] ${t('successfullyDeleted')}`,
                data: { ...payments[index], id: id }
            };
            await sendLog(log);
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

            <div className='full_width input margin_bottom_10'>
                {/* <p className='title_2'>{t('status')}</p> */}
                <div>
                    <table className='custom_table full_width'>
                        <thead>
                            <tr style={{ background: 'orange' }}>
                                <th colSpan={7}>{t('status')}</th>
                            </tr>
                            <tr style={{ background: 'orange' }}>
                                <th>{t('collection')} {t('salaries')}</th>
                                <th>{t('totalPaymentForSalary')}</th>
                                <th>{t('remainedSalari')}</th>
                                <th>{t('shareOfSales')}</th>
                                {/* <th>{t('payments')} {t('customers')} </th> */}
                                <th>{t('totalPaymentForSales')}</th>
                                <th>{t('withdrawableAmount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!totalAmount.ready ? <tr><td colSpan={7}>{<HeadingLoadingTemplate />}</td></tr> :
                                <tr>
                                    {/* salari */}
                                    <td>{totalAmount.totalAmountSalaries.toFixed(2)}</td>
                                    <td>{totalAmount.totalAmountPaymentForSalaries.toFixed(2)}</td>
                                    <td>
                                        {Math.abs(totalAmount.totalAmountSalaries - totalAmount.totalAmountPaymentForSalaries).toFixed(2)}
                                        <MoneyStatus number={(totalAmount.totalAmountSalaries - totalAmount.totalAmountPaymentForSalaries) * -1} />
                                    </td>
                                    {/* sales*/}

                                    <td>
                                        {totalAmount.totalAmountOfShareFromSales.toFixed(2)}
                                    </td>
                                    <td>
                                        {totalAmount.totalAmountPaymentForSales}
                                    </td>
                                    <td>
                                        {Math.abs(totalAmount.totalWidrawableAmount).toFixed(2)}
                                        <MoneyStatus number={totalAmount.totalWidrawableAmount * -1} />
                                    </td>

                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <Button
                text={t('add') + " " + t('receipt')}
                onClick={() => setShowPaymentModal(true)}
                btnType='button_modern'
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
                                    <CustomDatePicker
                                        onChange={e => {
                                            const dateArray = jalaliToGregorian(e.year, e.month.number, e.day);

                                            // Ensure leading zeros for month and day
                                            const year = dateArray[0];
                                            const month = String(dateArray[1]).padStart(2, '0');
                                            const day = String(dateArray[2]).padStart(2, '0');

                                            // ISO format: YYYY-MM-DD
                                            const dateString = `${year}-${month}-${day}T00:00:00Z`;
                                            const date = new Date(dateString);

                                            console.log("Converted Date:", date); // Log for debugging

                                            // Validate the date
                                            if (isNaN(date.getTime())) {
                                                console.error("Invalid Date after conversion:", date);
                                                toast.error(t('Invalid Date Detected'));
                                                return;
                                            }

                                            // If the date is valid, store it in the Firebase Timestamp
                                            setUserPayment({
                                                ...userPayment,
                                                date: Timestamp.fromDate(date) // Ensure it's in the correct format
                                            });
                                        }}
                                    />

                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className='margin_top_20 display_flex'>
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
                            <th>{t('registrar')}</th>
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
                                <td>{formatFirebaseDates(pay.date)}</td>
                                <td>{pay.by}</td>
                                <td>{pay.amount}</td>
                                <td>{pay.type == EmployeePaymentType.SALARY ? t('salary') : t('sales')}</td>
                                <td>
                                    <Button
                                        text={t('delete')}
                                        onClick={() => showDeleteModal(pay.id, index)}
                                        btnType={BtnTypes.danger}
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