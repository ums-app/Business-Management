import React, { useEffect, useState } from 'react'
import { CustomerFactor, CustomerPayment } from '../../../Types/Types'
import { getAllCustomerPayments, getAllPayments, getFactors } from '../../../Utils/FirebaseTools'
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer'
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate'
import { FactorType } from '../../../constants/FactorStatus'
import { t } from 'i18next'
import MoneyStatus from '../../UI/MoneyStatus/MoneyStatus'
import { Doughnut } from 'react-chartjs-2'
import DoughnutChart from '../../Charts/DoughnutChart'
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker'
import { jalaliToGregorian } from 'shamsi-date-converter'
import Button from '../../UI/Button/Button'


interface SalesReport {
    totalAllAmount: number,
    totalAllFactor: number,
    totalPaidAmount: number,
    totalAllRemainedAmount: number,
    totalSoldProducts: number,
}

interface ProductSalesAnalys {
    totalSalesAmount: number,
    totalNumberOfProduct: number,
    productName: string,




    color: 'red'
}

interface SaleActivity {

}

const SalesReport: React.FC = () => {

    const [customerFactors, setCustomerFactors] = useState<CustomerFactor[]>()
    const [customerPayments, setcustomerPayments] = useState<CustomerPayment[]>([])
    const [range, setRange] = useState<[]>([])
    const [salesReport, setSalesReport] = useState<SalesReport>({
        totalAllAmount: 0,
        totalAllFactor: 0,
        totalPaidAmount: 0,
        totalAllRemainedAmount: 0,
        totalSoldProducts: 0,
    })
    const [loading, setLoading] = useState<boolean>(false)


    useEffect(() => {

        getFactors()
            .then(res => {
                setCustomerFactors(res)
            })
        getAllPayments()
            .then(res => {
                setcustomerPayments(res)
            })
    }, [])

    useEffect(() => {
        if (customerFactors && customerPayments) {
            generateReport(customerFactors, customerPayments, range)
        }

    }, [customerFactors, customerPayments])






    const generateReport = (customerFactors: CustomerFactor[], customerPayments: CustomerPayment[], range: []) => {
        console.log(customerFactors);
        console.log(customerPayments);


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
                factor.productsInFactor.forEach(pr => totalProduct += Number(pr.total))
                let paidAmount: number = factor.type == FactorType.SUNDRY_FACTOR ? Number(factor.paidAmount) : 0
                console.log('totalFactor: ', factor.totalAll);

                report = {
                    ...report,
                    totalAllAmount: report.totalAllAmount + Number(factor.totalAll),
                    totalAllFactor: customerFactors.length,
                    totalSoldProducts: report.totalSoldProducts + totalProduct,
                    totalPaidAmount: report.totalPaidAmount + paidAmount
                }
            })
            let totalPaid = 0;
            customerPayments.forEach(pay => totalPaid += pay.amount);
            let totalRemaiedAmount: number = report.totalAllAmount - totalPaid;
            report = {
                ...report,
                totalPaidAmount: totalPaid,
                totalAllRemainedAmount: totalRemaiedAmount
            }
            setSalesReport(report)

        }


    }


    const saleActivity = () => {

    }


    const getProductSalesInDatePeriod = async () => {
        setLoading(true)
        const dates: Date[] = range.map(item => new Date(jalaliToGregorian(item.year, item.month.number, item.day).join('/')))
        console.log(dates);
        let q;

        try {

        } catch (err) {
            console.log(err);

        } finally {
            setLoading(false)
        }
    }





    console.log(salesReport);



    if (!customerFactors) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }



    return (
        <div>
            <h1 className='title'>{t('analysis')}</h1>
            <div className='text_align_center margin_top_20 margin_bottom_10'>
                {/* <span>{t('chooseDatePeriod')}: </span> */}
                <CustomDatePicker
                    range
                    onChange={(e: any) => setRange(e)}
                    placeholder={t('chooseDatePeriod')}
                />
                <Button
                    text={t('apply')}
                    onClick={getProductSalesInDatePeriod}
                />
            </div>
            <div className='display_flex flex_flow_wrap justify_content_space_around margin_top_20 margin_bottom_10'>
                <div className='card_box input margin_5'>
                    <div>{t('theAmountOfMoneySold')}</div>
                    <div>{salesReport.totalAllAmount}</div>
                </div>
                <div className='card_box input margin_5'>
                    <div>{t('totalAllPaidAmount')}</div>
                    <div>{salesReport.totalPaidAmount}</div>
                </div>
                <div className='card_box input margin_5'>
                    <div>{t('totalRemainedAmount')}</div>
                    <div>
                        {Math.abs(salesReport.totalAllRemainedAmount)}
                        <MoneyStatus number={salesReport.totalAllRemainedAmount} />
                    </div>
                </div>
                <div className='card_box input margin_5'>
                    <div>{t('totalSoldProducts')}</div>
                    <div>{salesReport.totalSoldProducts}</div>
                </div>
            </div>
            <div className='iknput'>
                {/* <DoughnutChart /> */}
            </div>
        </div>
    )
}

export default SalesReport