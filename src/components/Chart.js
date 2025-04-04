import React, { useRef, useEffect, useState } from 'react';
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
const Chart = ({ 
  data, 
  title, 
  type = 'line', 
  color = '#4285F4',
  height = 'auto'
}) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const legendContainerRef = useRef(null);
  const legendItemsRef = useRef(null);
  const legendControlsRef = useRef(null);

  const [chartInstance, setChartInstance] = useState(null);
  const [legendCreated, setLegendCreated] = useState(false);
  
  /**
   * Convert hex color to rgba with alpha
   * @param {string} hex - Hex color code 
   * @param {number} alpha - Alpha value (0-1)
   * @returns {string} RGBA color string
   */
  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(128, 128, 128, ${alpha})`; // Default gray if no color provided
    
    // Check if already rgba
    if (hex.startsWith('rgba')) return hex;
    
    // Check if rgb format
    if (hex.startsWith('rgb(')) {
      return hex.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Expand 3-character hex
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    // Convert to rgb values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // Check if data is in multi-series format
  const isMultiSeries =
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    data.labels &&
    data.datasets;

  // Build chartData depending on format
  let chartData;
  if (isMultiSeries) {
    // Multi-series data format
    chartData = {
      labels: data.labels,
      datasets: data.datasets.map((dataset) => {
        // Extract color without alpha if it already has it
        let baseColor = dataset.backgroundColor || dataset.borderColor;
        if (baseColor && baseColor.includes('rgba')) {
          // If already RGBA, extract the RGB part
          baseColor = baseColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, 'rgb($1)');
        } else if (baseColor && baseColor.includes('#') && baseColor.length === 9) {
          // If hex with alpha, remove alpha
          baseColor = baseColor.substring(0, 7);
        }
        
        return {
          ...dataset,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false,
          // Add transparency to background color (0.6 alpha)
          backgroundColor: hexToRgba(baseColor, 0.6),
          // Border should be more solid but still slightly transparent (0.8 alpha)
          borderColor: hexToRgba(baseColor, 0.8),
          // Full opacity on hover for better visibility
          hoverBackgroundColor: hexToRgba(baseColor, 0.8),
          hoverBorderColor: baseColor,
        };
      }),
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
          backgroundColor: hexToRgba(color, 0.6),
          borderColor: hexToRgba(color, 0.8),
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false,
          hoverBackgroundColor: hexToRgba(color, 0.8),
          hoverBorderColor: color,
        },
      ],
    };
  }

  // Check if scroll buttons are needed for legend
  const checkScrollButtonsNeeded = () => {
    if (!legendItemsRef.current || !legendControlsRef.current) return;
    
    const container = legendItemsRef.current;
    const controls = legendControlsRef.current;
    
    // Calculate if the legend items actually overflow the container
    // Need a buffer to avoid false positives, check if scroll width is significantly larger
    const hasOverflow = container.scrollWidth > container.clientWidth + 20;
    
    // Show/hide scroll buttons based on overflow
    if (hasOverflow) {
      controls.style.display = 'flex';
    } else {
      controls.style.display = 'none';
    }
  };

  // Remove any existing legend containers
  const cleanupExistingLegend = () => {
    if (containerRef.current) {
      const existingLegends = containerRef.current.querySelectorAll('.chart-legend-container');
      existingLegends.forEach(legend => {
        try {
          legend.parentNode.removeChild(legend);
        } catch (e) {
          // Ignore removal errors
        }
      });
    }
  };

  // Create the custom scrollable legend with enhanced visibility for scroll buttons
  const createCustomLegend = () => {
    // If not multi-series or no datasets, don't create a legend
    if (!isMultiSeries || !chartData.datasets || chartData.datasets.length === 0) return;
    
    cleanupExistingLegend();
    
    const legendContainer = document.createElement('div');
    legendContainer.className = 'chart-legend-container';
    
    // Scrollable items container
    const legendItemsContainer = document.createElement('div');
    legendItemsContainer.className = 'chart-legend-items';
    legendItemsRef.current = legendItemsContainer;
    
    // Build each legend item
    chartData.datasets.forEach((dataset, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'legend-item';
      
      const colorBox = document.createElement('span');
      colorBox.className = 'legend-item-color';
      
      // Extract solid color for legend dot
      let solidColor = dataset.backgroundColor || dataset.borderColor;
      if (solidColor && typeof solidColor === 'string' && solidColor.includes('rgba')) {
        solidColor = solidColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, 'rgb($1)');
      }
      
      colorBox.style.backgroundColor = solidColor;
      
      const label = document.createElement('span');
      label.className = 'legend-item-label';
      label.textContent = dataset.label || `Dataset ${index + 1}`;
      
      // Click to toggle dataset visibility
      itemDiv.addEventListener('click', () => {
        if (chartRef.current) {
          const chart = chartRef.current;
          const datasetMeta = chart.getDatasetMeta(index);
          datasetMeta.hidden = !datasetMeta.hidden;
          chart.update();
          // Apply "hidden" CSS if toggled off
          if (datasetMeta.hidden) {
            itemDiv.classList.add('hidden');
          } else {
            itemDiv.classList.remove('hidden');
          }
        }
      });
      
      itemDiv.appendChild(colorBox);
      itemDiv.appendChild(label);
      legendItemsContainer.appendChild(itemDiv);
    });
    
    // Create scroll button wrapper - HIDE BY DEFAULT
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'legend-controls';
    buttonWrapper.style.display = 'none'; // Start hidden until we check if needed
    legendControlsRef.current = buttonWrapper;
    
    // Left scroll button
    const leftButton = document.createElement('button');
    leftButton.className = 'legend-btn legend-btn-left';
    leftButton.innerHTML = '&larr;';
    leftButton.addEventListener('click', () => {
      legendItemsContainer.scrollBy({ left: -100, behavior: 'smooth' });
    });
    
    // Right scroll button
    const rightButton = document.createElement('button');
    rightButton.className = 'legend-btn legend-btn-right';
    rightButton.innerHTML = '&rarr;';
    rightButton.addEventListener('click', () => {
      legendItemsContainer.scrollBy({ left: 100, behavior: 'smooth' });
    });
    
    buttonWrapper.appendChild(leftButton);
    buttonWrapper.appendChild(rightButton);
    
    // Add items + controls to legend container
    legendContainer.appendChild(legendItemsContainer);
    legendContainer.appendChild(buttonWrapper);
    
    // Insert legend at the top of the chart container
    if (containerRef.current) {
      containerRef.current.insertBefore(legendContainer, containerRef.current.firstChild);
      legendContainerRef.current = legendContainer;
      
      // Check scroll after a short delay to ensure the DOM is fully rendered
      setTimeout(() => {
        checkScrollButtonsNeeded();
        setLegendCreated(true);
      }, 100);
    }
  };

  // Create the custom legend after chart is mounted
  useEffect(() => {
    // If chart is already created, proceed with legend creation
    if (chartInstance && isMultiSeries && !legendCreated) {
      const timer = setTimeout(() => {
        createCustomLegend();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [chartInstance, isMultiSeries, legendCreated]);

  // Setup a resize listener to recalc legend scroll if multi-series
  useEffect(() => {
    const handleResize = () => {
      if (isMultiSeries && legendCreated) {
        checkScrollButtonsNeeded();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMultiSeries, legendCreated]);

  // Destroy the chart instance on unmount
  useEffect(() => {
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
      cleanupExistingLegend();
      setLegendCreated(false);
    };
  }, [chartInstance]);

  // Save chart instance
  const getChartRef = (chart) => {
    if (chart) {
      chartRef.current = chart;
      setChartInstance(chart);
    }
  };

  // Container height logic - IMPORTANT: Use explicit height
  const containerStyle = {
    height: height === 'auto' ? '100%' : height,
    position: 'relative',
    width: '100%',
  };

  // Determine chart type
  const chartType = type === 'stackedBar' ? 'bar' : type;

  // Enhanced chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We use a custom legend
      },
      tooltip: {
        // Using built-in tooltip with styling improvements
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        footerColor: '#333',
        bodyColor: '#333',
        borderColor: '#333',
        borderWidth: 1,
        cornerRadius: 6,
        boxPadding: 8,
        usePointStyle: true,
        callbacks: {
          // Custom title formatting
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          // Custom label formatting
          label: (tooltipItem) => {
            const dataset = tooltipItem.dataset;
            const value = tooltipItem.formattedValue;
            return ` ${dataset.label}: ${value}`;
          },
          // Add footer with total
          footer: (tooltipItems) => {
            // Calculate total of all values
            let total = 0;
            tooltipItems.forEach((tooltipItem) => {
              total += tooltipItem.parsed.y;
            });
            
            // Format total with commas for thousands
            return `Total: ${total.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
        stacked: type === 'stackedBar',
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        stacked: type === 'stackedBar',
      },
    },
    elements: {
      line: {
        tension: 0.2,
      },
      point: {
        radius: 3,
        hitRadius: 30, // Larger hit area for better tooltip triggering
        hoverRadius: 5,
      },
    },
    interaction: {
      mode: 'index', // Show all values at same X position
      intersect: false, // Don't require cursor to be on point
    },
    hover: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div 
      className={`chart-container ${isMultiSeries ? 'has-legend' : 'no-legend'}`} 
      ref={containerRef} 
      style={containerStyle}
    >
      {chartType === 'line' ? (
        <Line ref={getChartRef} data={chartData} options={options} />
      ) : chartType === 'map' ? (
        <GeoChart data={data} />
      ) : (
        <Bar ref={getChartRef} data={chartData} options={options} />
      )}
    </div>
  );
};

// Minimal GeoChart component (if "type='map'" is used)
const GeoChart = ({ data }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    const container = mapRef.current;
    if (!container) return;
    
    container.innerHTML = ''; // Clear previous

    // Create basic SVG for illustration
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 400');
    svg.style.width = '100%';
    svg.style.height = '100%';

    // Very simplified "map" background
    const mapPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    mapPath.setAttribute('d', 'M0,0 L800,0 L800,400 L0,400 Z');
    mapPath.setAttribute('fill', '#f5f5f7');
    mapPath.setAttribute('stroke', '#666');
    svg.appendChild(mapPath);

    // Find max count for radius scale
    const maxCount = Math.max(...data.map(item => item.cnt || 1));

    // Plot points
    data.forEach(point => {
      if (point.lat && point.long) {
        // Convert lat/long to basic x,y
        const x = ((parseFloat(point.long) + 180) / 360) * 800;
        const y = ((90 - parseFloat(point.lat)) / 180) * 400;

        // Scale circle radius
        const radius = Math.max(3, Math.min(20, ((point.cnt || 1) / maxCount) * 20));
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', 'rgba(66, 133, 244, 0.6)'); // Add transparency
        circle.setAttribute('stroke', 'rgba(51, 51, 51, 0.8)');
        circle.setAttribute('stroke-width', '0.5');

        // Simple tooltip via <title>
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${point.name || 'Location'}: ${point.cnt || 0}`;
        circle.appendChild(title);

        svg.appendChild(circle);
      }
    });

    container.appendChild(svg);
    return () => { container.innerHTML = ''; };
  }, [data]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default Chart;