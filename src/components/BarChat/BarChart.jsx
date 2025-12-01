import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = () => {
  // Data for the bar chart
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // Days of the week
    datasets: [
      {
        label: "Sales ($)", // Label for the dataset
        data: [45, 25, 65, 50, 85, 95, 55], // Sales data for each day
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color (light green)
        borderColor: "rgba(75, 192, 192, 1)", // Border color (dark green)
        borderWidth: 1, // Border width
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
          display: false, // Disable grid lines on the y-axis
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
        position: "top", // Position the legend at the top
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return "$" + tooltipItem.raw; // Format tooltips with "$"
          },
        },
      },
    },
  };

  return (
    <div className="mt-10">
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default BarChart;
