// Import color palette from '../utils/colors'
import { DEFAULT_COLORS, DARK_MODE_COLORS, generateColorPalette } from '../utils/colors';
import React, { useRef, useEffect, useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler // Keep Filler import
} from 'chart.js';
import WorldMapChart from './WorldMapChart';
import NumberWidget from './NumberWidget';

// Create a custom plugin for dark mode label rendering
const darkModePlugin = {
  id: 'darkModePlugin',
  beforeDraw: function(chart) {
    const ctx = chart.ctx;
    if (chart.options._isDarkMode && chart.config.type === 'pie') {
      // Store original text styling
      const originalFill = ctx.fillStyle;
      const originalStroke = ctx.strokeStyle;
      const originalFont = ctx.font;
      
      // Apply custom label styling for dark mode
      chart.data.datasets[0]._meta = chart.data.datasets[0]._meta || {};
      
      // Force the chart to redraw labels with light color for dark mode
      chart.options.plugins.legend.labels.color = '#ffffff';
      
      // Restore original styling after draw
      setTimeout(() => {
        ctx.fillStyle = originalFill;
        ctx.strokeStyle = originalStroke;
        ctx.font = originalFont;
      }, 0);
    }
  }
};

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,  // Important for area charts
  darkModePlugin // Custom plugin for dark mode fixes
);

/**
 * Universal chart component that handles both simple and multi-series data
 */
const Chart = ({
  data,
  title,
  type = 'line',
  color = '#4285F4',
  height = 'auto',
  format,
  pointRadius = 3,
  showPoints = true,
  fill = false,
  isDarkMode = false
}) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const legendContainerRef = useRef(null);
  const legendItemsRef = useRef(null);
  const legendControlsRef = useRef(null);

  const [chartInstance, setChartInstance] = useState(null);
  const [legendCreated, setLegendCreated] = useState(false);

  // If this is a numberDisplay, render NumberWidget instead
  if (type === 'numberDisplay') {
    let value = 0;

    // Extract the value from the data based on format
    if (Array.isArray(data) && data.length > 0) {
      // For single value metrics, use the most recent data point
      value = data[data.length - 1].value;
    } else if (data && typeof data === 'object' && data.value !== undefined) {
      // If data is just a single object with a value
      value = data.value;
    }

    return (
      <NumberWidget
        value={value}
        format={format}
        label={title}
        color={color}
        isDarkMode={isDarkMode}
      />
    );
  }

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

  // Determine if this is a horizontal bar chart
  const isHorizontal = type === 'horizontalBar';

  // Determine if this is an area chart (line with fill)
  const isAreaChart = type === 'area';

  // Determine if this is a stacked bar chart
  const isStackedBar = type === 'stackedBar';

  // Determine actual chart type
  let actualChartType;
  if (isAreaChart) {
    actualChartType = 'line';
  } else if (isStackedBar) {
    actualChartType = 'bar';
  } else {
    actualChartType = type;
  }

  // For pie charts, prepare the data differently
  const isPieChart = type === 'pie';

  // Use theme-specific color palette
  const defaultColors = isDarkMode ? DARK_MODE_COLORS : DEFAULT_COLORS;

  // Adjust the default color based on theme
  const themeAdjustedColor = isDarkMode && color === '#4285F4' ? '#77aaff' : color;

  // Build chartData depending on format
  let chartData;
  if (isPieChart) {
    // For pie charts
    if (Array.isArray(data)) {
      const labels = data.map(item => item.category || item.label || item.date);
      const values = data.map(item => parseFloat(item.value || item.count || item.cnt || 0));

      // Generate colors for each slice
      const colors = [];
      for (let i = 0; i < data.length; i++) {
        // Use the default colors palette
        colors.push(defaultColors[i % defaultColors.length]);
      }

      chartData = {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace(/[^,]+(?=\))/, '1')), // Solid border
          borderWidth: 1,
          hoverOffset: 15,
          // Custom config for pie charts in dark mode
          rotation: 0,
          // For dark mode label visibility
          datalabels: {
            color: isDarkMode ? '#ffffff' : '#333333',
            font: {
              weight: 'bold',
              size: 12
            },
            formatter: function(value, context) {
              return context.chart.data.labels[context.dataIndex];
            }
          }
        }]
      };
    } else if (isMultiSeries) {
      // Convert multi-series data to pie format
      const labels = data.datasets.map(ds => ds.label);
      const values = data.datasets.map(ds =>
        ds.data.reduce((sum, val) => sum + (val || 0), 0)
      );

      // Use dataset colors if available or default colors
      const colors = data.datasets.map((ds, i) =>
        ds.backgroundColor || defaultColors[i % defaultColors.length]
      );

      chartData = {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace(/[^,]+(?=\))/, '1')),
          borderWidth: 1,
          hoverOffset: 15,
          // Custom config for pie charts in dark mode
          rotation: 0,
          // For dark mode label visibility
          datalabels: {
            color: isDarkMode ? '#ffffff' : '#333333',
            font: {
              weight: 'bold',
              size: 12
            },
            formatter: function(value, context) {
              return context.chart.data.labels[context.dataIndex];
            }
          }
        }]
      };
    }
  } else if (isMultiSeries) {
    // Multi-series data format (for line, bar, area charts)
    chartData = {
      labels: data.labels,
      datasets: data.datasets.map((dataset, index) => {
        // Extract color without alpha if it already has it
        let baseColor = dataset.backgroundColor || dataset.borderColor || defaultColors[index % defaultColors.length];
        
        if (baseColor && baseColor.includes('rgba')) {
          // If already RGBA, extract the RGB part
          baseColor = baseColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, 'rgb($1)');
        } else if (baseColor && baseColor.includes('#') && baseColor.length === 9) {
          // If hex with alpha, remove alpha
          baseColor = baseColor.substring(0, 7);
        }
        
        // For dark mode, use DARK_MODE_COLORS if the baseColor is from DEFAULT_COLORS
        if (isDarkMode) {
          const defaultIndex = DEFAULT_COLORS.indexOf(baseColor);
          if (defaultIndex >= 0) {
            baseColor = DARK_MODE_COLORS[defaultIndex % DARK_MODE_COLORS.length];
          }
        }

        return {
          ...dataset,
          borderWidth: 2,
          pointRadius: showPoints ? pointRadius : 0, // Control point visibility
          pointHoverRadius: showPoints ? pointRadius + 2 : 0,
          fill: isAreaChart || dataset.fill || fill, // Enable fill for area charts
          backgroundColor: hexToRgba(baseColor, isAreaChart ? 0.3 : 0.6), // More transparent for area
          borderColor: hexToRgba(baseColor, 0.8),
          hoverBackgroundColor: hexToRgba(baseColor, 0.8),
          hoverBorderColor: baseColor,
        };
      }),
    };
  } else {
    // Determine labels based on chart type and data structure
    const getLabels = () => {
      if (isPieChart) {
        return (data || []).map(item =>
          item.category || item.country || item.label ||
          Object.values(item).find(v => typeof v === 'string')
        );
      } else if (isHorizontal) {
        // For horizontal bar charts, use category or any string field for labels
        return (data || []).map(item => {
          return item.category || item.country || item.label ||
                 Object.values(item).find(v => typeof v === 'string');
        });
      } else {
        // For other charts, use date or existing label fields
        return (data || []).map(item => {
          // If date has time component, remove it
          if (item.date && item.date.includes(' ')) {
            return item.date.split(' ')[0];
          }
          return item.date;
        });
      }
    };

    // Determine values based on chart type and data structure
    const getValues = () => {
      return (data || []).map(item => {
        // Support multiple value field names
        return parseFloat(item.value || item.cnt || item.count || 0);
      });
    };

    chartData = {
      labels: getLabels(),
      datasets: [
        {
          label: title,
          data: getValues(),
          backgroundColor: hexToRgba(themeAdjustedColor, isAreaChart ? 0.3 : 0.6),
          borderColor: hexToRgba(themeAdjustedColor, 0.8),
          borderWidth: 2,
          pointRadius: showPoints ? pointRadius : 0, // Control point visibility
          pointHoverRadius: showPoints ? pointRadius + 2 : 0,
          fill: isAreaChart || fill, // Enable fill for area charts
          hoverBackgroundColor: hexToRgba(themeAdjustedColor, 0.8),
          hoverBorderColor: themeAdjustedColor,
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
    if ((!isMultiSeries && !isPieChart) || !chartData.datasets || chartData.datasets.length === 0) return;

    cleanupExistingLegend();

    const legendContainer = document.createElement('div');
    legendContainer.className = 'chart-legend-container';

    // Scrollable items container
    const legendItemsContainer = document.createElement('div');
    legendItemsContainer.className = 'chart-legend-items';
    legendItemsRef.current = legendItemsContainer;

    // For pie charts, use the labels array for legend
    const legendItems = isPieChart
      ? chartData.labels.map((label, i) => ({
          label,
          backgroundColor: chartData.datasets[0].backgroundColor[i]
        }))
      : chartData.datasets;

    // Build each legend item
    legendItems.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'legend-item';

      const colorBox = document.createElement('span');
      colorBox.className = 'legend-item-color';

      // Extract solid color for legend dot
      let solidColor = isPieChart
        ? item.backgroundColor
        : (item.backgroundColor || item.borderColor);

      if (solidColor && typeof solidColor === 'string' && solidColor.includes('rgba')) {
        solidColor = solidColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, 'rgb($1)');
      }

      colorBox.style.backgroundColor = solidColor;

      const label = document.createElement('span');
      label.className = 'legend-item-label';
      label.textContent = item.label || `Dataset ${index + 1}`;

      // Click to toggle dataset visibility
      itemDiv.addEventListener('click', () => {
        if (chartRef.current) {
          const chart = chartRef.current;

          if (isPieChart) {
            // For pie charts, we hide/show the specific data point
            const meta = chart.getDatasetMeta(0);
            const arcElement = meta.data[index];
            arcElement.hidden = !arcElement.hidden;
          } else {
            // For other charts, hide/show the entire dataset
            const datasetMeta = chart.getDatasetMeta(index);
            datasetMeta.hidden = !datasetMeta.hidden;
          }

          chart.update();

          // Apply "hidden" CSS if toggled off
          if ((isPieChart && chart.getDatasetMeta(0).data[index].hidden) ||
              (!isPieChart && chart.getDatasetMeta(index).hidden)) {
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
    if (chartInstance && (isMultiSeries || isPieChart) && !legendCreated) {
      const timer = setTimeout(() => {
        createCustomLegend();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [chartInstance, isMultiSeries, legendCreated, isPieChart]);

  // Setup a resize listener to recalc legend scroll if multi-series
  useEffect(() => {
    const handleResize = () => {
      if ((isMultiSeries || isPieChart) && legendCreated) {
        checkScrollButtonsNeeded();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMultiSeries, legendCreated, isPieChart]);

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
  let chartType = actualChartType;
  // For horizontal bar, we'll still use the Bar component but with different options
  if (isHorizontal) {
    chartType = 'bar';
  }

  // Dark mode adaptations for chart options
  const getChartOptions = () => {
    // Set colors based on theme
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDarkMode ? '#ffffff' : '#333333';
    const tooltipBackground = isDarkMode ? 'rgba(33, 33, 33, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipTextColor = isDarkMode ? '#e0e0e0' : '#333333';
    const tooltipBorderColor = isDarkMode ? '#444444' : '#333333';

    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: isHorizontal ? 'y' : 'x', // This is the key setting for horizontal bars
      plugins: {
        legend: {
          display: false, // We use a custom legend
          labels: {
            color: textColor // This is for built-in legend if we ever use it
          }
        },
        tooltip: {
          // Using built-in tooltip with styling improvements
          enabled: true,
          mode: isPieChart ? 'nearest' : 'index',
          intersect: isPieChart,
          backgroundColor: tooltipBackground,
          titleColor: tooltipTextColor,
          footerColor: tooltipTextColor,
          bodyColor: tooltipTextColor,
          borderColor: tooltipBorderColor,
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
              return ` ${dataset.label || tooltipItem.label}: ${value}`;
            },
            // Add footer with total
            footer: (tooltipItems) => {
              // For horizontal bar and pie charts, we might not want to show a total
              if (isHorizontal || isPieChart) return '';

              // Calculate total of all values
              let total = 0;
              tooltipItems.forEach((tooltipItem) => {
                // Support both x and y values depending on chart orientation
                total += tooltipItem.parsed.y || tooltipItem.parsed.x || 0;
              });

              // Format total with commas for thousands
              return `Total: ${total.toLocaleString()}`;
            }
          }
        },
        title: {
          color: textColor, // Text color for any title
          display: false // We don't use the built-in title
        },
        // Fix for doughnut/pie chart labels
        datalabels: {
          color: textColor,
          font: {
            weight: 'bold'
          },
          display: function(context) {
            return context.chart.width > 100; // Only show labels if chart is large enough
          }
        }
      },
      scales: {
        x: {
          display: !isPieChart, // Hide scales for pie charts
          grid: { 
            display: false,
            borderColor: gridColor 
          },
          border: {
            color: gridColor
          },
          ticks: {
            maxRotation: isHorizontal ? 0 : 45, // Keep 45 degree rotation
            minRotation: isHorizontal ? 0 : 45, // Keep 45 degree rotation
            autoSkip: true, // Use default autoSkip
            color: textColor // Set tick color based on theme
          },
          stacked: isStackedBar,
        },
        y: {
          display: !isPieChart, // Hide scales for pie charts
          beginAtZero: true,
          grid: {
            color: gridColor,
            borderColor: gridColor
          },
          border: {
            color: gridColor
          },
          ticks: {
            color: textColor // Set tick color based on theme
          },
          stacked: isStackedBar,
        },
      },
      elements: {
        line: {
          tension: 0.2,
        },
        point: {
          radius: showPoints ? pointRadius : 0,
          hitRadius: 30, // Larger hit area for better tooltip triggering
          hoverRadius: showPoints ? pointRadius + 2 : 0,
        },
        arc: {
          borderWidth: 0 // For pie charts
        }
      },
      interaction: {
        mode: isPieChart ? 'nearest' : 'index', // Show all values at same X position
        intersect: isPieChart, // Don't require cursor to be on point except for pie
      },
      hover: {
        mode: isPieChart ? 'nearest' : 'index',
        intersect: isPieChart,
      },
    };
  };

  // If this is a map, render WorldMapChart instead
  if (chartType === 'map') {
    return (
      <div
        className="chart-container no-legend"
        ref={containerRef}
        style={containerStyle}
      >
        <WorldMapChart data={data} isDarkMode={isDarkMode} />
      </div>
    );
  }

  // Determine which chart component to render based on chart type
  let ChartComponent;
  if (chartType === 'line') {
    ChartComponent = Line;
  } else if (chartType === 'bar') {
    ChartComponent = Bar;
  } else if (chartType === 'pie') {
    ChartComponent = Pie;
  } else {
    // Default to line
    ChartComponent = Line;
  }

  return (
    <div
      className={`chart-container ${(isMultiSeries || isPieChart) ? 'has-legend' : 'no-legend'}`}
      ref={containerRef}
      style={containerStyle}
    >
      <ChartComponent 
        ref={getChartRef} 
        data={chartData} 
        options={{
          ...getChartOptions(),
          _isDarkMode: isDarkMode // Pass dark mode state to plugin
        }} 
      />
    </div>
  );
};

export default Chart;