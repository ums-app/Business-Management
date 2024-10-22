import React, { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { CustomerFactor, Product } from '../../../Types/Types';
import { getCustomerFactors, getFactors, getProductPurchases, getProducts } from '../../../Utils/FirebaseTools';
import { gregorianToJalali } from 'shamsi-date-converter';
import Colors from '../../../constants/Colors';
import { PurchaseFactor } from '../../PurchaseProducts/AddPurchaseProducts/AddPurchaseProducts';
import { t } from 'i18next';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const dariMonths = ["حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله", "میزان", "عقرب", "قوس", "جدی", "دلو", "حوت"];

interface DepotAvailabilityProps {
    products: Product[];
    purchases: PurchaseFactor[];
    sales: CustomerFactor[];
}

const DepotAvailability: React.FC<DepotAvailabilityProps> = () => {
    const [chartData, setChartData] = useState<any>(null);
    const [transactionData, setTransactionData] = useState<any>(null);
    const [monthlyChartData, setMonthlyChartData] = useState<any>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'availability' | 'transactions'>('availability');
    const [customerFactors, setCustomerFactors] = useState<CustomerFactor[]>([]);
    const [productPurchases, setProductPurchases] = useState<PurchaseFactor[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [monthlySales, setMonthlySales] = useState<{ [year: string]: { [month: string]: { [productId: string]: number } } }>({});
    const [monthlyPurchases, setMonthlyPurchases] = useState<{ [year: string]: { [month: string]: { [productId: string]: number } } }>({});
    const chartRef = useRef<any>(null);


    useEffect(() => {
        getProducts().then(res => setProducts(res));
        getFactors().then(res => setCustomerFactors(res));
        getProductPurchases().then(res => setProductPurchases(res));
    }, []);

    const convertToShamsiYear = (date: { seconds: number; nanoseconds: number }) => {
        const dateObj = new Date(date.seconds * 1000);
        const [shamsiYear] = gregorianToJalali(dateObj);
        return shamsiYear.toString();
    };

    const convertToShamsiMonth = (date: { seconds: number; nanoseconds: number }) => {
        const dateObj = new Date(date.seconds * 1000);
        const [, shamsiMonth] = gregorianToJalali(dateObj);
        return dariMonths[shamsiMonth - 1];
    };

    // Generate chart data for both availability and transactions
    useEffect(() => {
        const purchasesByYear: { [year: string]: { [productId: string]: number } } = {};
        const salesByYear: { [year: string]: { [productId: string]: number } } = {};
        const monthlySalesData: { [year: string]: { [month: string]: { [productId: string]: number } } } = {};
        const monthlyPurchasesData: { [year: string]: { [month: string]: { [productId: string]: number } } } = {};

        productPurchases.forEach(purchase => {
            const shamsiYear = convertToShamsiYear(purchase.createdDate);
            const shamsiMonth = convertToShamsiMonth(purchase.createdDate);
            purchase.products.forEach(p => {
                if (!purchasesByYear[shamsiYear]) purchasesByYear[shamsiYear] = {};
                if (!purchasesByYear[shamsiYear][p.productId]) purchasesByYear[shamsiYear][p.productId] = 0;
                purchasesByYear[shamsiYear][p.productId] += Number(p.totalNumber);

                if (!monthlyPurchasesData[shamsiYear]) monthlyPurchasesData[shamsiYear] = {};
                if (!monthlyPurchasesData[shamsiYear][shamsiMonth]) monthlyPurchasesData[shamsiYear][shamsiMonth] = {};
                if (!monthlyPurchasesData[shamsiYear][shamsiMonth][p.productId]) monthlyPurchasesData[shamsiYear][shamsiMonth][p.productId] = 0;
                monthlyPurchasesData[shamsiYear][shamsiMonth][p.productId] += Number(p.totalNumber);
            });
        });

        customerFactors.forEach(sale => {
            const shamsiYear = convertToShamsiYear(sale.createdDate);
            const shamsiMonth = convertToShamsiMonth(sale.createdDate);
            sale.productsInFactor.forEach(p => {
                if (!salesByYear[shamsiYear]) salesByYear[shamsiYear] = {};
                if (!salesByYear[shamsiYear][p.productId]) salesByYear[shamsiYear][p.productId] = 0;
                salesByYear[shamsiYear][p.productId] += Number(p.total);

                if (!monthlySalesData[shamsiYear]) monthlySalesData[shamsiYear] = {};
                if (!monthlySalesData[shamsiYear][shamsiMonth]) monthlySalesData[shamsiYear][shamsiMonth] = {};
                if (!monthlySalesData[shamsiYear][shamsiMonth][p.productId]) monthlySalesData[shamsiYear][shamsiMonth][p.productId] = 0;
                monthlySalesData[shamsiYear][shamsiMonth][p.productId] += Number(p.total);
            });
        });

        const years = Array.from(new Set([...Object.keys(purchasesByYear), ...Object.keys(salesByYear)])).sort();

        // Data for availability chart
        const availabilityDatasets: any[] = products.map((product, index) => {
            let carryOver = 0;
            const availabilityData = years.map(year => {
                const purchased = purchasesByYear[year]?.[product.id] || 0;
                const sold = salesByYear[year]?.[product.id] || 0;
                const totalAvailable = carryOver + purchased - sold;
                carryOver = totalAvailable > 0 ? totalAvailable : 0;
                return carryOver;
            });

            return {
                label: `${product.name} - Availability`,
                data: availabilityData,
                backgroundColor: Colors[index],
                borderColor: Colors[index],
                type: 'bar',
            };
        });

        // Data for transactions (sold/bought) chart
        const transactionDatasets: any[] = products.map((product, index) => {
            const soldData = years.map(year => salesByYear[year]?.[product.id] || 0);
            const boughtData = years.map(year => purchasesByYear[year]?.[product.id] || 0);

            return [
                {
                    label: `${product.name} - Sold`,
                    data: soldData,
                    backgroundColor: Colors[index + 1],
                    borderColor: Colors[index + 1],
                    type: 'bar',
                },
                {
                    label: `${product.name} - Bought`,
                    data: boughtData,
                    backgroundColor: Colors[index + 2],
                    borderColor: Colors[index + 2],
                    type: 'bar',
                }
            ];
        }).flat();

        setChartData({
            labels: years,
            datasets: availabilityDatasets,
        });

        setTransactionData({
            labels: years,
            datasets: transactionDatasets,
        });

        setMonthlySales(monthlySalesData);
        setMonthlyPurchases(monthlyPurchasesData);
    }, [productPurchases, customerFactors, products]);

    const handleTabChange = (tab: 'availability' | 'transactions') => {
        setActiveTab(tab);
    };

    const handleYearClick = (year: string) => {
        setSelectedYear(year);

        // Create an array of all months
        const allMonths = dariMonths;

        const monthlyDatasets: any[] = products.map((product, index) => {
            // Initialize sold and bought data arrays with zeros for each month
            const soldData = allMonths.map(month => {
                return monthlySales[year]?.[month]?.[product.id] || 0;
            });

            const boughtData = allMonths.map(month => {
                return monthlyPurchases[year]?.[month]?.[product.id] || 0;
            });

            return [
                {
                    label: `${product.name} - Sold`,
                    data: soldData,
                    backgroundColor: Colors[index],
                    borderColor: Colors[index],
                    type: 'bar',
                },
                {
                    label: `${product.name} - Bought`,
                    data: boughtData,
                    backgroundColor: Colors[index + 1],
                    borderColor: Colors[index + 1],
                    type: 'bar',
                }
            ];
        }).flat();

        setMonthlyChartData({
            labels: allMonths,
            datasets: monthlyDatasets,
        });
    };

    const handleBarClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const chart = chartRef.current; // Get the chart instance

        if (!chart) {
            console.log("Chart instance not found.");
            return;
        }

        const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, false);

        if (elements.length > 0) {
            const index = elements[0].index;
            const year = chartData.labels[index] as string;
            console.log("Clicked year:", year);
            handleYearClick(year);
        } else {
            console.log("No elements clicked.");
        }
    };

    return (
        <div>
            <h2>{t('Depot Availability')}</h2>
            <button onClick={() => handleTabChange('availability')}>{t('Availability')}</button>
            <button onClick={() => handleTabChange('transactions')}>{t('Transactions')}</button>

            {activeTab === 'availability' && chartData && (
                <div>
                    <Bar
                        ref={chartRef}
                        data={chartData}
                        onClick={handleBarClick}
                    />
                    {selectedYear && monthlyChartData && (
                        <Bar
                            data={monthlyChartData}
                            options={{
                                plugins: {
                                    title: {
                                        display: true,
                                        text: `Monthly Data for ${selectedYear}`,
                                    },
                                },
                            }}
                        />
                    )}
                </div>
            )}

            {activeTab === 'transactions' && transactionData && (
                <div>
                    <Bar
                        data={transactionData}
                        options={{
                            onClick: (event) => {
                                const activePoints = Chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
                                if (activePoints.length > 0) {
                                    const year = transactionData.labels[activePoints[0].index];
                                    handleYearClick(year);
                                }
                            },
                        }}
                    />
                    {selectedYear && monthlyChartData && (
                        <Bar
                            data={monthlyChartData}
                            options={{
                                plugins: {
                                    title: {
                                        display: true,
                                        text: `Monthly Data for ${selectedYear}`,
                                    },
                                },
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default DepotAvailability;
