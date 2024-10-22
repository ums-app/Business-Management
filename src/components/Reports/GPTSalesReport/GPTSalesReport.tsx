import React, { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { gregorianToJalali } from 'shamsi-date-converter';
import { getAllPayments, getFactors, getProducts } from '../../../Utils/FirebaseTools';
import { CustomerFactor, CustomerPayment, Product, ProductForSale } from '../../../Types/Types';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Colors from '../../../constants/Colors';
import { t } from 'i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Dari month names for conversion
const dariMonths = ["حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله", "میزان", "عقرب", "قوس", "جدی", "دلو", "حوت"];


const plugins = {
    legend: {
        display: true,
    },
    datalabels: {
        anchor: 'middle',  // Position the label at the top of the bar
        align: 'end',   // Align the label to the end (top) of the bar
        rotation: 90,  // Rotate the label vertically
        color: '#000',  // Set label color
        font: {
            weight: 'bold',
            size: 12
        },
        formatter: function (value) {
            return value; // Show the value of the bar as a label
        }
    }
}


const SalesAnalysis: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [sales, setSales] = useState<CustomerFactor[]>([]);
    const [yearlyData, setYearlyData] = useState<{ [year: string]: { [productId: string]: { totalSalesAmount: number; totalQuantity: number } } }>({});
    const [monthlyData, setMonthlyData] = useState<{ [year: string]: { [month: string]: { [productId: string]: { totalSalesAmount: number; totalQuantity: number } } } }>({});
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [payments, setPayments] = useState<CustomerPayment[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredMonthlyData, setFilteredMonthlyData] = useState<{ [month: string]: { [productId: string]: { totalSalesAmount: number; totalQuantity: number } } } | null>(null);

    useEffect(() => {
        setLoading(true);
        getFactors().then(factors => {
            setSales(factors);
            processSalesData(factors);
            setLoading(false);
        });
        getAllPayments().then(res => {
            setPayments(res);
        });
        getProducts().then(res => {
            setProducts(res);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    // Process sales data to aggregate by year, month, and products
    const processSalesData = (salesData: CustomerFactor[]) => {
        const yearlyTotals: { [year: string]: { [productId: string]: { totalSalesAmount: number; totalQuantity: number } } } = {};
        const monthlyTotals: { [year: string]: { [month: string]: { [productId: string]: { totalSalesAmount: number; totalQuantity: number } } } } = {};

        salesData.forEach((sale) => {
            const saleDate = new Date(sale.createdDate.toDate());
            const [shamsiYear, shamsiMonth] = gregorianToJalali(saleDate);
            const monthName = dariMonths[shamsiMonth - 1]; // Convert to Dari month name

            sale.productsInFactor.forEach((product: ProductForSale) => {
                const productId = product.productId;

                // Aggregate yearly data by product
                yearlyTotals[shamsiYear] = yearlyTotals[shamsiYear] || {};
                yearlyTotals[shamsiYear][productId] = yearlyTotals[shamsiYear][productId] || { totalSalesAmount: 0, totalQuantity: 0 };
                yearlyTotals[shamsiYear][productId].totalSalesAmount += Number(product.totalPrice);
                yearlyTotals[shamsiYear][productId].totalQuantity += Number(product.total);

                // Aggregate monthly data by product
                if (!monthlyTotals[shamsiYear]) {
                    monthlyTotals[shamsiYear] = {};
                }
                if (!monthlyTotals[shamsiYear][monthName]) {
                    monthlyTotals[shamsiYear][monthName] = {};
                }
                monthlyTotals[shamsiYear][monthName][productId] = monthlyTotals[shamsiYear][monthName][productId] || { totalSalesAmount: 0, totalQuantity: 0 };
                monthlyTotals[shamsiYear][monthName][productId].totalSalesAmount += Number(product.totalPrice);
                monthlyTotals[shamsiYear][monthName][productId].totalQuantity += Number(product.total);
            });
        });

        setYearlyData(yearlyTotals);
        setMonthlyData(monthlyTotals);
    };

    const handleYearClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const chart = chartRef.current; // Access the chart from the ref

        if (chart) {
            const { clientX, clientY } = event;
            const canvas = chart.canvas;
            const rect = canvas.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const offsetY = clientY - rect.top;

            // Get the active points based on the mouse position
            const activePoints = chart.getElementsAtEventForMode(
                { offsetX, offsetY },
                'nearest',
                { intersect: true },
                false
            );

            if (activePoints.length) {
                const firstPoint = activePoints[0];
                const clickedYear = chart.data.labels[firstPoint.index]; // Get the year from the label
                setSelectedYear(clickedYear); // Update the state with the clicked year

                // Filter monthly data based on selected year
                const filteredData = monthlyData[clickedYear] || {};
                const completeMonthlyData: { [month: string]: { [productId: string]: { totalSalesAmount: number; totalQuantity: number } } } = {};

                dariMonths.forEach(month => {
                    completeMonthlyData[month] = {};

                    // Aggregate data for each product in the month
                    if (filteredData[month]) {
                        Object.entries(filteredData[month]).forEach(([productId, productData]) => {
                            completeMonthlyData[month][productId] = {
                                totalSalesAmount: productData.totalSalesAmount,
                                totalQuantity: productData.totalQuantity,
                            };
                        });
                    }
                });

                setFilteredMonthlyData(completeMonthlyData); // Update the state with filtered monthly data
            }
        }
    };

    // Ref for the chart
    const chartRef = useRef<ChartJS | null>(null);

    // Prepare data for the bar chart (by year and product)
    const sortedYears = Object.keys(yearlyData).sort();
    const productLabels = products.map(product => product.name);

    const barDataByYearAmount = {
        labels: sortedYears,
        datasets: products.map((product, index) => {
            const productId = product.id;
            return {
                label: `${product.name} - ${t('amount')}`,
                data: sortedYears.map(year => yearlyData[year]?.[productId]?.totalSalesAmount || 0),
                backgroundColor: Colors[index],
                borderColor: Colors[index],
                borderWidth: 1,
            };
        }),
    };

    const barDataByYearQuantity = {
        labels: sortedYears,
        datasets: products.map((product, index) => {
            const productId = product.id;
            return {
                label: `${product.name} - ${t('quantity')}`,
                data: sortedYears.map(year => yearlyData[year]?.[productId]?.totalQuantity || 0),
                backgroundColor: Colors[index + products.length], // Offset color for quantity
                borderColor: Colors[index + products.length],
                borderWidth: 1,
            };
        }),
    };

    // Prepare data for the monthly chart
    const productSalesDataAmount = {
        labels: Object.keys(filteredMonthlyData || {}),
        datasets: products.map((product, index) => ({
            label: `${product.name} - Amount`,
            data: Object.keys(filteredMonthlyData || {}).map(month => filteredMonthlyData?.[month]?.[product.id]?.totalSalesAmount || 0),
            backgroundColor: Colors[index],
            borderColor: Colors[index],
            borderWidth: 1,
        })),
    };

    const productSalesDataQuantity = {
        labels: Object.keys(filteredMonthlyData || {}),
        datasets: products.map((product, index) => ({
            label: `${product.name} - Quantity`,
            data: Object.keys(filteredMonthlyData || {}).map(month => filteredMonthlyData?.[month]?.[product.id]?.totalQuantity || 0),
            backgroundColor: Colors[index + products.length], // Offset color for quantity
            borderColor: Colors[index + products.length],
            borderWidth: 1,
        })),
    };

    if (loading) {
        return <ShotLoadingTemplate />;
    }

    return (
        <div className="sales-analysis">
            <h2 className='title text_align_center'>{t('analysis')} {t('sales')}</h2>

            {/* Bar Chart - Total Sales Amount by Year and Product */}
            <div className="chart-container input">
                <h3 className='text_align_center'>{t('yearlySalesAmount')}</h3>
                <Bar
                    data={barDataByYearAmount}
                    ref={chartRef}
                    options={{
                        responsive: true,
                        interaction: {
                            mode: 'nearest',
                            intersect: true,
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: t('totalSalesAmount'),
                                },
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: t('year'),
                                },
                            },
                        },
                        plugins: {
                            legend: {
                                display: true,
                            },
                        },
                    }}
                    onClick={handleYearClick}
                />
            </div>

            <div className="chart-container input">
                <h3 className='text_align_center'>{t('yearlySalesQuantity')}</h3>
                <Bar
                    data={barDataByYearQuantity}
                    options={{
                        responsive: true,
                        interaction: {
                            mode: 'nearest',
                            intersect: true,
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: t('totalQuantitySold'),
                                },
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: t('year'),
                                },
                            },
                        },
                        plugins: {
                            legend: {
                                display: true,
                            },
                        },
                    }}
                />
            </div>

            {/* Conditional rendering for filtered monthly data */}
            {selectedYear && (
                <div className='input '>
                    <h3 className='text_align_center margin_top_20 '>{t('detailsFor')} {selectedYear}</h3>

                    <div className='input '>
                        <h4 className='text_align_center margin_top_20'>{t('monthlySalesAmount')}</h4>
                        <Bar
                            data={productSalesDataAmount}
                            options={{
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: t('monthlySalesAmount'),
                                        },
                                    },
                                    x: {
                                        title: {
                                            display: true,
                                            text: t('month'),
                                        },
                                    },
                                },
                                plugins: plugins

                            }}
                        />

                        <h4 className='text_align_center margin_top_20'>{t('monthlySalesQuantity')}</h4>
                        <Bar
                            data={productSalesDataQuantity}
                            options={{
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: t('monthlySalesQuantity'),
                                        },
                                    },
                                    x: {
                                        title: {
                                            display: true,
                                            text: t('month'),
                                        },
                                    },
                                },
                                plugins: plugins,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesAnalysis;