import React from 'react'
import { Doughnut } from "react-chartjs-2";

function DoughnutChart({ data, chartTitle, precent = '0%' }) {
    const textCenterDoughnut = {
        id: 'textCenterDoughnut',
        afterDatasetDraw(chart, args, pluginOptions) {
            const { ctx } = chart;
            const x = chart.getDatasetMeta(0).data[0].x;
            const y = chart.getDatasetMeta(0).data[0].y;
            const percentNum = + precent.substring(0, precent.length - 1)
            ctx.fillStyle = 'crimson'
            if (percentNum >= 50) {
                ctx.fillStyle = 'greenyellow'
            }
            ctx.font = 'bold 32px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(precent, x, y)
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
        // circumference: 360,
        animation: {
            animateScale: true,
            animateRotate: true
        }
    }

    return (
        <Doughnut options={options} data={data} plugins={precent && [textCenterDoughnut]} />
    )
}

export default DoughnutChart

