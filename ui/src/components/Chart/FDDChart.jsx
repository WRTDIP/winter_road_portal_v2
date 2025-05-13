// LineChart.js
import React from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const LineChart = () => {
  // X: Years and Y: Corresponding Numbers
  const X = ["1"]

  const Y = [1]

  // Data for the chart
  const data = {
    labels: X, // Use X array for the years
    datasets: [
      {
        label: "Sample Data",
        data: Y, // Use Y array for the corresponding numbers
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        fill: true,
        tension: 0.4, // Optional: add a curve to the line
      },
    ],
  }

  // Chart configuration options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Line Chart with Years and Corresponding Numbers",
      },
    },
    scales: {
      y: {
        beginAtZero: false, // Let the Y-axis adjust to the range of your data
      },
    },
  }

  return <Line data={data} options={options} />
}

export default LineChart
