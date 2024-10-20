
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { convertFirebaseDatesToDate, formatFirebaseDates, getMonthsBetweenDates } from '../../../../Utils/DateTimeUtils.js';
import { gregorianToJalali, jalaliToGregorian } from 'shamsi-date-converter';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer.jsx';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate.jsx';
import { t } from 'i18next';
import Menu from '../../../UI/Menu/Menu.jsx';
import Button from '../../../UI/Button/Button.tsx';
import ICONS from '../../../../constants/Icons.js';
import ReactToPrint from 'react-to-print';
import { useStateValue } from '../../../../context/StateProvider.js';
import { actionTypes } from '../../../../context/reducer.js';
import print from '../../../../constants/PrintCssStyles.js';
import { getAllEmployeePayments, sendLog } from '../../../../Utils/FirebaseTools.ts';
import { EmployeePaymentType } from '../../../../constants/Others.js';
import HeadingMenuTemplate from '../../../UI/LoadingTemplate/HeadingMenuTemplate.jsx';
import Modal from '../../../UI/modal/Modal.jsx';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import CustomDatePicker from '../../../UI/DatePicker/CustomDatePicker.jsx';
import { db } from '../../../../constants/FirebaseConfig.js';
import Collections from '../../../../constants/Collections.js';
import { toast } from 'react-toastify';
import { Employee, Log, salaryHistory } from '../../../../Types/Types.ts';

export interface EmployeeSalariesProps {
    data: Employee;
    setData: Function,
}

export interface MonthlySalaries {
    date: Date,
    persianDate: string,
    endDate: Date,
    persianEndDate: string,
    salary: number,
}


const EmployeeSalaries: React.FC<EmployeeSalariesProps> = ({ data, setData }) => {
    const { employeeId } = useParams()
    const [monthlySalaries, setMonthlySalaries] = useState<MonthlySalaries[]>([]);
    const [totalPayments, setTotalPayments] = useState<number>();
    const [totalSalaries, setTotalSalaries] = useState<number>();
    const [{ authentication }, dispatch] = useStateValue()

    let salaryRef: HTMLDivElement | null = null;
    const [updateSalary, setupdateSalary] = useState<salaryHistory>({
        amount: 0,
        date: new Date()
    })
    const [showUpdateSalaryModal, setshowUpdateSalaryModal] = useState(false);



    useEffect(() => {
        calculateMonthlySalaries(data);
        if (employeeId)
            getAllEmployeePayments(employeeId)
                .then(res => {
                    let total = 0;
                    res.filter(item => item.type == EmployeePaymentType.SALARY)
                        .forEach(item => total += item.amount);

                    setTotalPayments(total);
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


    const calculateMonthlySalaries = (employee: Employee) => {
        console.log(employee);

        const currentDate = new Date();

        let joinedDate = convertFirebaseDatesToDate(employee?.joinedDate); // Convert Firestore timestamp to JS date
        const salaryHistory = employee?.salaryHistory || []; // Fallback to an empty array if salaryHistory is undefined
        const totalMonths = getMonthsBetweenDates(joinedDate, currentDate); // Ensure this function is correct

        let salaries: MonthlySalaries[] = [];
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
            const endDate = new Date();
            const nextDate = totalMonths[monthIndex + 1];
            endDate.setFullYear(nextDate.year);
            endDate.setMonth(nextDate.month - 1)
            endDate.setDate(monthStartDate.getDate());

            // Add this month's salary to the list
            salaries.push({
                date: monthStartDate,
                persianDate: gregorianToJalali(monthStartDate).join('/'),
                endDate: endDate,
                persianEndDate: gregorianToJalali(endDate).join('/'),
                salary: applicableSalary,
            });
        }

        setTotalSalaries(total);
        setMonthlySalaries(salaries);
    };

    console.log(monthlySalaries);


    const updateEmployeeSalaryAmount = async () => {
        if (!employeeId) return;
        dispatch({ type: actionTypes.SET_SMALL_LOADING, payload: true });

        try {
            let salaryHistory = data.salaryHistory || [];
            const employeeDoc = doc(db, Collections.Employees, employeeId);

            salaryHistory.push({ ...updateSalary })
            await updateDoc(employeeDoc, {
                ...data,
                salaryHistory: salaryHistory
            });
            setData({
                ...data,
                salaryHistory: salaryHistory
            })

            const log: Log = {
                createdDate: new Date(),
                registrar: `${authentication.name} ${authentication.lastname}`, // Assume you have a way to track the current user
                title: `${t('update')} ${t('salary')}`,
                message: `${t('salary')} [${data.name} ${data.lastName}] ${t('successfullyUpdated')}`,
                data: { ...data }
            };
            await sendLog(log);

            console.log('Employee updated successfully');

            toast.success(t('successfullyUpdated'));
            setshowUpdateSalaryModal(false)
            calculateMonthlySalaries(data);
        } catch (err) {
            console.error(err)
        } finally {
            dispatch({ type: actionTypes.SET_SMALL_LOADING, payload: false });
        }


    }

    const showDeleteModal = (index: number) => {
        dispatch({
            type: actionTypes.SHOW_ASKING_MODAL,
            payload: {
                show: true,
                message: "deleteMessage",
                btnAction: () => deleteSalaryHistory(index),
                id: index,
            },
        });
    };

    const deleteSalaryHistory = async (index: number) => {
        if (!employeeId) return;

        dispatch({ type: actionTypes.SET_SMALL_LOADING, payload: true });
        dispatch({
            type: actionTypes.HIDE_ASKING_MODAL,
        });


        try {
            let salaryHistory = [...data.salaryHistory];
            salaryHistory.splice(index, 1);
            const employeeDoc = doc(db, Collections.Employees, employeeId);
            await updateDoc(employeeDoc, {
                ...data,
                salaryHistory: salaryHistory
            });

            setData({ ...data, salaryHistory: salaryHistory })

            console.log('Employee updated successfully');

            toast.success(t('successfullyUpdated'));
            calculateMonthlySalaries({ ...data, salaryHistory: salaryHistory });
            setshowUpdateSalaryModal(false)
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

            <div className='margin_bottom_10 margin_top_10'>
                <table className='custom_table full_width'>
                    <thead>
                        <tr>
                            <th colSpan={5}>
                                {t('tableSalaryChangesOf')} {data.name} {data.lastName}
                            </th>
                        </tr>
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('date')}</th>
                            <th>{t('previousSalary')}</th>
                            <th>{t('currentSalary')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{1}</td>
                            <td>{formatFirebaseDates(data.joinedDate)}</td>
                            <td>0</td>
                            <td>{data?.salary}</td>
                            <td></td>
                        </tr>
                        {data?.salaryHistory?.map((item, index) => {
                            let prevAmount = data.salary;
                            if (index > 0) {
                                prevAmount = data.salaryHistory[index - 1].amount;
                            }

                            console.log((item));


                            return (
                                <tr key={index}>
                                    <td>{index + 2}</td>
                                    <td>{formatFirebaseDates(item.date)}</td>
                                    <td>{prevAmount}</td>
                                    <td>{item.amount}</td>
                                    <td>
                                        <Button
                                            icon={ICONS.trash}
                                            onClick={() => {
                                                showDeleteModal(index)
                                            }}
                                        />
                                    </td>
                                </tr>

                            )
                        })}

                    </tbody>
                </table>
            </div>

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
                                    {data?.salaryHistory?.length > 0 ?
                                        data.salaryHistory[data?.salaryHistory?.length - 1].amount
                                        :
                                        data.salary}
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
                                    <CustomDatePicker onChange={(e: any) => {
                                        const date: string = jalaliToGregorian(e.year, e.month.number, e.day).join('/')
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
                            btnType={'plusBtn'}
                            onClick={updateEmployeeSalaryAmount}
                        />
                        <Button
                            text={t('cancel')}
                            btnType={'crossBtn'}
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
                            <th colSpan={4}>{t('salaryTableOf')} {data.name} {data.lastName}</th>
                        </tr>
                        <tr>
                            <th rowSpan={2}>{t('number')}</th>
                            <th colSpan={2}>{t('date')}</th>
                            <th rowSpan={2}>{t('salary')}</th>
                            {/* <th></th> */}
                        </tr>

                        <tr>
                            <th>{t('from')}</th>
                            <th>{t('to')}</th>
                        </tr>

                    </thead>
                    <tbody>
                        {monthlySalaries
                            .map((item, index) => {
                                return <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.persianDate}</td>
                                    <td>{item.persianEndDate}</td>
                                    <td>{item.salary}</td>
                                </tr>
                            })}

                        {monthlySalaries?.length == 0 && <tr>
                            <td colSpan={6}>{t('notExist')}</td>
                        </tr>}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default EmployeeSalaries
