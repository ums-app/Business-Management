import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { gregorianToJalali } from 'shamsi-date-converter';  // Import Shamsi date converter
import Collections from '../../../constants/Collections';
import { Consumption } from '../../Consumptions/AddConsumptions/AddConsumptions';
import { mapDocToConsumptions } from '../../../Utils/Mapper';

// Register the required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// Colors array for chart backgrounds
const Colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

// Helper function to get titles dynamically
const getComponentTitle = (title: string) => `${title}`;

interface FirestoreDate {
    seconds: number;
    nanoseconds: number;
}

const ConsumptionsReport: React.FC = () => {
    const [data, setData] = useState<Consumption[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);  // For showing details of clicked date

    // Firestore reference
    const db = getFirestore();

    // Fetch data from Firestore
    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, Collections.Consumptions));
            const consumptionData: Consumption[] = querySnapshot.docs.map(doc => mapDocToConsumptions(doc));
            setData(consumptionData);
        };

        fetchData();
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
        const yearMonth = `${shamsiYear}-${shamsiMonth.toString().padStart(2, '0')}`;

        if (!consumptionByDate[yearMonth]) {
            consumptionByDate[yearMonth] = { ...consumptionByType };
        }
        consumptionByDate[yearMonth][type] += parseFloat(amount);
    });

    const barData = {
        labels: Object.keys(consumptionByDate),
        datasets: [
            {
                label: 'Constant Consumption',
                data: Object.keys(consumptionByDate).map(date => consumptionByDate[date].CONSTANT_CONSUMPTION),
                backgroundColor: Colors[0],
            },
            {
                label: 'Withdraw',
                data: Object.keys(consumptionByDate).map(date => consumptionByDate[date].WITHDRAW),
                backgroundColor: Colors[1],
            },
            {
                label: 'Retail Consumption',
                data: Object.keys(consumptionByDate).map(date => consumptionByDate[date].RETAIL_CONSUMPTION),
                backgroundColor: Colors[2],
            },
            {
                label: 'Major Consumption',
                data: Object.keys(consumptionByDate).map(date => consumptionByDate[date].MAJOR_CONSUMPTION),
                backgroundColor: Colors[3],
            },
        ],
    };

    const doughnutData = {
        labels: Object.keys(consumptionByType),
        datasets: [
            {
                data: Object.values(consumptionByType),
                backgroundColor: Colors,
            },
        ],
    };

    const lineData = {
        labels: Object.keys(consumptionByDate),
        datasets: [
            {
                label: 'Total Consumption Over Time',
                data: Object.keys(consumptionByDate).map(date =>
                    Object.values(consumptionByDate[date]).reduce((a, b) => a + b, 0)
                ),
                fill: false,
                borderColor: Colors[4],
                tension: 0.1,
            },
        ],
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
            labels: ['CONSTANT_CONSUMPTION', 'WITHDRAW', 'RETAIL_CONSUMPTION', 'MAJOR_CONSUMPTION'],
            datasets: [
                {
                    label: `Consumption Stats for ${selectedDate}`,
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

    return (
        <div>
            <h2>{getComponentTitle('Consumption Report')}</h2>

            {/* Bar Chart */}
            <div>
                <h3>{getComponentTitle('Bar Chart')}</h3>
                <Bar
                    data={barData}
                    options={{
                        responsive: true,
                        onClick: (event, elements) => handleBarClick(elements),  // Handle click
                    }}
                />
            </div>

            {/* Show detailed data when a bar is clicked */}
            {selectedDate && selectedBarData && (
                <div>
                    <h3>{getComponentTitle(`Details for ${selectedDate}`)}</h3>
                    <Bar data={selectedBarData} options={{ responsive: true }} />
                </div>
            )}

            {/* Doughnut Chart */}
            <div>
                <h3>{getComponentTitle('Doughnut Chart')}</h3>
                <Doughnut data={doughnutData} options={{ responsive: true }} />
            </div>

            {/* Line Chart */}
            <div>
                <h3>{getComponentTitle('Line Chart (Based on Date)')}</h3>
                <Line data={lineData} options={{ responsive: true }} />
            </div>
        </div>
    );
};

export default ConsumptionsReport;
