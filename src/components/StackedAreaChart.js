import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  hexToRgba, 
  DEFAULT_COLORS, 
  DARK_MODE_COLORS, 
  HIGH_CONTRAST_DARK_COLORS, 
  generateColorPalette 
} from '../utils/colors';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * StackedAreaChart component specifically designed for stacked area charts
 * This version uses direct Chart.js configuration to ensure proper stacking
 */
const StackedAreaChart = ({ 
  data, 
  title, 
  height = 'auto', 
  format,
  isDarkMode = false
}) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const legendContainerRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [legendCreated, setLegendCreated] = useState(false);
  const watermarkRef = useRef(null); // Add watermark ref

  // Container for storing legend item refs
  const legendItemsRef = useRef(null);
  const legendControlsRef = useRef(null);

  // Process data specifically for stacked area charts
  const processChartData = () => {
    if (!data || !data.labels || !data.datasets) {
      console.warn('StackedAreaChart: Invalid data format', data);
      return { labels: [], datasets: [] };
    }

    // Select the appropriate color palette based on theme
    // For dark mode and stacked areas, using the high contrast palette is recommended
    const colorPalette = isDarkMode 
      ? HIGH_CONTRAST_DARK_COLORS
      : DEFAULT_COLORS;
    
    // Generate appropriate number of colors if not enough in the palette
    const colors = data.datasets.length > colorPalette.length
      ? generateColorPalette(data.datasets.length, isDarkMode, isDarkMode) // Set highContrast=true in dark mode
      : colorPalette.slice(0, data.datasets.length);

    // Important: Properly ordering datasets for visual stacking
    // For stacked area charts, the FIRST dataset will appear at the BOTTOM
    const processedDatasets = [...data.datasets].map((dataset, index) => {
      // Use the theme-appropriate color
      const baseColor = colors[index % colors.length];
      
      // Adjust opacity based on theme - use higher opacity in dark mode for better visibility
      const backgroundOpacity = 0.6 //= isDarkMode ? 0.7 : 0.5;
      const borderOpacity = 0.9//= isDarkMode ? 0.9 : 0.8;

      return {
        ...dataset,
        borderWidth: isDarkMode ? 2 : 1.5, // Thicker borders in dark mode for visibility
        pointRadius: 0, // Hide points for cleaner area visualization
        pointHoverRadius: 3, // Show points on hover
        borderColor: hexToRgba(baseColor, borderOpacity),
        backgroundColor: hexToRgba(baseColor, backgroundOpacity),
        hoverBackgroundColor: hexToRgba(baseColor, 0.8),
        // The fill property is critical for stacking
        fill: true, // This must be true for stacking to work
      };
    });

    return {
      labels: data.labels,
      datasets: processedDatasets
    };
  };

  // Check if scroll buttons are needed for legend
  const checkScrollButtonsNeeded = () => {
    if (!legendItemsRef.current || !legendControlsRef.current) return;

    const container = legendItemsRef.current;
    const controls = legendControlsRef.current;

    // Calculate if the legend items overflow the container
    const hasOverflow = container.scrollWidth > container.clientWidth + 20;

    // Show/hide scroll buttons based on overflow
    controls.style.display = hasOverflow ? 'flex' : 'none';
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

  // Create a custom scrollable legend
  const createCustomLegend = () => {
    if (!data || !data.datasets || data.datasets.length === 0) return;

    cleanupExistingLegend();

    const legendContainer = document.createElement('div');
    legendContainer.className = 'chart-legend-container';

    // Scrollable items container
    const legendItemsContainer = document.createElement('div');
    legendItemsContainer.className = 'chart-legend-items';
    legendItemsRef.current = legendItemsContainer;

    // Select appropriate color palette based on theme
    const colorPalette = isDarkMode 
      ? HIGH_CONTRAST_DARK_COLORS 
      : DEFAULT_COLORS;

    // Generate colors if needed
    const colors = data.datasets.length > colorPalette.length
      ? generateColorPalette(data.datasets.length, isDarkMode, isDarkMode)
      : colorPalette.slice(0, data.datasets.length);

    // Important: For the legend display, we want to show the datasets in their logical order
    const legendItems = [...data.datasets];

    // Create legend items
    legendItems.forEach((dataset, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'legend-item';

      const colorBox = document.createElement('span');
      colorBox.className = 'legend-item-color';

      // Use theme-appropriate color
      const solidColor = colors[index % colors.length];
      colorBox.style.backgroundColor = solidColor;

      const label = document.createElement('span');
      label.className = 'legend-item-label';
      label.textContent = dataset.label || `Dataset ${index + 1}`;

      // Add click handler to toggle visibility
      itemDiv.addEventListener('click', () => {
        if (chartRef.current) {
          const chart = chartRef.current;
          
          // Use the correct index for the dataset in the chart
          const datasetMeta = chart.getDatasetMeta(index);
          datasetMeta.hidden = !datasetMeta.hidden;
          chart.update();

          // Apply "hidden" class if toggled off
          if (chart.getDatasetMeta(index).hidden) {
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

    // Create scroll button wrapper
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

      // Check scroll after rendering
      setTimeout(() => {
        checkScrollButtonsNeeded();
        setLegendCreated(true);
      }, 100);
    }
  };

  // Create the custom legend after chart is mounted
  useEffect(() => {
    if (chartInstance && !legendCreated) {
      const timer = setTimeout(() => {
        createCustomLegend();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [chartInstance, legendCreated]);

  // Setup a resize listener for legend scrolling
  useEffect(() => {
    const handleResize = () => {
      if (legendCreated) {
        checkScrollButtonsNeeded();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [legendCreated]);

  // Add watermark to the chart
  useEffect(() => {
    if (containerRef.current) {
      // Remove any existing watermark
      const existingWatermark = containerRef.current.querySelector('.chart-watermark');
      if (existingWatermark) {
        existingWatermark.remove();
      }
      
      // Create new watermark element
      const watermark = document.createElement('div');
      watermark.className = 'chart-watermark';
      watermarkRef.current = watermark;
      
      // Set the background image based on the theme
      const logoUrl = isDarkMode 
        ? 'https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/Owl_Logomark_White_RGB.png'
        : 'https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/Owl_Logomark_Black_RGB.png';
      
      // Only set the background image - the positioning and size come from CSS
      watermark.style.backgroundImage = `url(${logoUrl})`;
    
      // Add the watermark to the container
      containerRef.current.appendChild(watermark);
    }
    
    // Cleanup function to remove watermark when component unmounts
    return () => {
      if (watermarkRef.current) {
        try {
          watermarkRef.current.remove();
        } catch (e) {
          // Ignore errors if element was already removed
        }
      }
    };
  }, [containerRef.current, isDarkMode]); // Re-run when the container or theme changes

  // Cleanup on unmount
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

  // Get chart options
  const getChartOptions = () => {
    // Set colors based on theme
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDarkMode ? '#ffffff' : '#333333';
    const tooltipBackground = isDarkMode ? 'rgba(33, 33, 33, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipTextColor = isDarkMode ? '#e0e0e0' : '#333333';
    const tooltipBorderColor = isDarkMode ? '#444444' : '#d9d9d9';
  
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // We use custom legend
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: tooltipBackground,
          titleColor: tooltipTextColor,
          bodyColor: tooltipTextColor,
          footerColor: tooltipTextColor, // Important for total text color
          borderColor: tooltipBorderColor,
          borderWidth: 1,
          cornerRadius: 6,
          padding: 8,
          // Custom tooltip callbacks for formatted values
          callbacks: {
            title: (tooltipItems) => {
              return tooltipItems[0].label;
            },
            label: (tooltipItem) => {
              const dataset = tooltipItem.dataset;
              let value = tooltipItem.parsed.y;
              
              // Apply formatting if provided
              if (format && typeof format === 'function') {
                value = format(value);
              } else if (typeof value === 'number') {
                value = value.toLocaleString();
              }
              
              return ` ${dataset.label}: ${value}`;
            },
            footer: (tooltipItems) => {
              // Calculate total for all visible datasets at this point
              let total = 0;
              tooltipItems.forEach((tooltipItem) => {
                total += tooltipItem.parsed.y || 0;
              });
              
              // Format total if formatting function provided
              let formattedTotal = total;
              if (format && typeof format === 'function') {
                formattedTotal = format(total);
              } else if (typeof total === 'number') {
                formattedTotal = total.toLocaleString();
              }
              
              return `Total: ${formattedTotal}`;
            }
          }
        },
        title: {
          display: false
        },
        // Configure the Filler plugin for proper area stacking
        filler: {
          propagate: true
        }
      },
      scales: {
        x: {
          grid: { 
            display: false,
            borderColor: gridColor 
          },
          border: {
            color: gridColor
          },
          ticks: {
            maxRotation: 0, // Keep labels horizontal
            minRotation: 0, // Keep labels horizontal
            autoSkip: true, // Don't let Chart.js decide which labels to skip
            autoSkipPadding: 15,
            color: textColor,
            
          }
        },
        y: {
          beginAtZero: true,
          stacked: true, 
          grid: {
            color: gridColor,
            borderColor: gridColor
          },
          border: {
            color: gridColor
          },
          ticks: {
            color: textColor
          }
        }
      },
      elements: {
        line: {
          tension: 0.2, // Adds slight curve to lines
        },
        point: {
          radius: 0, // Hide points for cleaner area look
          hitRadius: 30, // Large hit area for interaction
          hoverRadius: 3, // Small point on hover
        }
      },
      interaction: {
        mode: 'index',
        intersect: false,
      }
    };
  };

  // Setup label count detection and adjustment
  useEffect(() => {
    const updateChartOptions = () => {
      if (chartRef.current && containerRef.current) {
        // Force chart update to apply new options
        chartRef.current.update();
      }
    };

    // Update on mount and resize
    updateChartOptions();
    window.addEventListener('resize', updateChartOptions);
    
    return () => {
      window.removeEventListener('resize', updateChartOptions);
    };
  }, [chartInstance, data]);

  // Process chart data with theme-aware colors
  const chartData = processChartData();

  // Container height style
  const containerStyle = {
    height: height === 'auto' ? '100%' : height,
    position: 'relative',
    width: '100%',
  };

  // If no data or invalid data, show message
  if (!chartData || !chartData.labels || !chartData.datasets || chartData.labels.length === 0) {
    return (
      <div className="chart-container no-legend" style={containerStyle}>
        <div className="no-data-message">No data available</div>
      </div>
    );
  }

  return (
    <div
      className="chart-container has-legend"
      ref={containerRef}
      style={containerStyle}
      data-theme={isDarkMode ? 'dark' : 'light'}
    >
      <Line
        ref={getChartRef}
        data={chartData}
        options={getChartOptions()}
      />
    </div>
  );
};

export default StackedAreaChart;