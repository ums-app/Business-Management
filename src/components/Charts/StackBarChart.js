import React from 'react'
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';


// Register the required elements for Chart.js, including ArcElement
ChartJS.register(ArcElement, Tooltip, Legend);

function DoughnutChart({ data, chartTitle }) {


    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: chartTitle
            },
            legend: {
                display: true,
                position: 'top',
                labels: {

                }
            },
            tooltip: {
                enabled: true,
                // backgroundColor: 'rgba(0, 0, 0, 0.7)',
                // titleFont: {
                //     size: 16,
                //     family: 'Arial, sans-serif',
                //     weight: 'bold'
                // },
                // bodyFont: {
                //     size: 14,
                //     family: 'Arial, sans-serif'
                // },
            }
        },
        cutout: '50%',
        circumference: 360,
        animation: {
            animateScale: true,
            animateRotate: true
        }
    }



    return (
        <Doughnut options={options} title={chartTitle} data={data} />
    )
}

export default DoughnutChart

