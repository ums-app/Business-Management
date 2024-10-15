import React from "react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the plugin
// Register necessary components including the plugin
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);



const BarChart = ({ chartData, title }) => {

  const options = {
    plugins: {
      datalabels: {
        display: true, // Show the labels
        color: '#000', // Set label color to black
        align: 'end', // Position the label at the end (top) of the bar
        anchor: 'end', // Anchor the label at the end of the bar
        font: {
          weight: 'bold', // Make the text bold
          size: 12, // Text size
        },
        formatter: (value: number) => `${value}`, // Custom formatter to show the value
      },
      tooltip: {
        enabled: true, // Tooltips still enabled for hover interaction
      },
    },
    scales: {
      // yAxes: [{
      //   display: false,
      //   gridLines: {
      //     display: false
      //   },
      //   ticks: {
      //     max: Math.max(...chartData.datasets[0].data) + 10,
      //     display: false,
      //     beginAtZero: true
      //   }
      // }],
      x: {
        ticks: {
          color: 'black', // Color for labels on X-axis (bottom)
        },
      },
      y: {
        beginAtZero: true,
        // max: 50, // Set a higher maximum Y-axis value manually
        stepSize: 10, // Control the step increments between tick marks
        // ticks: {
        //   stepSize: 10, // Adjust step increments
        max: Math.ceil((Math.max(...chartData.datasets[0].data) + 50) / 10) * 10,
      },
    },
  }

  return <Bar data={chartData} options={options} />;
};

export default BarChart;
