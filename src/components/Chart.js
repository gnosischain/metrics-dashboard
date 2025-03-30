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
 * Universal chart component that handles both simple and multi-series data
 */
const Chart = ({ data, title, type = 'line', color = '#4285F4' }) => {
  // Check if data is in multi-series format (has labels and datasets)
  const isMultiSeries = data && typeof data === 'object' && !Array.isArray(data) && data.labels && data.datasets;
  
  let chartData;
  
  if (isMultiSeries) {
    // Multi-series data format
    chartData = {
      labels: data.labels,
      datasets: data.datasets.map((dataset, index) => {
        // Determine color for this dataset
        let datasetColor;
        if (Array.isArray(color)) {
          datasetColor = color[index % color.length];
        } else {
          // Generate colors if none provided
          const hue = (index * 137) % 360; // Golden angle approximation for nice distribution
          datasetColor = `hsl(${hue}, 70%, 60%)`;
        }
        
        return {
          ...dataset,
          backgroundColor: datasetColor,
          borderColor: datasetColor,
          borderWidth: 2,
        };
      })
    };
  } else {
    // Simple date/value format
    chartData = {
      labels: (data || []).map(item => {
        // If date has time component, remove it
        if (item.date && item.date.includes(' ')) {
          return item.date.split(' ')[0];
        }
        return item.date;
      }),
      datasets: [
        {
          label: title,
          data: (data || []).map(item => parseFloat(item.value)),
          backgroundColor: color,
          borderColor: color,
          borderWidth: 2,
        }
      ]
    };
  }

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: isMultiSeries, // Only show legend for multi-series
        position: 'top',
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
        },
        stacked: type === 'stackedBar'
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        stacked: type === 'stackedBar' // Stack bars only if stackedBar type
      }
    }
  };

  // Determine which chart type to render
  const chartType = type === 'stackedBar' ? 'bar' : type;

  return (
    <div className="chart-container">
      {chartType === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
};

export default Chart;