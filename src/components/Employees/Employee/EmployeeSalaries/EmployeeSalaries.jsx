
import React, { useEffect, useRef, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../../../../constants/FirebaseConfig';
import Collections from '../../../../constants/Collections';
import { getMonthsBetweenDates, getTotalMonthsBetweenDates } from '../../../../Utils/DateTimeUtils';
import { gregorianToJalali } from 'shamsi-date-converter';
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

function EmployeeSalaries({ data }) {
    const { employeeId } = useParams()
    const [employee, setEmployee] = useState(null);
    const [monthlySalaries, setMonthlySalaries] = useState([]);
    const [, dispatch] = useStateValue()
    let salaryRef = useRef();

    useEffect(() => {

        calculateMonthlySalaries(data);

    }, [employeeId]);

    const calculateMonthlySalaries = (employee) => {
        const currentDate = new Date();
        let joinedDate = new Date(employee.joinedDate.toDate());
        joinedDate.setMonth(joinedDate.getMonth() + 1)
        const salaryHistory = data?.salaryHistory || [];
        const totalMonth = getMonthsBetweenDates(joinedDate, currentDate);
        let date = joinedDate;

        console.log('joinedDate: ', joinedDate);


        let salaries = [];

        totalMonth.forEach(item => {
            const monthStartDate = joinedDate;
            let applicableSalary = employee.salary; // Fallback to the latest salary if no history found.

            // Find the most recent salary applicable for the current month
            for (let i = salaryHistory.length - 1; i >= 0; i--) {
                const salaryChangeDate = new Date(salaryHistory[i].date);
                if (salaryChangeDate <= monthStartDate) {
                    applicableSalary = salaryHistory[i].amount;
                    break;
                }
            }



            // Add this month's salary to the list
            salaries.push({
                date: item,
                persianDate: gregorianToJalali(item.year, item.month, joinedDate.getDate()).join('/'),
                // month: Dari,
                salary: applicableSalary,
            });
        })

        // for (let month = 0; month < totalMonth.length; month++) {
        //     const monthStartDate = joinedDate;
        //     let applicableSalary = employee.amountSalary; // Fallback to the latest salary if no history found.

        //     // Find the most recent salary applicable for the current month
        //     for (let i = salaryHistory.length - 1; i >= 0; i--) {
        //         const salaryChangeDate = new Date(salaryHistory[i].date);
        //         if (salaryChangeDate <= monthStartDate) {
        //             applicableSalary = salaryHistory[i].amount;
        //             break;
        //         }
        //     }



        //     // Add this month's salary to the list
        //     salaries.push({
        //         year: year,
        //         month: monthStartDate.toLocaleString('default', { month: 'long' }),
        //         salary: applicableSalary,
        //     });
        // }

        setMonthlySalaries(salaries);
    };
    console.log(monthlySalaries);

    if (!data) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }

    console.log(data);



    return (
        <div>
            {/* Profile Menu */}
            <Menu >
                <Button
                    icon={ICONS.pencil}
                    text={t("update") + " " + t('salary')}
                // onClick={}
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

            <table className='custom_table full_width' style={{ background: 'transparent' }} ref={value => salaryRef = value}>
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
        </div >
    );
};

export default EmployeeSalaries
