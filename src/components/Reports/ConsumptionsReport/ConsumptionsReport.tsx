import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';  // For time-based x-axis
import { gregorianToJalali } from 'shamsi-date-converter';
import Collections from '../../../constants/Collections';
import { Consumption } from '../../Consumptions/AddConsumptions/AddConsumptions';
import { mapDocToConsumptions } from '../../../Utils/Mapper';
import { t } from 'i18next';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { getAllConsumptions } from '../../../Utils/FirebaseTools';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, TimeScale);

// Colors array for chart backgrounds
const Colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

// Dari month names array
const dariMonths = [
    "حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله", "میزان", "عقرب", "قوس", "جدی", "دلو", "حوت"
];

// Helper function to get titles dynamically
const getComponentTitle = (title: string) => `${title}`;

// Convert Gregorian month number to Dari
const convertMonthToDari = (gregorianMonth: number): string => {
    return dariMonths[gregorianMonth - 1];
};

const ConsumptionsReport: React.FC = () => {
    const [data, setData] = useState<Consumption[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);  // For showing details of clicked date
    const [loading, setloading] = useState<boolean>(true)
    // Firestore reference
    const db = getFirestore();

    // Fetch data from Firestore
    useEffect(() => {
        getAllConsumptions()
            .then(res => {
                setData(res);
            })
            .finally(() => setloading(false))
    }, []);

    // Prepare data for charts
    const consumptionByType = {
        CONSTANT_CONSUMPTION: 0,
        WITHDRAW: 0,
        RETAIL_CONSUMPTION: 0,
        MAJOR_CONSUMPTION: 0,
    };

    const consumptionByDate: { [key: string]: { [key: string]: number } } = {};

    data.forEach(entry => {
        const { type, amount, date } = entry;
        consumptionByType[type] += parseFloat(amount);

        // Convert the date to Shamsi year-month
        const dateObj = new Date(date.seconds * 1000);
        const [shamsiYear, shamsiMonth] = gregorianToJalali(dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate());

        // Convert Gregorian month to Dari month
        const monthInDari = convertMonthToDari(shamsiMonth);

        const yearMonth = `${shamsiYear}-${monthInDari}`;

        if (!consumptionByDate[yearMonth]) {
            consumptionByDate[yearMonth] = { ...consumptionByType };
        }
        consumptionByDate[yearMonth][type] += parseFloat(amount);
    });

    // Sort the dates (yearMonth) to ensure correct chronological order
    const sortedDates = Object.keys(consumptionByDate).sort((a, b) => {
        const [yearA] = a.split('-').map(Number);
        const [yearB] = b.split('-').map(Number);
        return yearA - yearB;
    });

    const barData = {
        labels: sortedDates,
        datasets: [
            {
                label: t('constantConsumptions'),
                data: sortedDates.map(date => consumptionByDate[date].CONSTANT_CONSUMPTION),
                backgroundColor: Colors[0],
            },
            {
                label: t('withdrawals'),
                data: sortedDates.map(date => consumptionByDate[date].WITHDRAW),
                backgroundColor: Colors[1],
            },
            {
                label: t('retailConsumptions'),
                data: sortedDates.map(date => consumptionByDate[date].RETAIL_CONSUMPTION),
                backgroundColor: Colors[2],
            },
            {
                label: t('majorConsumptions'),
                data: sortedDates.map(date => consumptionByDate[date].MAJOR_CONSUMPTION),
                backgroundColor: Colors[3],
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

    // Handle bar chart click to display detailed data for that date
    const handleBarClick = (elements: any) => {
        if (elements.length > 0) {
            const clickedIndex = elements[0].index;
            const clickedDate = barData.labels[clickedIndex];
            setSelectedDate(clickedDate as string);  // Set the selected date
        }
    };
    const selectedBarData = selectedDate
        ? {
            labels: sortedDates,
            datasets: [{
                label: `${t('consumptionStatsFor')} ${selectedDate}`,
                data: [
                    consumptionByDate[selectedDate]?.CONSTANT_CONSUMPTION ?? 0,
                    consumptionByDate[selectedDate]?.WITHDRAW ?? 0,
                    consumptionByDate[selectedDate]?.RETAIL_CONSUMPTION ?? 0,
                    consumptionByDate[selectedDate]?.MAJOR_CONSUMPTION ?? 0,
                ],
                backgroundColor: Colors,
            },
            ],
        }
        : null;


    if (loading) {
        return <ShotLoadingTemplate />
    }

    return (
        <div className='display_flex flex_direction_column align_items_center full_width'>
            <h2>{t('consumptionsReport')}</h2>

            {/* Bar Chart */}
            <div className='input full_width padding_20' style={{ margin: '10px 30px', padding: '40px' }}>
                <h3 className='text_align_center'>{t('collectionChart')}</h3>
                <Bar
                    data={barData}
                    options={{
                        ...barOptions,
                        onClick: (event, elements) => {
                            if (elements.length > 0) {
                                const clickedIndex = elements[0].index;
                                const clickedDate = barData.labels[clickedIndex];
                                setSelectedDate(clickedDate as string);
                            }
                        },
                    }}
                />
            </div>

            {/* Show detailed data when a bar is clicked */}
            {selectedDate && (
                <div className='input full_width padding_20' style={{ margin: '10px 30px', padding: '40px' }}>
                    <h3 className='text_align_center'>{t(`${t('detailsFor')} ${selectedDate}`)}</h3>
                    <Bar data={selectedBarData} options={{ responsive: true }} />
                </div>
            )}

            {/* Doughnut Chart */}
            {/* <div className='input full_width padding_20' style={{ margin: '10px 30px', padding: '40px' }}>
                <h3 className='text_align_center'>{t('Doughnut Chart')}</h3>
                <Doughnut data={barData} options={{ responsive: true }} />
            </div> */}

            {/* Line Chart */}
            <div className='input full_width' style={{ margin: '10px 30px', padding: '40px' }}>
                <h3 className='text_align_center'>{t('Line Chart (Based on Date)')}</h3>
                <Line data={barData} options={{ responsive: true }} />
            </div>
        </div>
    );
};

export default ConsumptionsReport;
