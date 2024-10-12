import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const BarChart = ({ chartData, title }) => {

  const options = {
    plugins: {
      // Custom plugin to display labels on top of the bars
      afterDatasetDraw: (chart: any) => {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);

        meta.data.forEach((bar: any, index: number) => {
          const label = chart.data.labels[index]; // The label from the X-axis
          const color = chart.data.datasets[0].backgroundColor[index]; // Bar color
          const value = chart.data.datasets[0].data[index]; // Value in the bar

          const position = bar.tooltipPosition();
          const x = position.x;
          const y = position.y - 10; // Adjust to place label slightly above the bar

          // Set font style and alignment
          ctx.fillStyle = color; // Use bar color for label
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          // Draw the label (use bar color for label) above the bar
          ctx.fillText(`${label}: ${value}`, x, y);
        });
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'black', // Color for labels on X-axis (bottom)
        },
      },
      y: {
        beginAtZero: true,
        // max: 50, // Set a higher maximum Y-axis value manually
        stepSize: 10, // Control the step increments between tick marks
        ticks: {
          stepSize: 10, // Adjust step increments
        },
      },
    },
  }

  return <Bar data={chartData} options={options} />;
};

export default BarChart;
