
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { convertFirebaseDatesToDate, formatFirebaseDates, getMonthsBetweenDates } from '../../../Utils/DateTimeUtils.js';
import { gregorianToJalali, jalaliToGregorian } from 'shamsi-date-converter';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer.jsx';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate.jsx';
import { t } from 'i18next';
import Menu from '../../UI/Menu/Menu.jsx';
import Button from '../../UI/Button/Button.tsx';
import ICONS from '../../../constants/Icons.js';
import ReactToPrint from 'react-to-print';
import { actionTypes } from '../../../context/reducer.js';
import print from '../../../constants/PrintCssStyles.js';
import { getAllEmployeePayments, getEmployeeById } from '../../../Utils/FirebaseTools.ts';
import { EmployeePaymentType } from '../../../constants/Others.js';
import HeadingMenuTemplate from '../../UI/LoadingTemplate/HeadingMenuTemplate.jsx';
import Modal from '../../UI/modal/Modal.jsx';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker.jsx';
import { db } from '../../../constants/FirebaseConfig.js';
import Collections from '../../../constants/Collections.js';
import { toast } from 'react-toastify';
import { Employee, salaryHistory } from '../../../Types/Types.ts';
import { useStateValue } from '../../../context/StateProvider.js';
import NotFound from '../../../pages/NotFound/NotFound.jsx';
import MoneyStatus from '../../UI/MoneyStatus/MoneyStatus.jsx';

interface EmployeeSalariesProps {
    data: Employee;
    setData: Function,
}

interface MonthlySalaries {
    date: Date,
    persianDate: string,
    endDate: Date,
    persianEndDate: string,
    salary: number,
}


const EmployeeSalariesForEmployee: React.FC<EmployeeSalariesProps> = () => {
    const [monthlySalaries, setMonthlySalaries] = useState<MonthlySalaries[]>([]);
    const [totalPayments, setTotalPayments] = useState<number>(0);
    const [totalSalaries, setTotalSalaries] = useState<number>(0);
    const [{ authentication }, dispatch] = useStateValue()
    const [data, setdata] = useState<Employee>()
    const [notFound, setNotFound] = useState<boolean>(false)

    let salaryRef: HTMLDivElement | null = null;
    const [showUpdateSalaryModal, setshowUpdateSalaryModal] = useState(false);



    useEffect(() => {
        getEmployeeById(authentication.originalEntityId)
            .then(res => {
                if (res) {
                    setdata(res)
                    calculateMonthlySalaries(res);
                }
                else {
                    setNotFound(true)
                }
            }).catch(err => {
                console.log(err);
            })

        if (authentication.originalEntityId)
            getAllEmployeePayments(authentication.originalEntityId)
                .then(res => {
                    let total = 0;
                    res.filter(item => item.type == EmployeePaymentType.SALARY)
                        .forEach(item => total += item.amount);
                    setTotalPayments(total)
                })

    }, []);


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
            monthStartDate.setMonth(joinedDate.getMonth() + monthIndex);

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

            total += applicableSalary;
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


    if (notFound) {
        return <NotFound />
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
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{1}</td>
                            <td>{formatFirebaseDates(data.joinedDate)}</td>
                            <td>0</td>
                            <td>{data?.salary}</td>
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
                                </tr>

                            )
                        })}

                    </tbody>
                </table>
            </div>

            <div className='display_flex justify_content_space_between '>
                {/* Profile Menu */}
                <Menu >
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
                        <div className=' padding_right_10 padding_left_10  border_radius_6  margin_left_10 margin_right_10'>
                            <span>{t('remainedAmount')}: </span>
                            <span>
                                {Math.abs(totalSalaries - totalPayments)}
                                <MoneyStatus number={(totalSalaries - totalPayments) * -1} />
                            </span>
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

export default EmployeeSalariesForEmployee
