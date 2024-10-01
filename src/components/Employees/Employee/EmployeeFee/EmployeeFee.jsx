import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
import { getAllVisitorFactors, getCustomerPaymentByCustomerIds } from '../../../../Utils/FirebaseTools';
import { useParams } from 'react-router-dom';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';
import MoneyStatus from '../../../UI/MoneyStatus/MoneyStatus';
import ButtonLoadingTemplate from '../../../UI/LoadingTemplate/ButtonLoadingTemplate';

function EmployeeFee() {
    const { employeeId } = useParams()
    const [allFactors, setallFactors] = useState();
    const [totalAmountOfAllFactors, setTotalAmountOfAllFactors] = useState(0)
    const [totalShareOfEmployee, setTotalShareOfEmployee] = useState(0)
    const [totalCustomersPaid, setTotalCustomersPaid] = useState(0)
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        getAllVisitorFactors(employeeId)
            .then(res => {
                getTotalAmountOfFactors(res);
                setallFactors(res)

            }).catch(err => {
                setallFactors([])
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
        return (totalCustomersPaid * totalShareOfEmployee) / totalAmountOfAllFactors;
    }




    console.log(allFactors);

    const getTotalAmountOfFactors = (factors) => {
        let total = 0;
        let totalShareOfEmployee = 0
        if (factors) {
            factors.forEach(item => {
                total += item.totalAll;
                totalShareOfEmployee += item.visitorAccount.visitorAmount;
            })
        }
        setTotalAmountOfAllFactors(total);
        setTotalShareOfEmployee(totalShareOfEmployee);

    }

    if (!allFactors) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }


    return (
        <div>
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
                            <th>{t('remainedAmount')}</th>
                        </tr>
                    </thead>
                    <tbody>

                        <tr>
                            <td>{allFactors.length}</td>
                            <td>{totalAmountOfAllFactors}</td>
                            <td>{totalShareOfEmployee}</td>
                            <td>
                                {loading ? <ButtonLoadingTemplate /> :
                                    totalCustomersPaid}
                            </td>
                            <td>{calculateWithdrawableAmount()}</td>
                            <td>
                                {loading ? <ButtonLoadingTemplate /> :
                                    <>
                                        {Math.abs(totalAmountOfAllFactors - totalCustomersPaid)}
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