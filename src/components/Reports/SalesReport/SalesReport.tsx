import React, { useEffect, useState } from 'react'
import { CustomerFactor, CustomerPayment, DoughnutChartData, DoughnutDataSet, Product } from '../../../Types/Types'
import { getAllCustomerPayments, getAllPayments, getFactors, getProducts } from '../../../Utils/FirebaseTools'
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer'
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate'
import { FactorType } from '../../../constants/FactorStatus'
import { t } from 'i18next'
import MoneyStatus from '../../UI/MoneyStatus/MoneyStatus'
import "../Reports.css"
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker'
import { jalaliToGregorian } from 'shamsi-date-converter'
import Button from '../../UI/Button/Button'
import Colors from '../../../constants/Colors'
import DoughnutChart from '../../Charts/DoughnutChart'
import BarChart from '../../Charts/BarChart'




interface SalesReport {
    totalAllAmount: number,
    totalAllFactor: number,
    totalPaidAmount: number,
    totalAllRemainedAmount: number,
    totalSoldProducts: number,
}

const SalesReport: React.FC = () => {

    const [customerFactors, setCustomerFactors] = useState<CustomerFactor[]>()
    const [customerPayments, setcustomerPayments] = useState<CustomerPayment[]>([])
    const [products, setproducts] = useState<Product[]>([])
    const [range, setRange] = useState<[]>([])
    const [salesReport, setSalesReport] = useState<SalesReport>({
        totalAllAmount: 0,
        totalAllFactor: 0,
        totalPaidAmount: 0,
        totalAllRemainedAmount: 0,
        totalSoldProducts: 0,
    })
    const [loading, setLoading] = useState<boolean>(false)

    const [productsSales, setProductsSales] = useState<DoughnutChartData>()
    const [productsNumber, setproductsNumber] = useState<DoughnutChartData>()

    useEffect(() => {

        getFactors()
            .then(res => {
                setCustomerFactors(res)
            })
        getAllPayments()
            .then(res => {
                setcustomerPayments(res)
            })
        getProducts().then(res => {
            setproducts(res);
        })
    }, [])

    useEffect(() => {
        if (customerFactors && customerPayments) {
            generateReport(customerFactors, customerPayments, range)
        }
        if (products) {
            saleActivity()

        }

    }, [customerFactors, customerPayments, products])


    const generateReport = (customerFactors: CustomerFactor[], customerPayments: CustomerPayment[], range: []) => {
        // console.log(customerFactors);
        // console.log(customerPayments);


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
                // console.log('totalFactor: ', factor.totalAll);

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
            label: t('totalProducts')
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
        // setproductsActivity(productsAnalys)

        // console.log(productsActivity);



    }


    const getProductSalesInDatePeriod = async () => {
        setLoading(true)
        const dates: Date[] = range.map(item => new Date(jalaliToGregorian(item.year, item.month.number, item.day).join('/')))
        console.log(dates);
    }


    console.log(salesReport);
    // console.log(productsActivity);


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
            {loading ? <ShotLoadingTemplate /> :
                <div className='display_flex margin_top_20 flex_flow_wrap flex_direction_column justify_content_center full_width'>
                    <div className='display_flex '>
                        <div className='card_box data_card_info margin_5'>
                            <div>{t('theAmountOfMoneySold')}</div>
                            <div>{salesReport.totalAllAmount}</div>
                        </div>
                        <div className='card_box data_card_info margin_5'>
                            <div>{t('totalAllPaidAmount')}</div>
                            <div>{salesReport.totalPaidAmount}</div>
                        </div>
                        <div className='card_box data_card_info margin_5'>
                            <div>{t('totalRemainedAmount')}</div>
                            <div>
                                {Math.abs(salesReport.totalAllRemainedAmount)}
                                <MoneyStatus number={salesReport.totalAllRemainedAmount} />
                            </div>
                        </div>
                        <div className='card_box data_card_info margin_5'>
                            <div>{t('totalProducts')}</div>
                            <div>{salesReport.totalSoldProducts}</div>
                        </div>
                    </div>
                    <div className='input full_width justify_content_space_around display_flex flex_flow_wrap' >
                        <div className='chart_container'>
                            <p className='title_2 '>{t('productSalesAnalysis')}</p>
                            <DoughnutChart chartTitle={t('productSalesAnalysis')} data={productsSales} />
                        </div>
                        <div className=' chart_container'>
                            <p className='title_2'>{t('productSalesAnalysis')}</p>
                            <BarChart chartData={productsNumber} title={t('productSalesAnalysis')} />
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default SalesReport