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
  Filler,
  TimeScale, // Import TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom'; // Import zoom plugin
import 'chartjs-adapter-date-fns'; // Date adapter

import {
  hexToRgba,
  DEFAULT_COLORS,
  DARK_MODE_COLORS,
  HIGH_CONTRAST_DARK_COLORS,
  generateColorPalette
} from '../utils/colors';
import ZoomSlider from './ZoomSlider'; // Import ZoomSlider
import formatters from '../utils/formatter'; // Import formatters

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale, // Register TimeScale
  zoomPlugin  // Register zoom plugin
);

/**
 * StackedAreaChart component specifically designed for stacked area charts
 * Now includes zoom functionality.
 */
const StackedAreaChart = ({
  data,
  title, // title is often handled by the parent Card, but kept for flexibility
  height = 'auto',
  format,
  isDarkMode = false,
  isTimeSeries = false, // New prop
  enableZoom = false,   // New prop
  metricId = 'stacked-area-chart' // New prop with default
}) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const legendContainerRef = useRef(null);
  const legendItemsRef = useRef(null);
  const legendControlsRef = useRef(null);
  const watermarkRef = useRef(null);

  const [chartInstance, setChartInstance] = useState(null);
  const [legendCreated, setLegendCreated] = useState(false);
  // Initialize zoomRange to show the last 30% of data (80% to 100%)
  const [zoomRange, setZoomRange] = useState({ min: 80, max: 100 });

  // Process data specifically for stacked area charts
  const processChartData = () => {
    if (!data || !data.labels || !data.datasets) {
      console.warn('StackedAreaChart: Invalid data format', data);
      return { labels: [], datasets: [] };
    }

    console.log('StackedAreaChart: Processing data', {
      labelsCount: data.labels.length,
      datasetsCount: data.datasets.length,
      isTimeSeries,
      sampleLabels: data.labels.slice(0, 5)
    });

    const colorPalette = isDarkMode
      ? HIGH_CONTRAST_DARK_COLORS
      : DEFAULT_COLORS;

    const colors = data.datasets.length > colorPalette.length
      ? generateColorPalette(data.datasets.length, isDarkMode, isDarkMode)
      : colorPalette.slice(0, data.datasets.length);

    const processedDatasets = [...data.datasets].map((dataset, index) => {
      const baseColor = colors[index % colors.length];
      const backgroundOpacity = 0.6;
      const borderOpacity = 0.9;

      // For time series, we need to convert the data to {x, y} format
      // but only if the data isn't already in that format
      let pointsData = dataset.data;
      
      if (isTimeSeries && Array.isArray(dataset.data) && data.labels) {
        // Check if data is already in {x, y} format
        const firstPoint = dataset.data[0];
        if (typeof firstPoint === 'number' || firstPoint === null || firstPoint === undefined) {
          // Convert simple array to {x, y} format using labels
          pointsData = dataset.data.map((value, idx) => ({
            x: data.labels[idx], // Use the main labels array for x (dates)
            y: value || 0 // Handle null/undefined values
          }));
        } else {
          // Data is already in {x, y} format or some other object format
          pointsData = dataset.data;
        }
      }

      const processedDataset = {
        ...dataset,
        data: pointsData,
        borderWidth: isDarkMode ? 2 : 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        borderColor: hexToRgba(baseColor, borderOpacity),
        backgroundColor: hexToRgba(baseColor, backgroundOpacity),
        hoverBackgroundColor: hexToRgba(baseColor, 0.8),
        fill: true,
      };

      console.log(`StackedAreaChart: Processed dataset ${index}:`, {
        label: processedDataset.label,
        dataLength: processedDataset.data.length,
        sampleData: processedDataset.data.slice(0, 3)
      });

      return processedDataset;
    });

    const result = {
      labels: data.labels,
      datasets: processedDatasets
    };

    console.log('StackedAreaChart: Final processed data:', {
      labelsCount: result.labels.length,
      datasetsCount: result.datasets.length
    });

    return result;
  };

  const chartDataProcessed = processChartData();

  const getChartOptions = () => {
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDarkMode ? '#ffffff' : '#333333';
    const tooltipBackground = isDarkMode ? 'rgba(33, 33, 33, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipTextColor = isDarkMode ? '#e0e0e0' : '#333333';
    const tooltipBorderColor = isDarkMode ? '#444444' : '#d9d9d9';

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Custom legend is used
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: tooltipBackground,
          titleColor: tooltipTextColor,
          bodyColor: tooltipTextColor,
          footerColor: tooltipTextColor,
          borderColor: tooltipBorderColor,
          borderWidth: 1,
          cornerRadius: 6,
          padding: 8,
          callbacks: {
            title: (tooltipItems) => {
                if (!tooltipItems || tooltipItems.length === 0) return '';
                if (isTimeSeries && tooltipItems[0].chart.scales.x.type === 'time') {
                    const date = new Date(tooltipItems[0].parsed.x);
                    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                }
                return tooltipItems[0].label || '';
            },
            label: (tooltipItem) => {
              const dataset = tooltipItem.dataset;
              let value = tooltipItem.parsed.y;
              const currentLabel = dataset.label || `Dataset ${tooltipItem.datasetIndex + 1}`;

              if (format && formatters && typeof formatters[format] === 'function') {
                value = formatters[format](value);
              } else if (typeof value === 'number') {
                value = value.toLocaleString();
              }
              return ` ${currentLabel}: ${value}`;
            },
            footer: (tooltipItems) => {
              let total = 0;
              tooltipItems.forEach((tooltipItem) => {
                total += tooltipItem.parsed.y || 0;
              });
              let formattedTotal = total;
              if (format && formatters && typeof formatters[format] === 'function') {
                formattedTotal = formatters[format](total);
              } else if (typeof total === 'number') {
                formattedTotal = total.toLocaleString();
              }
              return `Total: ${formattedTotal}`;
            }
          }
        },
        title: {
          display: false // Title handled by Card
        },
        filler: {
          propagate: true
        },
        zoom: { // Zoom plugin configuration
          pan: {
            enabled: false, // Disabled: Zoom only via slider
          },
          zoom: {
            wheel: {
              enabled: false, // Disabled: Zoom only via slider
            },
            pinch: {
              enabled: false, // Disabled: Zoom only via slider
            },
            drag: {
                enabled: false, // Disabled: Zoom only via slider
            },
            mode: 'x',
            onZoomComplete: ({chart}) => {
                if (!enableZoom) return; // Don't update zoom range if zoom is disabled
                
                const {min: scaleMinVal, max: scaleMaxVal} = chart.scales.x;
                const xData = chart.data.labels; // StackedAreaChart uses chart.data.labels for x-axis
                const totalDataPoints = xData.length;

                if (totalDataPoints > 1) {
                    let newMinPercent, newMaxPercent;
                    if (chart.scales.x.type === 'time') {
                        const firstTime = new Date(xData[0]).getTime();
                        const lastTime = new Date(xData[totalDataPoints - 1]).getTime();
                        const timeRange = lastTime - firstTime;
                        if (timeRange > 0) {
                            newMinPercent = Math.max(0, ((scaleMinVal - firstTime) / timeRange) * 100);
                            newMaxPercent = Math.min(100, ((scaleMaxVal - firstTime) / timeRange) * 100);
                        } else {
                            newMinPercent = 0; newMaxPercent = 100;
                        }
                    } else { // Category scale
                        newMinPercent = Math.max(0, (scaleMinVal / (totalDataPoints - 1)) * 100);
                        newMaxPercent = Math.min(100, (scaleMaxVal / (totalDataPoints - 1)) * 100);
                    }
                     if (Math.abs(newMinPercent - zoomRange.min) > 0.1 || Math.abs(newMaxPercent - zoomRange.max) > 0.1) {
                       setZoomRange({ min: parseFloat(newMinPercent.toFixed(1)), max: parseFloat(newMaxPercent.toFixed(1)) });
                    }
                }
            }
          }
        }
      },
      scales: {
        x: {
          type: isTimeSeries ? 'time' : 'category', // Use 'time' scale for time series data
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
            maxTicksLimit: isTimeSeries ? 7 : 10,
            color: textColor,
            padding: 8,
          },
          time: isTimeSeries ? {
            unit: 'day',
            tooltipFormat: 'MMM dd, yyyy',
            displayFormats: {
                day: 'MMM dd',
                month: 'MMM yyyy',
            }
          } : {},
        },
        y: {
          beginAtZero: true,
          stacked: true, // Crucial for stacked area charts
          grid: {
            color: gridColor,
            borderColor: gridColor
          },
          border: {
            color: gridColor
          },
          ticks: {
            color: textColor,
            padding: 8,
            callback: function(value) {
              if (format && formatters && typeof formatters[format] === 'function') {
                return formatters[format](value);
              }
              return Number.isInteger(value) ? value : value.toFixed(1); // Basic formatting
            }
          }
        }
      },
      elements: {
        line: {
          tension: 0.2,
        },
        point: {
          radius: 0,
          hitRadius: 30,
          hoverRadius: 3,
        }
      },
      interaction: {
        mode: 'index',
        intersect: false,
      }
    };

    // Apply initial zoom based on zoomRange state
    if (enableZoom && isTimeSeries && chartDataProcessed.labels && chartDataProcessed.labels.length > 1) {
        const xData = chartDataProcessed.labels;
        const dataLength = xData.length;
        const minPercentFromState = zoomRange.min;
        const maxPercentFromState = zoomRange.max;

        const minIndex = Math.max(0, Math.floor(dataLength * (minPercentFromState / 100)));
        let maxIndex = Math.min(dataLength - 1, Math.floor(dataLength * (maxPercentFromState / 100)));
         if (maxPercentFromState === 100) {
            maxIndex = dataLength - 1;
        }
        maxIndex = Math.max(minIndex, maxIndex);

        if (options.scales.x.type === 'time') {
            if (xData[minIndex] !== undefined) options.scales.x.min = xData[minIndex];
            if (xData[maxIndex] !== undefined) options.scales.x.max = xData[maxIndex];
        } else { // Category scale
            options.scales.x.min = minIndex;
            options.scales.x.max = maxIndex;
        }
    }
    return options;
  };

  // Check if scroll buttons are needed for legend
  const checkScrollButtonsNeeded = () => {
    if (!legendItemsRef.current || !legendControlsRef.current) return;
    const container = legendItemsRef.current;
    const controls = legendControlsRef.current;
    const hasOverflow = container.scrollWidth > container.clientWidth + 20;
    controls.style.display = hasOverflow ? 'flex' : 'none';
  };

  // Remove any existing legend containers
  const cleanupExistingLegend = () => {
    if (containerRef.current) {
      const existingLegends = containerRef.current.querySelectorAll('.chart-legend-container');
      existingLegends.forEach(legend => {
        try {
          legend.parentNode.removeChild(legend);
        } catch (e) { /* Ignore removal errors */ }
      });
    }
  };

  // Create a custom scrollable legend
  const createCustomLegend = () => {
    if (!chartDataProcessed || !chartDataProcessed.datasets || chartDataProcessed.datasets.length === 0) return;
    cleanupExistingLegend();

    const legendContainer = document.createElement('div');
    legendContainer.className = 'chart-legend-container';
    const legendItemsContainer = document.createElement('div');
    legendItemsContainer.className = 'chart-legend-items';
    legendItemsRef.current = legendItemsContainer;

    const colorPalette = isDarkMode ? HIGH_CONTRAST_DARK_COLORS : DEFAULT_COLORS;
    const colors = chartDataProcessed.datasets.length > colorPalette.length
      ? generateColorPalette(chartDataProcessed.datasets.length, isDarkMode, isDarkMode)
      : colorPalette.slice(0, chartDataProcessed.datasets.length);

    const legendItems = [...chartDataProcessed.datasets];
    legendItems.forEach((dataset, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'legend-item';
      const colorBox = document.createElement('span');
      colorBox.className = 'legend-item-color';
      const solidColor = colors[index % colors.length];
      colorBox.style.backgroundColor = solidColor;
      const label = document.createElement('span');
      label.className = 'legend-item-label';
      label.textContent = dataset.label || `Dataset ${index + 1}`;
      itemDiv.addEventListener('click', () => {
        if (chartRef.current) {
          const chart = chartRef.current;
          const datasetMeta = chart.getDatasetMeta(index);
          datasetMeta.hidden = !datasetMeta.hidden;
          chart.update();
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

    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'legend-controls';
    buttonWrapper.style.display = 'none';
    legendControlsRef.current = buttonWrapper;
    const leftButton = document.createElement('button');
    leftButton.className = 'legend-btn legend-btn-left';
    leftButton.innerHTML = '&larr;';
    leftButton.addEventListener('click', () => { legendItemsContainer.scrollBy({ left: -100, behavior: 'smooth' }); });
    const rightButton = document.createElement('button');
    rightButton.className = 'legend-btn legend-btn-right';
    rightButton.innerHTML = '&rarr;';
    rightButton.addEventListener('click', () => { legendItemsContainer.scrollBy({ left: 100, behavior: 'smooth' }); });
    buttonWrapper.appendChild(leftButton);
    buttonWrapper.appendChild(rightButton);
    legendContainer.appendChild(legendItemsContainer);
    legendContainer.appendChild(buttonWrapper);

    if (containerRef.current) {
      containerRef.current.insertBefore(legendContainer, containerRef.current.firstChild);
      legendContainerRef.current = legendContainer;
      setTimeout(() => {
        checkScrollButtonsNeeded();
        setLegendCreated(true);
      }, 100);
    }
  };

  useEffect(() => {
    if (chartInstance && !legendCreated && chartDataProcessed && chartDataProcessed.datasets && chartDataProcessed.datasets.length > 0) {
      const timer = setTimeout(() => createCustomLegend(), 100);
      return () => clearTimeout(timer);
    }
  }, [chartInstance, legendCreated, chartDataProcessed]);

  useEffect(() => {
    if (containerRef.current) {
      const existingWatermark = containerRef.current.querySelector('.chart-watermark');
      if (existingWatermark) existingWatermark.remove();
      const watermark = document.createElement('div');
      watermark.className = 'chart-watermark';
      watermarkRef.current = watermark;
      const logoUrl = isDarkMode
        ? 'https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/Owl_Logomark_White_RGB.png'
        : 'https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/Owl_Logomark_Black_RGB.png';
      watermark.style.backgroundImage = `url(${logoUrl})`;
      containerRef.current.appendChild(watermark);
    }
    return () => {
      if (watermarkRef.current) { try { watermarkRef.current.remove(); } catch (e) { /* Ignore */ } }
    };
  }, [containerRef.current, isDarkMode]);

  useEffect(() => {
    const handleResize = () => {
      if (legendCreated) checkScrollButtonsNeeded();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [legendCreated]);

  useEffect(() => {
    return () => {
      if (chartInstance) chartInstance.destroy();
      cleanupExistingLegend();
      setLegendCreated(false);
    };
  }, [chartInstance]);

  const getChartRef = (chart) => {
    if (chart) {
      chartRef.current = chart;
      setChartInstance(chart);
    }
  };

  // useEffect to apply zoom when zoomRange changes or chart is ready
  useEffect(() => {
    if (chartRef.current && isTimeSeries && enableZoom && chartDataProcessed && chartDataProcessed.labels) {
      const chart = chartRef.current;
      const xData = chartDataProcessed.labels;
      const dataLength = xData.length;

      if (dataLength > 1) {
        const minPercentFromState = zoomRange.min;
        const maxPercentFromState = zoomRange.max;

        const newMinIndex = Math.max(0, Math.floor(dataLength * (minPercentFromState / 100)));
        let newMaxIndex = Math.min(dataLength - 1, Math.floor(dataLength * (maxPercentFromState / 100)));
        if (maxPercentFromState === 100) {
            newMaxIndex = dataLength - 1;
        }
        newMaxIndex = Math.max(newMinIndex, newMaxIndex); 

        let newScaleMin, newScaleMax;

        if (chart.options.scales.x.type === 'time') {
          if (xData[newMinIndex] !== undefined) newScaleMin = xData[newMinIndex]; else newScaleMin = xData[0];
          if (xData[newMaxIndex] !== undefined) newScaleMax = xData[newMaxIndex]; else newScaleMax = xData[dataLength-1];
        } else { 
          newScaleMin = newMinIndex;
          newScaleMax = newMaxIndex;
        }
        
        const currentChartMin = chart.scales.x.min;
        const currentChartMax = chart.scales.x.max;

        let needsUpdate = false;
        if (chart.options.scales.x.type === 'time') {
            const newScaleMinTime = newScaleMin !== undefined ? new Date(newScaleMin).getTime() : undefined;
            const newScaleMaxTime = newScaleMax !== undefined ? new Date(newScaleMax).getTime() : undefined;
            const currentChartMinTime = currentChartMin; 
            const currentChartMaxTime = currentChartMax;

            if (newScaleMinTime !== undefined && newScaleMinTime !== currentChartMinTime) {
              chart.options.scales.x.min = newScaleMin; 
              needsUpdate = true;
            }
            if (newScaleMaxTime !== undefined && newScaleMaxTime !== currentChartMaxTime) {
              chart.options.scales.x.max = newScaleMax; 
              needsUpdate = true;
            }
        } else { 
            if (newScaleMin !== undefined && newScaleMin !== currentChartMin) {
              chart.options.scales.x.min = newScaleMin;
              needsUpdate = true;
            }
            if (newScaleMax !== undefined && newScaleMax !== currentChartMax) {
              chart.options.scales.x.max = newScaleMax;
              needsUpdate = true;
            }
        }
        
        if (needsUpdate) {
          chart.update();
        }
      }
    }
  }, [zoomRange, chartInstance, isTimeSeries, enableZoom, chartDataProcessed]); 

  const handleZoomChange = (newMinPercent, newMaxPercent) => {
    setZoomRange({ min: newMinPercent, max: newMaxPercent });
  };

  const containerStyle = {
    height: height === 'auto' ? '100%' : height,
    position: 'relative',
    width: '100%',
  };

  if (!chartDataProcessed || !chartDataProcessed.labels || !chartDataProcessed.datasets || chartDataProcessed.labels.length === 0) {
    return (
      <div className="chart-container no-legend" style={containerStyle}>
        <div className="no-data-message">No data available</div>
      </div>
    );
  }
  
  const chartOptions = getChartOptions();

  return (
    <div
      className={`chart-wrapper ${enableZoom && isTimeSeries ? 'with-zoom-slider' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div
        className="chart-container has-legend"
        ref={containerRef}
        style={{ ...containerStyle, flexGrow: 1 }}
        data-theme={isDarkMode ? 'dark' : 'light'}
      >
        <Line
          ref={getChartRef}
          data={chartDataProcessed}
          options={chartOptions}
          key={`${metricId}-${isDarkMode}-${zoomRange.min}-${zoomRange.max}-${isTimeSeries}-${enableZoom}`}
        />
      </div>
      {enableZoom && isTimeSeries && chartInstance && chartDataProcessed.labels && chartDataProcessed.labels.length > 1 && (
        <ZoomSlider
          min={0}
          max={100}
          currentMin={zoomRange.min}
          currentMax={zoomRange.max}
          onChange={handleZoomChange}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default StackedAreaChart;