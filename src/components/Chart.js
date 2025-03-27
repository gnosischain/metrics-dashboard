import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Chart component for visualizing metric data
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data
 * @param {string} props.title - Chart title
 * @param {string} props.type - Chart type (line, bar)
 * @param {string} props.color - Chart color
 * @returns {JSX.Element} Chart component
 */
const Chart = ({ data, title, type = 'line', color = '#4285F4' }) => {
  // Prepare data for ChartJS
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  // Render the appropriate chart type
  return (
    <div className="chart-container">
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
};

export default Chart;