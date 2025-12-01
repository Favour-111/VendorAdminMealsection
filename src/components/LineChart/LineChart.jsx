import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = () => {
  // Data for the chart
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"], // X-axis labels (months)
    datasets: [
      {
        label: "Sales ($)", // Label for the dataset
        data: [150, 400, 500, 600, 450, 300, 550], // Y-axis data (sales values)
        borderColor: "rgb(255, 99, 132)", // Line color
        borderWidth: 2, // Line width
        tension: 0.4, // Smoothness of the line
        fill: false, // No filling under the line
      },
    ],
  };

  // Options for the chart (customizing axes and appearance)
  const options = {
    responsive: true, // Make the chart responsive
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false, // Disable grid lines on the x-axis
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + value; // Format Y-axis labels with "$"
          },
        },
        grid: {
          display: false, // Disable grid lines on the y-axis
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Optionally remove the legend if you don't need it
      },
    },
  };

  return (
    <div className="mt-10">
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default LineChart;
