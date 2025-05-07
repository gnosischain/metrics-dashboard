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
  Filler
} from 'chart.js';
import { DEFAULT_COLORS, DARK_MODE_COLORS, hexToRgba } from '../utils/colors';
import WorldMapChart from './WorldMapChart';
import NumberWidget from './NumberWidget';
import StackedAreaChart from './StackedAreaChart';

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
  Filler
);

/**
 * Universal chart component that handles various chart types
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
  stacked = false,
  stackedArea = false,
  isDarkMode = false
}) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const legendContainerRef = useRef(null);
  const legendItemsRef = useRef(null);
  const legendControlsRef = useRef(null);
  const watermarkRef = useRef(null);

  const [chartInstance, setChartInstance] = useState(null);
  const [legendCreated, setLegendCreated] = useState(false);

  // Safety check for data validity
  if (!data) {
    // If data is null or undefined, show a message in the chart area
    return (
      <div 
        className="chart-container" 
        style={{
          height: height === 'auto' ? '100%' : height,
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="no-data-message">No data available</div>
      </div>
    );
  }

  // Handle numberDisplay type
  if (type === 'numberDisplay') {
    let value = 0;
    if (Array.isArray(data) && data.length > 0) {
      value = parseFloat(data[data.length - 1]?.value || 0);
    } else if (data && typeof data === 'object' && data.value !== undefined) {
      value = parseFloat(data.value || 0);
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

  // Handle special chart types
  const isAreaChart = type === 'area';
  const isStackedArea = isAreaChart && (stackedArea || stacked);
  const isStackedBar = type === 'stackedBar' || (type === 'bar' && stacked);
  const isHorizontal = type === 'horizontalBar';
  const isPieChart = type === 'pie';
  
  // Safely check for multi-series data structure
  const isMultiSeries = data && 
                       typeof data === 'object' && 
                       !Array.isArray(data) && 
                       data.labels && 
                       Array.isArray(data.labels) &&
                       data.datasets && 
                       Array.isArray(data.datasets);

  // Determine actual chart type
  let actualChartType;
  if (isAreaChart || isStackedArea) {
    actualChartType = 'line'; // Area charts are Line charts with fill
  } else if (isStackedBar) {
    actualChartType = 'bar';
  } else {
    actualChartType = type;
  }

  // Use theme-specific color palette
  const defaultColors = isDarkMode ? DARK_MODE_COLORS : DEFAULT_COLORS;

  // Adjust the default color based on theme
  const themeAdjustedColor = isDarkMode && color === '#4285F4' ? '#77aaff' : color;

  // For stackedArea, delegate to StackedAreaChart component
  if (isStackedArea && isMultiSeries) {
    return (
      <StackedAreaChart
        data={data}
        title={title}
        height={height}
        format={format ? format : null}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Build chartData depending on format
  let chartData;
  
  if (isPieChart) {
    // For pie charts, process the data into the required format if necessary
    if (Array.isArray(data)) {
      // Get labels
      const labels = data.map(item => 
        item.category || item.country || item.label || 
        Object.values(item).find(v => typeof v === 'string') || 'Unknown'
      );
      
      // Get values
      const values = data.map(item => 
        parseFloat(item.value || item.cnt || item.count || 0)
      );
      
      // Generate colors
      const backgroundColors = values.map((_, i) => 
        hexToRgba(defaultColors[i % defaultColors.length], 0.7)
      );
      
      // Set up chart data
      chartData = {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('rgba', 'rgb').replace(/,\s*[\d.]+\)/, ')')),
          borderWidth: 1
        }]
      };
    } else if (isMultiSeries) {
      // If already in multi-series format, use it directly
      chartData = data;
    } else {
      // If data is somehow invalid for a pie chart, create a fallback
      chartData = {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: [hexToRgba(themeAdjustedColor, 0.7)],
          borderColor: [hexToRgba(themeAdjustedColor, 0.9)],
          borderWidth: 1
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
          baseColor = baseColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, 'rgb($1)');
        } else if (baseColor && baseColor.includes('#') && baseColor.length === 9) {
          baseColor = baseColor.substring(0, 7);
        }
        
        // For dark mode, use DARK_MODE_COLORS if the baseColor is from DEFAULT_COLORS
        if (isDarkMode) {
          const defaultIndex = DEFAULT_COLORS.indexOf(baseColor);
          if (defaultIndex >= 0) {
            baseColor = DARK_MODE_COLORS[defaultIndex % DARK_MODE_COLORS.length];
          }
        }

        // Set fill property
        let fillValue = dataset.fill || fill;
        if (isAreaChart && !isStackedArea) {
          fillValue = 'origin';
        }

        return {
          ...dataset,
          borderWidth: 2,
          pointRadius: showPoints ? pointRadius : 0,
          pointHoverRadius: showPoints ? pointRadius + 2 : 0,
          fill: fillValue,
          backgroundColor: hexToRgba(baseColor, 0.6),
          borderColor: hexToRgba(baseColor, 0.9),
          hoverBackgroundColor: hexToRgba(baseColor, 0.8),
          hoverBorderColor: baseColor
        };
      }),
    };
  } else {
    // Standard date/value format
    const getLabels = () => {
      // Handle potential empty data array
      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      if (isPieChart) {
        return data.map(item => item.category || item.country || item.label ||
          Object.values(item).find(v => typeof v === 'string') || 'Unknown');
      } else if (isHorizontal) {
        return data.map(item => {
          return item.category || item.country || item.label ||
                 Object.values(item).find(v => typeof v === 'string') || 'Unknown';
        });
      } else {
        return data.map(item => {
          if (!item) return 'Unknown';
          if (item.date && typeof item.date === 'string' && item.date.includes(' ')) {
            return item.date.split(' ')[0];
          }
          return item.date || 'Unknown';
        });
      }
    };

    const getValues = () => {
      // Handle potential empty data array
      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      return data.map(item => {
        if (!item) return 0;
        return parseFloat(item.value || item.cnt || item.count || 0);
      });
    };

    chartData = {
      labels: getLabels(),
      datasets: [
        {
          label: title || 'Data',
          data: getValues(),
          backgroundColor: hexToRgba(themeAdjustedColor, 0.6),
          borderColor: hexToRgba(themeAdjustedColor, 0.9),
          borderWidth: 2,
          pointRadius: showPoints ? pointRadius : 0,
          pointHoverRadius: showPoints ? pointRadius + 2 : 0,
          fill: isAreaChart ? 'origin' : fill,
          hoverBackgroundColor: hexToRgba(themeAdjustedColor, 0.8),
          hoverBorderColor: themeAdjustedColor
        },
      ],
    };
  }

  // Define chart options - consistently for all chart types
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
      indexAxis: isHorizontal ? 'y' : 'x',
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: isPieChart ? 0 : 10,
          bottom: 15  
        }
      },
      plugins: {
        legend: {
          display: false, // We use custom legend
          labels: {
            color: textColor
          }
        },
        tooltip: {
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
            title: (tooltipItems) => {
              if (!tooltipItems || tooltipItems.length === 0) return '';
              return tooltipItems[0].label || '';
            },
            label: (tooltipItem) => {
              if (!tooltipItem) return '';
              const dataset = tooltipItem.dataset || {};
              const value = tooltipItem.formattedValue || '0';
              return ` ${dataset.label || tooltipItem.label || 'Value'}: ${value}`;
            },
            footer: (tooltipItems) => {
              if (isHorizontal || isPieChart || !tooltipItems || tooltipItems.length === 0) return '';

              let total = 0;
              tooltipItems.forEach((tooltipItem) => {
                if (!tooltipItem) return;
                const parsed = tooltipItem.parsed || {};
                total += parsed.y || parsed.x || 0;
              });

              return `Total: ${total.toLocaleString()}`;
            }
          }
        },
        title: {
          color: textColor,
          display: false
        },
        // Configure the Filler plugin specifically for area charts
        filler: {
          propagate: true // This helps with stacked areas
        }
      },
      scales: isPieChart ? undefined : {
        x: {
          display: !isPieChart,
          grid: { 
            display: false,
            borderColor: gridColor 
          },
          border: {
            color: gridColor
          },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10,
            color: textColor,
            padding: 8
          },
          // Only stack bar charts, not area charts (area charts use fill instead)
          stacked: isStackedBar,
        },
        y: {
          display: !isPieChart,
          beginAtZero: true,
          grid: {
            color: gridColor,
            borderColor: gridColor
          },
          border: {
            color: gridColor
          },
          ticks: {
            color: textColor,
            padding: 8
          },
          // Only stack bar charts, not area charts (area charts use fill instead)
          stacked: isStackedBar,
        },
      },
      elements: {
        line: {
          tension: 0.2,
        },
        point: {
          radius: 0,
          hitRadius: 30,
          hoverRadius: 0,
        },
        arc: {
          borderWidth: 0
        }
      },
      interaction: {
        mode: isPieChart ? 'nearest' : 'index',
        intersect: isPieChart,
      },
      hover: {
        mode: isPieChart ? 'nearest' : 'index',
        intersect: isPieChart,
      },
    };
  };

  // Check if scroll buttons are needed for legend
  const checkScrollButtonsNeeded = () => {
    if (!legendItemsRef.current || !legendControlsRef.current) return;

    const container = legendItemsRef.current;
    const controls = legendControlsRef.current;

    // Calculate if the legend items actually overflow the container
    const hasOverflow = container.scrollWidth > container.clientWidth + 20;

    // Show/hide scroll buttons based on overflow
    if (hasOverflow) {
      controls.style.display = 'flex';
    } else {
      controls.style.display = 'none';
    }
  };

  // Handle responsive behavior for legend items
  const handleResponsiveLegend = () => {
    if (!legendItemsRef.current) return;
    
    const container = legendItemsRef.current;
    
    // Get all legend items
    const items = container.querySelectorAll('.legend-item');
    
    // If small screen, set flex-wrap to wrap
    if (window.innerWidth <= 768) {
      container.style.flexWrap = 'wrap';
      container.style.justifyContent = 'center';
      items.forEach(item => {
        item.style.marginBottom = '8px';
      });
    } else {
      container.style.flexWrap = 'nowrap';
      container.style.justifyContent = 'flex-start';
      items.forEach(item => {
        item.style.marginBottom = '0';
      });
      checkScrollButtonsNeeded();
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

  // Create the custom scrollable legend
  const createCustomLegend = () => {
    // Safety check: if no chart data or datasets, don't create a legend
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) return;
    
    // If not multi-series or pie chart, don't create a legend
    if ((!isMultiSeries && !isPieChart)) return;

    cleanupExistingLegend();

    const legendContainer = document.createElement('div');
    legendContainer.className = 'chart-legend-container';

    // Scrollable items container
    const legendItemsContainer = document.createElement('div');
    legendItemsContainer.className = 'chart-legend-items';
    legendItemsRef.current = legendItemsContainer;

    // For pie charts, use the labels array for legend
    let legendItems;
    if (isPieChart && chartData && chartData.labels) {
      legendItems = chartData.labels.map((label, i) => ({
        label,
        backgroundColor: chartData.datasets[0]?.backgroundColor[i] || defaultColors[i % defaultColors.length]
      }));
    } else if (chartData && chartData.datasets) {
      legendItems = chartData.datasets;
    } else {
      // No valid items for legend
      return;
    }

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

      colorBox.style.backgroundColor = solidColor || defaultColors[index % defaultColors.length];

      const label = document.createElement('span');
      label.className = 'legend-item-label';
      label.textContent = item.label || `Dataset ${index + 1}`;

      // Click to toggle dataset visibility
      itemDiv.addEventListener('click', () => {
        if (chartRef.current) {
          const chart = chartRef.current;

          if (isPieChart) {
            // For pie charts, we hide/show the specific data point
            try {
              const meta = chart.getDatasetMeta(0);
              if (meta && meta.data && meta.data[index]) {
                const arcElement = meta.data[index];
                arcElement.hidden = !arcElement.hidden;
                chart.update();
              }
            } catch (e) {
              console.error('Error toggling pie chart segment:', e);
            }
          } else {
            // For other charts, hide/show the entire dataset
            try {
              const datasetMeta = chart.getDatasetMeta(index);
              if (datasetMeta) {
                datasetMeta.hidden = !datasetMeta.hidden;
                chart.update();
              }
            } catch (e) {
              console.error('Error toggling dataset visibility:', e);
            }
          }

          // Apply "hidden" CSS class based on visibility
          try {
            if ((isPieChart && chart.getDatasetMeta(0).data[index].hidden) ||
                (!isPieChart && chart.getDatasetMeta(index).hidden)) {
              itemDiv.classList.add('hidden');
            } else {
              itemDiv.classList.remove('hidden');
            }
          } catch (e) {
            console.error('Error updating legend item CSS:', e);
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
        handleResponsiveLegend();
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

  // Setup a resize listener to recalc legend scroll if multi-series
  useEffect(() => {
    const handleResize = () => {
      if ((isMultiSeries || isPieChart) && legendCreated) {
        handleResponsiveLegend();
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

  // Container height logic
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

  // If this is a map, render WorldMapChart instead
  if (chartType === 'map') {
    return (
      <div
        className="chart-container no-legend"
        ref={containerRef}
        style={containerStyle}
      >
        {/* Add the watermark directly to the container before rendering WorldMapChart */}
        <div 
          className="chart-watermark"
          style={{
            backgroundImage: `url(${isDarkMode 
              ? 'https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/Owl_Logomark_White_RGB.png'
              : 'https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/Owl_Logomark_Black_RGB.png'})`
          }}
        />
        
        <WorldMapChart data={data} isDarkMode={isDarkMode} />
      </div>
    );
  }

  // Safety check for chart data
  if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
    return (
      <div 
        className="chart-container" 
        ref={containerRef}
        style={containerStyle}
      >
        <div className="no-data-message">No data available for chart</div>
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

  // For debugging
  // console.log(`Rendering chart: ${title}`, { type: chartType, data: chartData });

  return (
    <div
      // Conditionally add 'has-legend' or 'no-legend' based on the same logic
      // used for legend creation and the className you already have.
      className={`chart-container ${
        (isMultiSeries || isPieChart) && chartData && chartData.datasets && chartData.datasets.length > 0
          ? 'has-legend'
          : 'no-legend' // Explicitly add 'no-legend'
      }`}
      ref={containerRef}
      style={containerStyle}
      data-theme={isDarkMode ? 'dark' : 'light'}
      data-type={chartType}
    >
      {/* ChartComponent (Line, Bar, Pie) will be rendered here by React */}
      {/* The legend is dynamically inserted here by createCustomLegend if needed */}
      {/* The watermark is dynamically appended here */}
      <ChartComponent
        ref={getChartRef}
        data={chartData}
        options={getChartOptions()}
      />
    </div>
  );
};

export default Chart;