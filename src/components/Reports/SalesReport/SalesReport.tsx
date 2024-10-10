import React, { useEffect, useState } from 'react'
import { CustomerFactor, CustomerPayment } from '../../../Types/Types'
import { getFactors } from '../../../Utils/FirebaseTools'
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer'
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate'


interface SalesReport {
    totalAllAmount: number,
    totalAllFactor: number,
    totalPaidAmount: number,
    totalAllRemainedAmount: number,
    totalSoldProducts: number,
}

const SalesReport: React.FC = () => {

    const [customerFactors, setCustomerFactors] = useState<CustomerFactor[]>()
    const [customerPayments, setcustomerPayments] = useState<CustomerPayment[]>()
    const [range, setRange] = useState<[]>([])


    useEffect(() => {

        getFactors()
            .then(res => {
                setCustomerFactors(res)
                generateReport(res, range)
            })
    }, [])






    const generateReport = (customerFactors: CustomerFactor[], customerPayments: CustomerPayment[], range: []) => {
        if (range.length == 0) {
            let report: SalesReport = {
                totalAllAmount: 0,
                totalAllFactor: customerFactors.length,
                totalAllRemainedAmount: 0,
                totalPaidAmount: 0,
                totalSoldProducts: 0
            }
            customerFactors.forEach(factor => {
                let totalProduct: number = 0;
                factor.productsInFactor.forEach(pr => totalProduct += pr.total)
                report = {
                    ...report,
                    totalAllAmount: report.totalAllAmount + factor.totalAll,
                    totalAllFactor: customerFactors.length,
                    totalSoldProducts: report.totalSoldProducts + totalProduct
                }
            })
            let totalPaid = 0;
            customerPayments.forEach(pay => totalPaid += pay.amount);
            let totalRemaiedAmount: number = report.totalAllAmount - totalPaid;
            report = {
                ...report,
                totalAllAmount: report.totalAllAmount + factor.totalAll,
                totalAllFactor: customerFactors.length,
                totalSoldProducts: report.totalSoldProducts + totalProduct
            }

        }


    }







    if (!customerFactors) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }



    return (
        <div>

        </div>
    )
}

export default SalesReport