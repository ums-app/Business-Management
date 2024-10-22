import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { gregorianToJalali } from 'shamsi-date-converter';
import Collections from '../../../constants/Collections';
import { Consumption } from '../../Consumptions/AddConsumptions/AddConsumptions';
import { t } from 'i18next';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

// Colors array for chart backgrounds
const Colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

// Dari month names array
const dariMonths = [
    "حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله", "میزان", "عقرب", "قوس", "جدی", "دلو", "حوت"
];

// Convert Gregorian month number to Dari
const convertMonthToDari = (gregorianMonth: number): string => {
    return dariMonths[gregorianMonth - 1];
};

const ConsumptionsReport: React.FC = () => {
    const [data, setData] = useState<Consumption[]>([]);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);  // For showing details of clicked year
    const [loading, setLoading] = useState(true);
    const db = getFirestore();

    // Fetch data from Firestore
    useEffect(() => {
        getDocs(collection(db, Collections.Consumptions))
            .then((querySnapshot) => {
                const consumptions = querySnapshot.docs.map(doc => doc.data() as Consumption);
                setData(consumptions);
            })
            .finally(() => setLoading(false));
    }, []);

    // Group data by year
    const consumptionByYear: { [key: string]: { [key: string]: number } } = {};

    data.forEach(entry => {
        const { type, amount, date } = entry;
        const dateObj = new Date(date.seconds * 1000);
        const [shamsiYear, shamsiMonth] = gregorianToJalali(dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate());

        if (!consumptionByYear[shamsiYear]) {
            consumptionByYear[shamsiYear] = {
                CONSTANT_CONSUMPTION: 0,
                WITHDRAW: 0,
                RETAIL_CONSUMPTION: 0,
                MAJOR_CONSUMPTION: 0,
            };
        }
        consumptionByYear[shamsiYear][type] += parseFloat(amount);
    });

    const sortedYears = Object.keys(consumptionByYear).sort((a, b) => Number(a) - Number(b));

    // Prepare the first bar chart (grouped by year)
    const barDataByYear = {
        labels: sortedYears,
        datasets: [
            {
                label: t('constantConsumptions'),
                data: sortedYears.map(year => consumptionByYear[year].CONSTANT_CONSUMPTION),
                backgroundColor: Colors[0],
                borderColor: Colors[0],
            },
            {
                label: t('withdrawals'),
                data: sortedYears.map(year => consumptionByYear[year].WITHDRAW),
                backgroundColor: Colors[1],
                borderColor: Colors[1],
            },
            {
                label: t('retailConsumptions'),
                data: sortedYears.map(year => consumptionByYear[year].RETAIL_CONSUMPTION),
                backgroundColor: Colors[2],
                borderColor: Colors[2],
            },
            {
                label: t('majorConsumptions'),
                data: sortedYears.map(year => consumptionByYear[year].MAJOR_CONSUMPTION),
                backgroundColor: Colors[3],
                borderColor: Colors[3],
            },
        ],
    };

    const barOptions = {
        responsive: true,
        scales: {
            x: {
                type: 'category',
                ticks: {
                    maxTicksLimit: 12,
                    font: {
                        size: 14,  // Increased label font size
                    },
                },
            },
        },
    };

    // When a year is selected, prepare data for the second bar chart with all 12 months
    const months = ["حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله", "میزان", "عقرب", "قوس", "جدی", "دلو", "حوت"];

    // Track consumption types separately for each month
    const consumptionByMonth: { [key: string]: { [key: string]: { [key: string]: number } } } = {};

    data.forEach(entry => {
        const { type, amount, date } = entry;
        const dateObj = new Date(date.seconds * 1000);
        const [shamsiYear, shamsiMonth] = gregorianToJalali(dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate());

        if (!consumptionByMonth[shamsiYear]) {
            consumptionByMonth[shamsiYear] = {
                "حمل": { CONSTANT_CONSUMPTION: 0, WITHDRAW: 0, RETAIL_CONSUMPTION: 0, MAJOR_CONSUMPTION: 0 },
                "ثور": { CONSTANT_CONSUMPTION: 0, WITHDRAW: 0, RETAIL_CONSUMPTION: 0, MAJOR_CONSUMPTION: 0 },
                "جوزا": { CONSTANT_CONSUMPTION: 0, WITHDRAW: 0, RETAIL_CONSUMPTION: 0, MAJOR_CONSUMPTION: 0 },
                "سرطان": { CONSTANT_CONSUMPTION: 0, WITHDRAW: 0, RETAIL_CONSUMPTION: 0, MAJOR_CONSUMPTION: 0 },
                "اسد": { CONSTANT_CONSUMPTION: 0, WITHDRAW: 0, RETAIL_CONSUMPTION: 0, MAJOR_CONSUMPTION: 0 },
                "سنبله": { CONSTANT_CONSUMPTION: 0, WITHDRAW: 0, RETAIL_CONSUMPTION: 0, MAJOR_CONSUMPTION: 0 },
                "میزان": { CONSTANT_CONSUMPTION: 0, WITHDRAW: 0, RETAIL_CONSUMPTION: 0, MAJOR_CONSUMPTION: 0 },
                "عقرب": { CONSTANT_CONSUMPTION: 0, WITHDRAW: 0, RETAIL_CONSUMPTION: 0, MAJOR_CONSUMPTION: 0 },
                "قوس": { CONSTANT_CONSUMPTION: 0, WITHDRAW: 0, RETAIL_CONSUMPTION: 0, MAJOR_CONSUMPTION: 0 },
                "جدی": { CONSTANT_CONSUMPTION: 0, WITHDRAW: 0, RETAIL_CONSUMPTION: 0, MAJOR_CONSUMPTION: 0 },
                "دلو": { CONSTANT_CONSUMPTION: 0, WITHDRAW: 0, RETAIL_CONSUMPTION: 0, MAJOR_CONSUMPTION: 0 },
                "حوت": { CONSTANT_CONSUMPTION: 0, WITHDRAW: 0, RETAIL_CONSUMPTION: 0, MAJOR_CONSUMPTION: 0 },
            };
        }
        const monthInDari = convertMonthToDari(shamsiMonth);
        consumptionByMonth[shamsiYear][monthInDari][type] += parseFloat(amount);
    });

    const selectedBarData = selectedYear
        ? {
            labels: months,
            datasets: [
                {
                    label: t('constantConsumptions'),
                    data: months.map(month => consumptionByMonth[selectedYear]?.[month]?.CONSTANT_CONSUMPTION ?? 0),
                    backgroundColor: Colors[0],
                    borderColor: Colors[0],
                },
                {
                    label: t('withdrawals'),
                    data: months.map(month => consumptionByMonth[selectedYear]?.[month]?.WITHDRAW ?? 0),
                    backgroundColor: Colors[1],
                    borderColor: Colors[1],
                },
                {
                    label: t('retailConsumptions'),
                    data: months.map(month => consumptionByMonth[selectedYear]?.[month]?.RETAIL_CONSUMPTION ?? 0),
                    backgroundColor: Colors[2],
                    borderColor: Colors[2],
                },
                {
                    label: t('majorConsumptions'),
                    data: months.map(month => consumptionByMonth[selectedYear]?.[month]?.MAJOR_CONSUMPTION ?? 0),
                    backgroundColor: Colors[3],
                    borderColor: Colors[3],
                },
            ],
        }
        : null;

    if (loading) {
        return <ShotLoadingTemplate />;
    }

    return (
        <div className='display_flex flex_direction_column align_items_center full_width'>
            <h2>{t('consumptionsReport')}</h2>

            {/* Bar Chart (Grouped by Year) */}
            <div className='input full_width padding_20' style={{ margin: '10px 30px', padding: '40px' }}>
                <h3 className='text_align_center'>{t('collectionChart')}</h3>
                <Bar
                    data={barDataByYear}
                    options={{
                        ...barOptions,
                        onClick: (event, elements) => {
                            if (elements.length > 0) {
                                const clickedIndex = elements[0].index;
                                const clickedYear = barDataByYear.labels[clickedIndex];
                                setSelectedYear(clickedYear as string);
                            }
                        },
                    }}
                />
            </div>

            {/* Show all 12 months of the selected year */}
            {selectedYear && selectedBarData && (
                <div className='input full_width padding_20' style={{ margin: '10px 30px', padding: '40px' }}>
                    <h3 className='text_align_center'>{t(`${t('detailsFor')} ${selectedYear}`)}</h3>
                    <Bar data={selectedBarData} options={{ responsive: true }} />
                </div>
            )}

            {/* Line Chart */}
            <div className='input full_width' style={{ margin: '10px 30px', padding: '40px' }}>
                <h3 className='text_align_center'>{t('Line Chart (Based on Date)')}</h3>
                <Line data={barDataByYear} options={{ responsive: true }} />
            </div>
        </div>
    );
};

export default ConsumptionsReport;
