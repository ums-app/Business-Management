import React, { useEffect, useState } from 'react'
import { CustomerFactor, CustomerPayment, DoughnutChartData, DoughnutDataSet, Product } from '../../../../Types/Types'
import { t } from 'i18next'
import SalesReport from '../SalesReport'
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate'
import BarChart from '../../../Charts/BarChart'
import DoughnutChart from '../../../Charts/DoughnutChart'
import MoneyStatus from '../../../UI/MoneyStatus/MoneyStatus'
import CustomDatePicker from '../../../UI/DatePicker/CustomDatePicker'
import Button from '../../../UI/Button/Button'
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer'
import Colors from '../../../../constants/Colors'
import { FactorType } from '../../../../constants/FactorStatus'
import { getAllCustomerPaymentsOfToday, getFactorsOfToday, getProducts, totalAmountOfAllFactors } from '../../../../Utils/FirebaseTools'

export const DailySalesReport: React.FC = () => {

    const [customerFactors, setCustomerFactors] = useState<CustomerFactor[]>()
    const [customerPayments, setcustomerPayments] = useState<CustomerPayment[]>([])
    const [products, setproducts] = useState<Product[]>([])
    const [salesReport, setSalesReport] = useState<SalesReport>({
        totalAllAmount: 0,
        totalAllFactor: 0,
        totalPaidAmount: 0,
        totalAllRemainedAmount: 0,
        totalSoldProducts: 0,
    })

    const [productsSales, setProductsSales] = useState<DoughnutChartData>()
    const [productsNumber, setproductsNumber] = useState<DoughnutChartData>()


    useEffect(() => {
        getFactorsOfToday()
            .then(res => {
                console.log(res);

                setCustomerFactors(res)
            })
        getAllCustomerPaymentsOfToday()
            .then(res => {
                console.log(res);

                setcustomerPayments(res)
            })
        getProducts().then(res => {
            setproducts(res);
        })
    }, [])

    useEffect(() => {
        console.log('useEffect run for analysing data');

        if (customerFactors && customerPayments) {
            generateReport(customerFactors, customerPayments)
        }
        console.log('end useEffect run for analysing data');

    }, [customerFactors, customerPayments, products])



    const generateReport = (customerFactors: CustomerFactor[], customerPayments: CustomerPayment[], date: Date = new Date()) => {

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
        saleActivity();

    }


    const saleActivity = () => {
        const name: string[] = [];
        const color: string[] = [];
        let priceDataSet: DoughnutDataSet = {
            backgroundColor: [],
            data: [],
            label: t('theAmountOfMoneySold')
        }
        let numberDataSet: DoughnutDataSet = {
            backgroundColor: [],
            data: [],
            label: t('totalNumberOFSold')
        }
        products.forEach((prd, index) => {
            let totalAmount: number = 0;
            let totalNumber: number = 0;

            customerFactors?.forEach(fac => {
                const result = fac.productsInFactor.find(item => item.productId == prd.id);
                if (result) {
                    totalAmount += Number(result.totalPrice);
                    totalNumber += Number(result.total);
                }
            })
            priceDataSet.data.push(totalAmount);
            numberDataSet.data.push(totalNumber);
            name.push(prd.name);
            color.push(Colors[index])
        })
        priceDataSet.backgroundColor = color;
        numberDataSet.backgroundColor = color;

        setProductsSales({
            labels: name,
            datasets: [
                priceDataSet,
            ]
        })
        setproductsNumber({
            labels: name,
            datasets: [
                numberDataSet
            ]
        })
    }

    console.log(salesReport);
    // console.log(productsActivity);

    if (!customerFactors) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }



    return (
        <div className='input'>
            <h1 className='title'>{t('todaySalesStatistics')}</h1>
            <div className='display_flex margin_top_20 flex_flow_wrap flex_direction_column justify_content_center full_width'>
                <div className='display_flex flex_flow_wrap justify_content_space_around'>
                    <div className='card_box data_card_info margin_5'>
                        <div>{t('theAmountOfMoneySold')}</div>
                        <div className='bold'>{salesReport.totalAllAmount}</div>
                    </div>
                    <div className='card_box data_card_info margin_5'>
                        <div>{t('totalAllPaidAmount')}</div>
                        <div className='bold'>{salesReport.totalPaidAmount}</div>
                    </div>
                    <div className='card_box data_card_info margin_5'>
                        <div>{t('totalRemainedAmount')}</div>
                        <div className='bold'>
                            {Math.abs(salesReport.totalAllRemainedAmount)}
                            <MoneyStatus number={salesReport.totalAllRemainedAmount} />
                        </div>
                    </div>
                    <div className='card_box data_card_info margin_5'>
                        <div>{t('totalProducts')}</div>
                        <div className='bold'>{salesReport.totalSoldProducts}</div>
                    </div>
                </div>
                <div className=' full_width justify_content_space_around display_flex flex_flow_wrap margin_top_10' >
                    <div className='chart_container input'>
                        <p className='title_2 '>{t('theAmountOfMoneySold')}</p>
                        {productsSales ?
                            <DoughnutChart data={productsSales} unit='af' />
                            :
                            <ShotLoadingTemplate />
                        }
                    </div>
                    <div className=' chart_container input'>
                        <p className='title_2'>{t('totalNumberOFSold')}</p>
                        {productsNumber ?
                            <BarChart chartData={productsNumber} />
                            :
                            <ShotLoadingTemplate />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}