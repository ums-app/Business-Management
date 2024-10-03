
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMonthsBetweenDates } from '../../../../Utils/DateTimeUtils';
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
import { getAllEmployeePayments } from '../../../../Utils/FirebaseTools';
import { EmployeePaymentType } from '../../../../constants/Others';
import HeadingMenuTemplate from '../../../UI/LoadingTemplate/HeadingMenuTemplate';

function EmployeeSalaries({ data }) {
    const { employeeId } = useParams()
    const [employee, setEmployee] = useState(null);
    const [monthlySalaries, setMonthlySalaries] = useState([]);
    const [totalPayments, setTotalPayments] = useState();
    const [totalSalaries, setTotalSalaries] = useState();
    const [, dispatch] = useStateValue()
    let salaryRef = useRef();

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

    const calculateMonthlySalaries = (employee) => {
        const currentDate = new Date();
        let joinedDate = new Date(employee.joinedDate.toDate());
        joinedDate.setMonth(joinedDate.getMonth() + 1)
        const salaryHistory = data?.salaryHistory || [];
        const totalMonth = getMonthsBetweenDates(joinedDate, currentDate);
        let date = joinedDate;

        console.log('joinedDate: ', joinedDate);


        let salaries = [];
        let total = 0

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


            total += applicableSalary;
            // Add this month's salary to the list
            salaries.push({
                date: item,
                persianDate: gregorianToJalali(item.year, item.month, joinedDate.getDate()).join('/'),
                // month: Dari,
                salary: applicableSalary,
            });
        })


        setTotalSalaries(total)
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
        <div className='margin_top_20'>

            <div className='display_flex justify_content_space_between '>
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
