
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMonthsBetweenDates } from '../../../../Utils/DateTimeUtils';
import { gregorianToJalali, jalaliToGregorian } from 'shamsi-date-converter';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';
import { t } from 'i18next';
import Menu from '../../../UI/Menu/Menu';
import Button from '../../../UI/Button/Button';
import ICONS from '../../../../constants/Icons';
import ReactToPrint from 'react-to-print';
import { useStateValue } from '../../../../context/StateProvider';
import { actionTypes } from '../../../../context/reducer';
import print from '../../../../constants/PrintCssStyles';
import { getAllEmployeePayments } from '../../../../Utils/FirebaseTools';
import { EmployeePaymentType } from '../../../../constants/Others';
import HeadingMenuTemplate from '../../../UI/LoadingTemplate/HeadingMenuTemplate';
import DatePicker from 'react-multi-date-picker';
import Modal from '../../../UI/modal/Modal';
import { collection, doc, Timestamp, updateDoc } from 'firebase/firestore';
import CustomDatePicker from '../../../UI/DatePicker/CustomDatePicker';
import { db } from '../../../../constants/FirebaseConfig';
import Collections from '../../../../constants/Collections';
import { toast } from 'react-toastify';

function EmployeeSalaries({ data }) {
    const { employeeId } = useParams()
    const [employee, setEmployee] = useState(null);
    const [monthlySalaries, setMonthlySalaries] = useState([]);
    const [totalPayments, setTotalPayments] = useState();
    const [totalSalaries, setTotalSalaries] = useState();
    const [, dispatch] = useStateValue()

    let salaryRef = useRef();
    const [updateSalary, setupdateSalary] = useState({
        amount: 0,
        date: new Date()
    })
    const [showUpdateSalaryModal, setshowUpdateSalaryModal] = useState(false);



    useEffect(() => {
        calculateMonthlySalaries(data);
        getAllEmployeePayments(employeeId)
            .then(res => {
                let total = 0;
                res.filter(item => item.type == EmployeePaymentType.SALARY)
                    .forEach(item => total += item.amount);
                setTotalPayments(total)
            })

    }, [employeeId]);

    // const calculateMonthlySalaries = (employee) => {
    //     const currentDate = new Date();
    //     let joinedDate = new Date(employee.joinedDate.toDate());
    //     joinedDate.setMonth(joinedDate.getMonth() + 1)
    //     const salaryHistory = data?.salaryHistory || [];
    //     const totalMonth = getMonthsBetweenDates(joinedDate, currentDate);


    //     console.log('joinedDate: ', joinedDate);
    //     console.log(salaryHistory);

    //     let salaries = [];
    //     let total = 0

    //     totalMonth.forEach(item => {
    //         const monthStartDate = joinedDate;
    //         let applicableSalary = employee.salary; // Fallback to the latest salary if no history found.


    //         // Find the most recent salary applicable for the current month
    //         for (let i = salaryHistory.length - 1; i >= 0; i--) {
    //             console.log(salaryHistory[i].date?.toDate());

    //             const salaryChangeDate = new Date(salaryHistory[i]?.date?.toDate());
    //             console.log(salaryChangeDate.toDateString() + " <===> " + monthStartDate.toDateString());

    //             if (salaryChangeDate <= monthStartDate) {
    //                 applicableSalary = salaryHistory[i].amount;
    //                 break;
    //             }
    //         }


    //         total += applicableSalary;
    //         // Add this month's salary to the list
    //         salaries.push({
    //             date: item,
    //             persianDate: gregorianToJalali(item.year, item.month, joinedDate.getDate()).join('/'),
    //             // month: Dari,
    //             salary: applicableSalary,
    //         });
    //     })


    //     setTotalSalaries(total)
    //     setMonthlySalaries(salaries);
    // };


    const calculateMonthlySalaries = (employee) => {
        const currentDate = new Date();
        let joinedDate = new Date(employee.joinedDate.toDate()); // Convert Firestore timestamp to JS date
        const salaryHistory = data?.salaryHistory || []; // Fallback to an empty array if salaryHistory is undefined
        const totalMonths = getMonthsBetweenDates(joinedDate, currentDate); // Ensure this function is correct

        console.log('Joined Date: ', joinedDate);
        console.log('Salary History:', salaryHistory);

        let salaries = [];
        let total = 0;

        for (let monthIndex = 0; monthIndex < totalMonths.length; monthIndex++) {
            // Calculate the start date of each month
            let monthStartDate = new Date(joinedDate);
            monthStartDate.setMonth(joinedDate.getMonth() + monthIndex);

            let applicableSalary = employee.salary; // Default to employee's current salary

            // Find the most recent salary change applicable to the month
            for (let i = salaryHistory.length - 1; i >= 0; i--) {
                const salaryChangeDate = new Date(salaryHistory[i]?.date?.toDate());

                if (salaryChangeDate <= monthStartDate) {
                    applicableSalary = salaryHistory[i].amount;
                    break;
                }
            }

            total += applicableSalary;

            // Add this month's salary to the list
            salaries.push({
                date: monthStartDate,
                persianDate: gregorianToJalali(
                    monthStartDate.getFullYear(),
                    monthStartDate.getMonth() + 1, // +1 because JavaScript months are 0-indexed
                    monthStartDate.getDate()
                ).join('/'),
                salary: applicableSalary,
            });
        }

        setTotalSalaries(total);
        setMonthlySalaries(salaries);
    };

    console.log(monthlySalaries);


    const updateEmployeeSalaryAmount = async () => {
        dispatch({ type: actionTypes.SET_SMALL_LOADING, payload: true });
        try {
            let salaryHistory = data.salaryHistory || [];
            const employeeDoc = doc(db, Collections.Employees, employeeId);

            salaryHistory.push({ ...updateSalary })
            await updateDoc(employeeDoc, {
                ...data,
                salaryHistory: salaryHistory
            });

            console.log('Employee updated successfully');

            toast.success(t('successfullyUpdated'));
        } catch (err) {
            console.error(err)
        } finally {
            dispatch({ type: actionTypes.SET_SMALL_LOADING, payload: false });
        }


    }

    if (!data) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }

    console.log(data);



    return (
        <div className='margin_top_20'>

            <div className='display_flex justify_content_space_between '>
                {/* Profile Menu */}
                <Menu >
                    <Button
                        icon={ICONS.pencil}
                        text={t("update") + " " + t('salary')}
                        onClick={() => setshowUpdateSalaryModal(true)}

                    />
                    <ReactToPrint
                        content={() => salaryRef}
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
                        pageStyle={print({ pageSize: "A4", orientation: "portrait" })}
                        documentTitle={t("factor for customer")}
                    />
                </Menu>


            </div>

            <Modal show={showUpdateSalaryModal} modalClose={() => setshowUpdateSalaryModal(false)}>
                <div className='display_flex flex_direction_column align_items_center  margin_bottom_10 margin_top_20'>
                    <h1 className='title margin_top_20'>{t('update')} {t('salary')}</h1>
                    <table className='margin_top_20'>
                        <tbody>
                            <tr>
                                <td>{t('currentSalary')}:</td>
                                <td>
                                    {data.salary}
                                </td>
                            </tr>
                            <tr>
                                <td>{t('amount')}:</td>
                                <td>
                                    <input type="number" onChange={e => setupdateSalary({ ...updateSalary, amount: Number(e.target.value + '') })} />
                                </td>
                            </tr>
                            <tr>
                                <td>{t('date')}:</td>
                                <td>
                                    <CustomDatePicker onChange={e => {
                                        const date = jalaliToGregorian(e.year, e.month.number, e.day)
                                        const gDate = new Date(date);
                                        setupdateSalary({
                                            ...updateSalary,
                                            date: Timestamp.fromDate(gDate)
                                        })
                                    }} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className='margin_top_20'>
                        <Button
                            text={t('update')}
                            type={'plusBtn'}
                            onClick={updateEmployeeSalaryAmount}
                        />
                        <Button
                            text={t('cancel')}
                            type={'crossBtn'}
                            onClick={() => {
                                setupdateSalary({
                                    ...updateSalary,
                                    amount: 0
                                })
                                setshowUpdateSalaryModal(false)
                            }}
                        />
                    </div>
                </div>

            </Modal >

            <div ref={value => salaryRef = value}>
                {totalPayments ?
                    <div className='display_flex input justify_content_space_between '>
                        <div className=' padding_right_10 padding_left_10 border_radius_6 margin_left_10 margin_right_10'>
                            <span>{t('totalAll')}: </span>
                            <span>{totalSalaries}</span>
                        </div>
                        <div className=' padding_right_10 padding_left_10  border_radius_6  margin_left_10 margin_right_10'>
                            <span>{t('paidAmount')}: </span>
                            <span>{totalPayments}</span>
                        </div>

                    </div>
                    :
                    <HeadingMenuTemplate />
                }
                <table className='custom_table full_width' style={{ background: 'transparent' }} >
                    <thead style={{ background: 'orange' }}>
                        <tr>
                            <th colSpan={3}>{t('salaryTableOf')} {data.name} {data.lastName}</th>
                        </tr>
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('date')}</th>
                            <th>{t('salary')}</th>
                            {/* <th></th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {monthlySalaries.map((item, index) => {
                            return <tr >
                                <td>{index + 1}</td>
                                <td>{item.persianDate}</td>
                                <td>{item.salary}</td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default EmployeeSalaries
