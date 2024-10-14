import React from 'react'
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { t } from 'i18next';

// Register the required elements for Chart.js, including ArcElement
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function DoughnutChart({ data, chartTitle, unit = '', totalAmount }) {
    const textCenterDoughnut = {
        id: 'textCenterDoughnut',
        afterDatasetDraw(chart, args, pluginOptions) {
            const { ctx } = chart;
            const x = chart.getDatasetMeta(0).data[0]?.x;
            const y = chart.getDatasetMeta(0).data[0]?.y;
            ctx.fillStyle = 'crimson'

            ctx.font = 'bold 32px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(totalAmount, x, y)
        }
    }

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
            datalabels: {
                display: true, // Show the labels
                color: '#fff', // Set label color to black
                align: 'center', // Position the label at the end (top) of the bar
                anchor: 'center', // Anchor the label at the end of the bar
                clamp: true,
                font: {
                    weight: 'bold', // Make the text bold
                    size: 12, // Text size
                },
                formatter: (value: number) => `${value} ${t(unit)}`, // Custom formatter to show the value
            },
            tooltip: {
                enabled: true, // Tooltips still enabled for hover interaction
            },
        },
        cutout: '50%',
        circumference: 360,
        animation: {
            animateScale: true,
            animateRotate: true
        }
    }



    return (
        <Doughnut options={options} title={chartTitle} data={data} plugins={totalAmount && [textCenterDoughnut]} />
    )
}

export default DoughnutChart

