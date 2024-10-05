import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
import { getAllEmployeePayments, getAllVisitorFactors, getCustomerPaymentByCustomerIds } from '../../../../Utils/FirebaseTools';
import { useParams } from 'react-router-dom';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';
import MoneyStatus from '../../../UI/MoneyStatus/MoneyStatus';
import ButtonLoadingTemplate from '../../../UI/LoadingTemplate/ButtonLoadingTemplate';
import { EmployeePaymentType } from '../../../../constants/Others';
import HeadingMenuTemplate from '../../../UI/LoadingTemplate/HeadingMenuTemplate';

function EmployeeFee() {
    const { employeeId } = useParams()
    const [allFactors, setallFactors] = useState();
    const [totalAmountOfAllFactors, setTotalAmountOfAllFactors] = useState(0)
    const [totalShareOfEmployee, setTotalShareOfEmployee] = useState(0)
    const [totalCustomersPaid, setTotalCustomersPaid] = useState(0)
    const [loading, setLoading] = useState(false)
    const [totalEmployeePaidAmount, settotalEmployeePaidAmount] = useState(0);


    useEffect(() => {
        getAllVisitorFactors(employeeId)
            .then(res => {
                getTotalAmountOfFactors(res);
                setallFactors(res)

            }).catch(err => {
                setallFactors([])
            })

        getAllEmployeePayments(employeeId)
            .then(res => {
                let total = 0;
                res.filter(item => item.type == EmployeePaymentType.SALES)
                    .forEach(item => total += item.amount)

                settotalEmployeePaidAmount(total);
            })



    }, [])

    useEffect(() => {
        if (allFactors) {
            setLoading(true);
            let ids = new Set([...allFactors.map(item => item.customer.id)]);
            ids = [...ids.values()];

            getCustomerPaymentByCustomerIds(ids)
                .then(res => {
                    console.log(res);
                    let total = 0
                    res.forEach(item => total += item.amount)
                    setTotalCustomersPaid(total)
                }).finally(() => {
                    setLoading(false)
                })
        }

    }, [allFactors])



    const calculateWithdrawableAmount = () => {
        // console.log('totalCusPaid:', totalCustomersPaid, ' totalshareOdEMp: ', totalShareOfEmployee, " totalAmountOfALLFac: ", totalAmountOfAllFactors)
        if (totalAmountOfAllFactors == 0) return 0
        return (totalCustomersPaid * totalShareOfEmployee) / totalAmountOfAllFactors;
    }




    console.log(allFactors);

    const getTotalAmountOfFactors = (factors) => {
        let total = 0;
        let totalShareOfEmployee = 0
        if (factors) {
            factors.forEach(item => {
                total += item.totalAll;
                console.log("factor: ", item);
                totalShareOfEmployee += item?.visitorAccount?.visitorAmount;
            })
        }
        console.log('totalamount ofAllFactor: ', total);
        console.log('total share of employee: ', totalShareOfEmployee);

        setTotalAmountOfAllFactors(total);

        setTotalShareOfEmployee(totalShareOfEmployee);

    }

    if (!allFactors) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }


    console.log("totalshared ", totalShareOfEmployee);

    console.log(calculateWithdrawableAmount(), totalEmployeePaidAmount);


    console.log(calculateWithdrawableAmount() - totalEmployeePaidAmount);

    return (
        <div>
            <div>
                {totalEmployeePaidAmount ?
                    <div className='display_flex input justify_content_space_between '>
                        <div className=' padding_right_10 bold padding_left_10 border_radius_6 margin_left_10 margin_right_10'>
                            <span>{t('receipts')}: </span>
                            <span>{totalEmployeePaidAmount}</span>
                        </div>
                        {/* <div className=' padding_right_10 padding_left_10  border_radius_6  margin_left_10 margin_right_10'>
                            <span>{t('paidAmount')}: </span>
                            <span>{totalPayments}</span>
                        </div> */}

                    </div>
                    :
                    <HeadingMenuTemplate />
                }
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
                                {(calculateWithdrawableAmount() - totalEmployeePaidAmount).toFixed(2)}
                                {/* <MoneyStatus number={calculateWithdrawableAmount() - totalEmployeePaidAmount} /> */}
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
    )
}

export default EmployeeFee