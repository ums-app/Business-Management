import React, { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { CustomerFactor, Product } from '../../../Types/Types';
import { getCustomerFactors, getFactors, getProductPurchases, getProducts } from '../../../Utils/FirebaseTools';
import { gregorianToJalali } from 'shamsi-date-converter';
import Colors from '../../../constants/Colors';
import { PurchaseFactor } from '../../PurchaseProducts/AddPurchaseProducts/AddPurchaseProducts';
import { t } from 'i18next';
import Button from '../../UI/Button/Button';
import BtnTypes from '../../../constants/BtnTypes';
import PurchaseProducts from '../../PurchaseProducts/PurchaseProducts';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
const dariMonths = ["حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله", "میزان", "عقرب", "قوس", "جدی", "دلو", "حوت"];

interface DepotAvailabilityProps {
    products: Product[];
    purchases: PurchaseFactor[];
    sales: CustomerFactor[];
}

interface MonthlyAvailability {
    [month: string]: { [productId: string]: number };
}

interface YearlyAvailability {
    [year: string]: MonthlyAvailability;
}

// Helper function to initialize months in a year
function initializeMonths(): MonthlyAvailability {
    return {
        '01': {},
        '02': {},
        '03': {},
        '04': {},
        '05': {},
        '06': {},
        '07': {},
        '08': {},
        '09': {},
        '10': {},
        '11': {},
        '12': {}
    };
}

// Helper function to convert Gregorian date to Shamsi
function toShamsiDate(date: Date) {
    const [year, month,] = gregorianToJalali(date);
    return {
        year: year,
        month: ('0' + month).slice(-2) // Zero-padded month // Zero-padded month
    };
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


    // Generate chart data for both availability and transactions
    useEffect(() => {
        const purchasesByYear: { [year: string]: { [productId: string]: number } } = {};
        const salesByYear: { [year: string]: { [productId: string]: number } } = {};

        productPurchases.forEach(purchase => {
            const shamsiYear = convertToShamsiYear(purchase.createdDate);
            purchase.products.forEach(p => {
                if (!purchasesByYear[shamsiYear]) purchasesByYear[shamsiYear] = {};
                if (!purchasesByYear[shamsiYear][p.productId]) purchasesByYear[shamsiYear][p.productId] = 0;
                purchasesByYear[shamsiYear][p.productId] += Number(p.totalNumber);

            });
        });

        customerFactors.forEach(sale => {
            const shamsiYear = convertToShamsiYear(sale.createdDate);
            sale.productsInFactor.forEach(p => {
                if (!salesByYear[shamsiYear]) salesByYear[shamsiYear] = {};
                if (!salesByYear[shamsiYear][p.productId]) salesByYear[shamsiYear][p.productId] = 0;
                salesByYear[shamsiYear][p.productId] += Number(p.total);
            });
        });

        const years = Array.from(new Set([...Object.keys(purchasesByYear), ...Object.keys(salesByYear)])).sort();

        // Data for transactions (sold/bought) chart
        const transactionDatasets: any[] = products.map((product, index) => {
            const soldData = years.map(year => salesByYear[year]?.[product.id] || 0);
            const boughtData = years.map(year => purchasesByYear[year]?.[product.id] || 0);
            return [
                {
                    label: `${product.name} - ${t('sold')}`,
                    data: soldData,
                    backgroundColor: Colors[index + 1],
                    borderColor: Colors[index + 1],
                    type: 'bar',
                },
                {
                    label: `${product.name} - ${t('bought')}`,
                    data: boughtData,
                    backgroundColor: Colors[index + products.length],
                    borderColor: Colors[index + products.length],
                    type: 'bar',
                }
            ];
        }).flat();

        if (activeTab == 'availability') {
            const yearlyAvailability = calculateMonthlyAvailability(productPurchases, customerFactors)
            // Data for transactions (sold/bought) chart
            const transactionDatasets: any[] = products.map((product, index) => {
                const yearly = years.map(year => {
                    return (Object.keys(yearlyAvailability[year]).map(mnt => {
                        return yearlyAvailability[year][mnt]?.[product.id] || 0
                    }).reduce((a, b) => a + b, 0) / 12).toFixed(0)

                });
                return [
                    {
                        label: `${product.name} - ${t('availability')}`,
                        data: yearly,
                        backgroundColor: Colors[index + 1],
                        borderColor: Colors[index + 1],
                        type: 'bar',
                    },
                ];
            }).flat();

            setChartData({
                labels: years,
                datasets: transactionDatasets,
            });
        }

        console.log({
            labels: years,
            datasets: transactionDatasets,
        });



        setTransactionData({
            labels: years,
            datasets: transactionDatasets,
        });

    }, [productPurchases, customerFactors, products]);



    const handleTabChange = (tab: 'availability' | 'transactions') => {
        setActiveTab(tab);
    };

    const handleYearClick = (year: string) => {
        setSelectedYear(year);


        // Create an array of all months
        const allMonths = dariMonths;
        let monthlyDatasets: any[];

        if (activeTab == 'availability') {
            const yearlyAvailability = calculateMonthlyAvailability(productPurchases, customerFactors);
            console.log(`yealy:${year} : `, yearlyAvailability[year]);

            monthlyDatasets = products.map((product, i) => {
                // Initialize sold and bought data arrays with zeros for each month
                const available = allMonths.map((month, index) => {
                    let tem = (index) < 9 ? '0' + (index + 1) : index + 1;
                    return yearlyAvailability[year][tem][product.id]
                });
                console.log("available: ", available);

                return [
                    {
                        label: `${product.name} - ${t('availability')}`,
                        data: available,
                        backgroundColor: Colors[i],
                        borderColor: Colors[i],
                        type: 'bar',
                    }
                ];
            }).flat();
        } else {
            const yearlyPurchases = groupPurchasesByYear(productPurchases);
            const yearlySales = groupSalesByYear(customerFactors);
            console.log(yearlySales);

            monthlyDatasets = products.map((product, index) => {
                // Initialize sold and bought data arrays with zeros for each month
                const soldData = allMonths.map((month, index) => {
                    index = index < 9 ? '0' + (index + 1) : index + 1
                    return yearlySales[year]?.[index]?.[product.id] || 0;
                });

                const boughtData = allMonths.map((month, index) => {
                    index = index < 9 ? '0' + (index + 1) : index + 1
                    return yearlyPurchases[year]?.[index]?.[product.id] || 0;
                });
                return [
                    {
                        label: `${product.name} - ${t('sold')}`,
                        data: soldData,
                        backgroundColor: Colors[index],
                        borderColor: Colors[index],
                        type: 'bar',
                    },
                    {
                        label: `${product.name} - ${t('bought')}`,
                        data: boughtData,
                        backgroundColor: Colors[index + products.length],
                        borderColor: Colors[index + products.length],
                        type: 'bar',
                    }
                ];
            }).flat();

        }

        console.log("monthly data set: ", {
            labels: allMonths,
            datasets: monthlyDatasets,
        });

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
            console.log(index);
            console.log(transactionData.labels);


            const year = transactionData.labels[index] as string;
            console.log("Clicked year:", year);
            handleYearClick(year);
        } else {
            console.log("No elements clicked.");
        }
    };

    // ========================   gpt function for calculating availability of products  ================================

    // Group purchases by year and month
    function groupPurchasesByYear(purchases: PurchaseFactor[]): YearlyAvailability {
        const grouped: YearlyAvailability = {};

        purchases.forEach(purchase => {

            const date = new Date(purchase.createdDate.seconds * 1000);
            const { year, month } = toShamsiDate(date)

            if (!grouped[year]) {
                grouped[year] = initializeMonths();
            }


            purchase.products.forEach(product => {
                if (!grouped[year][month][product.productId]) {
                    grouped[year][month][product.productId] = 0;
                }
                grouped[year][month][product.productId] += Number(product.totalNumber);
            });
        });

        return grouped;
    }

    // Group sales by year and month
    function groupSalesByYear(sales: CustomerFactor[]): YearlyAvailability {
        const grouped: YearlyAvailability = {};

        sales.forEach(sale => {
            const date = new Date(sale.createdDate.seconds * 1000);
            const { year, month } = toShamsiDate(date)


            if (!grouped[year]) {
                grouped[year] = initializeMonths();
            }

            sale.productsInFactor.forEach(product => {
                if (!grouped[year][month][product.productId]) {
                    grouped[year][month][product.productId] = 0;
                }
                grouped[year][month][product.productId] += Number(product.total);
            });
        });

        return grouped;
    }

    // Function to calculate availability month by month with carry-over between years
    function calculateMonthlyAvailability(
        purchases: PurchaseFactor[],
        sales: CustomerFactor[]
    ): YearlyAvailability {
        const boughtByYear = groupPurchasesByYear(purchases);
        const soldByYear = groupSalesByYear(sales);
        const availability: YearlyAvailability = {};

        // Track carry-over between years
        let carryOver: { [productId: string]: number } = {};

        // Sort the years numerically
        const sortedYears = Object.keys(boughtByYear).sort((a, b) => Number(a) - Number(b));

        // Loop through each year in order
        sortedYears.forEach((year, yearIndex) => {
            availability[year] = initializeMonths();

            // Handle carry-over from the last month of the previous year (if applicable)
            if (yearIndex > 0) {
                const prevYear = sortedYears[yearIndex - 1];
                const lastMonthOfPrevYear = '12'; // December of the previous year
                if (availability[prevYear] && availability[prevYear][lastMonthOfPrevYear]) {
                    carryOver = { ...availability[prevYear][lastMonthOfPrevYear] };
                }
            }

            // Sort months numerically
            const sortedMonths = Object.keys(boughtByYear[year]).sort((a, b) => Number(a) - Number(b));

            // Loop through each month in the year
            sortedMonths.forEach(month => {
                // Carry over availability from the previous month/year
                if (carryOver) {
                    Object.keys(carryOver).forEach(productId => {
                        if (!availability[year][month][productId]) {
                            availability[year][month][productId] = 0;
                        }
                        availability[year][month][productId] += carryOver[productId];
                    });
                }

                // Add purchased products for this month
                Object.keys(boughtByYear[year][month]).forEach(productId => {
                    if (!availability[year][month][productId]) {
                        availability[year][month][productId] = 0;
                    }
                    availability[year][month][productId] += boughtByYear[year][month][productId];
                });

                // Subtract sold products for this month
                if (soldByYear[year] && soldByYear[year][month]) {
                    Object.keys(soldByYear[year][month]).forEach(productId => {
                        if (!availability[year][month][productId]) {
                            availability[year][month][productId] = 0;
                        }
                        availability[year][month][productId] -= soldByYear[year][month][productId];
                    });
                }

                // Prepare carry-over for the next month
                carryOver = { ...availability[year][month] };
            });
        });

        return availability;
    }



    return (
        <div>
            <h2 className='title'>{t('status')}  {t('depot')}</h2>
            <div className='display_flex'>
                <button
                    className={activeTab == 'availability' ? 'active' : ''}
                    onClick={() => handleTabChange('availability')}

                >{t('availability')}</button>
                <button
                    className={activeTab == 'transactions' ? 'active' : ''}
                    onClick={() => handleTabChange('transactions')}
                >{t('transactions')}</button>
            </div>

            {activeTab === 'availability' && chartData && (
                <div className='input '>
                    <h2 className='title_2'>{t('productAvailabilityYearly')}</h2>
                    <Bar
                        ref={chartRef}
                        data={chartData}
                        onClick={handleBarClick}
                        options={{
                            plugins: {
                                title: {
                                    display: true,
                                },
                            },
                        }}
                    />
                    {selectedYear && monthlyChartData && (
                        <div className='input '>
                            <h2 className='title_2'>{t('productAvailabilityForYear')} {selectedYear}</h2>
                            <Bar
                                data={monthlyChartData}
                                options={{
                                    plugins: plugins
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'transactions' && transactionData && (
                <div className='input '>
                    <h2 className='title_2'>{t('depotBaseOnPurchaseAndSaleYearly')}</h2>
                    <Bar
                        ref={chartRef}
                        data={transactionData}
                        onClick={handleBarClick}
                        options={{
                            plugins: {
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
                        }}
                    />
                    <div >

                        {selectedYear && monthlyChartData && (
                            <div>
                                <h2 className='title_2'>{t('depotBaseOnPurchaseAndSaleMonthly')}</h2>

                                <Bar
                                    data={monthlyChartData}
                                    options={{
                                        plugins: plugins
                                    }}
                                />
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default DepotAvailability;
