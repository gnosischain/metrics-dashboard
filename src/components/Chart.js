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
  Filler,
  TimeScale, // Import TimeScale for time series charts
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom'; // Import the zoom plugin
import 'chartjs-adapter-date-fns'; // Import a date adapter for time scale

import { DEFAULT_COLORS, DARK_MODE_COLORS, hexToRgba } from '../utils/colors';
import WorldMapChart from './WorldMapChart';
import NumberWidget from './NumberWidget';
import StackedAreaChart from './StackedAreaChart';
import InFrameZoomSlider from './InFrameZoomSlider';
import formatters from '../utils/formatter'; 

// Register ChartJS components including the zoom plugin and TimeScale
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
  Filler,
  TimeScale, // Register TimeScale
  zoomPlugin // Register the zoom plugin
);

/**
 * Universal chart component that handles various chart types
 * @param {object} props - Component props
 * @param {object} props.data - Data for the chart
 * @param {string} props.title - Title of the chart
 * @param {string} [props.type='line'] - Type of chart (line, bar, pie, area, map, numberDisplay, stackedBar, horizontalBar)
 * @param {string|string[]} [props.color='#4285F4'] - Base color or array of colors for the chart
 * @param {string} [props.height='auto'] - Height of the chart container
 * @param {string|function} props.format - Formatting function or string for tooltips/labels
 * @param {number} [props.pointRadius=3] - Radius of points on line/area charts
 * @param {boolean} [props.showPoints=true] - Whether to show points on line/area charts
 * @param {boolean|string} [props.fill=false] - Whether to fill area under line charts (e.g., 'origin')
 * @param {boolean} [props.stacked=false] - Whether bar/area charts should be stacked
 * @param {boolean} [props.stackedArea=false] - Specific flag for stacked area charts (overrides stacked if type is area)
 * @param {boolean} [props.isDarkMode=false] - Flag for dark mode styling
 * @param {boolean} [props.isTimeSeries=false] - Flag indicating if the x-axis is time-based
 * @param {boolean} [props.enableZoom=false] - Flag to enable zoom and pan features
 * @param {string} props.metricId - Unique ID for the metric, used for keying and slider instances
 * @returns {JSX.Element} The chart component or a message if data is unavailable.
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
  isDarkMode = false,
  isTimeSeries = false,
  enableZoom = false,
  metricId
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

  // Safety check for data validity
  if (!data) {
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

  if (type === 'numberDisplay') {
    let value = 0;
    if (Array.isArray(data) && data.length > 0) {
      value = parseFloat(data[data.length - 1]?.value || 0);
    } else if (data && typeof data === 'object' && data.value !== undefined) {
      value = parseFloat(data.value || 0);
    }
    return <NumberWidget value={value} format={format} label={title} color={color} isDarkMode={isDarkMode} />;
  }

  const isAreaChart = type === 'area';
  const isStackedAreaChart = isAreaChart && (stackedArea || stacked);
  const isStackedBar = type === 'stackedBar' || (type === 'bar' && stacked);
  const isHorizontal = type === 'horizontalBar';
  const isPieChart = type === 'pie';

  const isMultiSeries = data &&
                       typeof data === 'object' &&
                       !Array.isArray(data) &&
                       data.labels &&
                       Array.isArray(data.labels) &&
                       data.datasets &&
                       Array.isArray(data.datasets);

  let actualChartType;
  if (isAreaChart || isStackedAreaChart) {
    actualChartType = 'line';
  } else if (isStackedBar) {
    actualChartType = 'bar';
  } else {
    actualChartType = type;
  }

  const defaultColors = isDarkMode ? DARK_MODE_COLORS : DEFAULT_COLORS;
  const themeAdjustedColor = isDarkMode && color === '#4285F4' ? '#77aaff' : color;

  if (isStackedAreaChart && isMultiSeries) {
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

  let chartDataProcessed;
  if (isPieChart) {
    if (Array.isArray(data)) {
      const labels = data.map(item =>
        item.category || item.country || item.label ||
        Object.values(item).find(v => typeof v === 'string') || 'Unknown'
      );
      const values = data.map(item =>
        parseFloat(item.value || item.cnt || item.count || 0)
      );
      const backgroundColors = values.map((_, i) =>
        hexToRgba(defaultColors[i % defaultColors.length], 0.7)
      );
      chartDataProcessed = {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(c => c.replace('rgba', 'rgb').replace(/,\s*[\d.]+\)/, ')')),
          borderWidth: 1
        }]
      };
    } else if (isMultiSeries) {
      chartDataProcessed = data;
    } else {
      chartDataProcessed = {
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
    chartDataProcessed = {
      labels: data.labels,
      datasets: data.datasets.map((dataset, index) => {
        let baseColor = dataset.backgroundColor || dataset.borderColor || defaultColors[index % defaultColors.length];
        if (baseColor && baseColor.includes('rgba')) {
          baseColor = baseColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, 'rgb($1)');
        } else if (baseColor && baseColor.includes('#') && baseColor.length === 9) {
          baseColor = baseColor.substring(0, 7);
        }
        if (isDarkMode) {
          const defaultIndex = DEFAULT_COLORS.indexOf(baseColor);
          if (defaultIndex >= 0) {
            baseColor = DARK_MODE_COLORS[defaultIndex % DARK_MODE_COLORS.length];
          }
        }
        let fillValue = dataset.fill || fill;
        if (isAreaChart && !isStackedAreaChart) {
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
    const getLabels = () => {
      if (!Array.isArray(data) || data.length === 0) return [];
      if (isPieChart || isHorizontal) {
        return data.map(item => item.category || item.country || item.label || Object.values(item).find(v => typeof v === 'string') || 'Unknown');
      } else {
        return data.map(item => {
          if (!item) return 'Unknown';
          return item.date || item.hour || item.timestamp || 'Unknown';
        });
      }
    };
    const getValues = () => {
      if (!Array.isArray(data) || data.length === 0) return [];
      return data.map(item => {
        if (!item) return 0;
        return parseFloat(item.value || item.cnt || item.count || 0);
      });
    };

    let datasetData;
    if (isTimeSeries && Array.isArray(data) && data.length > 0) {
        datasetData = data.map(item => ({
            x: item.date || item.hour || item.timestamp,
            y: parseFloat(item.value || item.cnt || item.count || 0)
        }));
    } else {
        datasetData = getValues();
    }

    chartDataProcessed = {
      labels: getLabels(),
      datasets: [
        {
          label: title || 'Data',
          data: datasetData,
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

  const getChartOptions = () => {
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDarkMode ? '#ffffff' : '#333333';
    const tooltipBackground = isDarkMode ? 'rgba(33, 33, 33, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipTextColor = isDarkMode ? '#e0e0e0' : '#333333';
    const tooltipBorderColor = isDarkMode ? '#444444' : '#333333';

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: isHorizontal ? 'y' : 'x',
      layout: { padding: { left: 10, right: 10, top: isPieChart ? 0 : 10, bottom: 15 } },
      plugins: {
        legend: { display: false, labels: { color: textColor } },
        tooltip: {
          enabled: true, // Ensure tooltips are enabled
          mode: isPieChart ? 'nearest' : 'index',
          intersect: isPieChart ? true : false, // Intersect false for line/bar for better hover
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
              if (isTimeSeries && tooltipItems[0].chart.scales.x.type === 'time') {
                  const date = new Date(tooltipItems[0].parsed.x);
                  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
              }
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
              const formattedTotal = format && formatters && typeof formatters[format] === 'function'
                ? formatters[format](total)
                : total.toLocaleString();
              return `Total: ${formattedTotal}`;
            }
          }
        },
        title: { color: textColor, display: false },
        filler: { propagate: true },
        zoom: {
          pan: {
            enabled: false, 
          },
          zoom: {
            wheel: {
              enabled: false, 
            },
            pinch: {
              enabled: false, 
            },
            drag: {
                enabled: false, 
            },
            mode: 'x',
            onZoomComplete: ({chart}) => {
                const {min: scaleMinVal, max: scaleMaxVal} = chart.scales.x;
                const dataLabels = chart.data.labels;
                const xData = chart.data.datasets[0]?.data?.map(d => d.x) || dataLabels;
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
                    } else {
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
      scales: isPieChart ? undefined : {
        x: {
          type: isTimeSeries ? 'time' : 'category',
          display: !isPieChart,
          grid: { display: false, borderColor: gridColor },
          border: { color: gridColor },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: isTimeSeries ? 7 : 10,
            color: textColor,
            padding: 8,
            source: 'auto',
          },
          stacked: isStackedBar,
          time: isTimeSeries ? {
            unit: 'day',
            tooltipFormat: 'MMM dd, yyyy', 
            displayFormats: {
                millisecond: 'HH:mm:ss.SSS',
                second: 'HH:mm:ss',
                minute: 'HH:mm',
                hour: 'HH:mm',
                day: 'MMM dd',
                week: 'MMM dd',
                month: 'MMM yyyy',
                quarter: 'qqq yyyy',
                year: 'yyyy',
            }
          } : {},
        },
        y: {
          display: !isPieChart,
          beginAtZero: true,
          grid: { color: gridColor, borderColor: gridColor },
          border: { color: gridColor },
          ticks: { color: textColor, padding: 8 },
          stacked: isStackedBar,
        },
      },
      elements: {
        line: { tension: 0.2 },
        point: { radius: 0, hitRadius: 30, hoverRadius: 0 },
        arc: { borderWidth: 0 }
      },
      interaction: { 
        mode: isPieChart ? 'nearest' : 'index', 
        intersect: isPieChart ? true : false, // Important for tooltips on line/area
      },
      hover: { 
        mode: isPieChart ? 'nearest' : 'index', 
        intersect: isPieChart ? true : false, // Important for tooltips on line/area
      },
    };

    // Apply initial zoom based on zoomRange state
    if (enableZoom && isTimeSeries && chartDataProcessed.datasets[0]?.data?.length > 1) {
        const datasetXValues = chartDataProcessed.datasets[0].data.map(d => d.x);
        const xData = (datasetXValues.length > 0 && datasetXValues[0] !== undefined) ? datasetXValues : chartDataProcessed.labels;
        const dataLength = xData.length;

        const minPercentFromState = zoomRange.min;
        const maxPercentFromState = zoomRange.max;

        const minIndex = Math.max(0, Math.floor(dataLength * (minPercentFromState / 100)));
        let maxIndex;
        if (maxPercentFromState === 100) {
            maxIndex = dataLength - 1;
        } else {
            maxIndex = Math.min(dataLength - 1, Math.floor(dataLength * (maxPercentFromState / 100)));
        }
        maxIndex = Math.max(minIndex, maxIndex);


        if (xData && xData.length > 0) {
            if (options.scales.x.type === 'time') {
                if (xData[minIndex] !== undefined) options.scales.x.min = xData[minIndex];
                if (xData[maxIndex] !== undefined) options.scales.x.max = xData[maxIndex];
            } else { // Category scale
                options.scales.x.min = minIndex;
                options.scales.x.max = maxIndex;
            }
        }
    }
    return options;
  };

  const checkScrollButtonsNeeded = () => {
    if (!legendItemsRef.current || !legendControlsRef.current) return;
    const container = legendItemsRef.current;
    const controls = legendControlsRef.current;
    const hasOverflow = container.scrollWidth > container.clientWidth + 20;
    controls.style.display = hasOverflow ? 'flex' : 'none';
  };

  const handleResponsiveLegend = () => {
    if (!legendItemsRef.current) return;
    const container = legendItemsRef.current;
    const items = container.querySelectorAll('.legend-item');
    if (window.innerWidth <= 768) {
      container.style.flexWrap = 'wrap';
      container.style.justifyContent = 'center';
      items.forEach(item => { item.style.marginBottom = '8px'; });
    } else {
      container.style.flexWrap = 'nowrap';
      container.style.justifyContent = 'flex-start';
      items.forEach(item => { item.style.marginBottom = '0'; });
      checkScrollButtonsNeeded();
    }
  };

  const cleanupExistingLegend = () => {
    if (containerRef.current) {
      const existingLegends = containerRef.current.querySelectorAll('.chart-legend-container');
      existingLegends.forEach(legend => { try { legend.parentNode.removeChild(legend); } catch (e) { /* Ignore */ } });
    }
  };

  const createCustomLegend = () => {
    if (!chartDataProcessed || !chartDataProcessed.datasets || chartDataProcessed.datasets.length === 0) return;
    if ((!isMultiSeries && !isPieChart)) return;
    cleanupExistingLegend();
    const legendContainer = document.createElement('div');
    legendContainer.className = 'chart-legend-container';
    const legendItemsContainer = document.createElement('div');
    legendItemsContainer.className = 'chart-legend-items';
    legendItemsRef.current = legendItemsContainer;
    let legendItems;
    if (isPieChart && chartDataProcessed && chartDataProcessed.labels) {
      legendItems = chartDataProcessed.labels.map((label, i) => ({
        label,
        backgroundColor: chartDataProcessed.datasets[0]?.backgroundColor[i] || defaultColors[i % defaultColors.length]
      }));
    } else if (chartDataProcessed && chartDataProcessed.datasets) {
      legendItems = chartDataProcessed.datasets;
    } else {
      return;
    }
    legendItems.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'legend-item';
      const colorBox = document.createElement('span');
      colorBox.className = 'legend-item-color';
      let solidColor = isPieChart ? item.backgroundColor : (item.backgroundColor || item.borderColor);
      if (solidColor && typeof solidColor === 'string' && solidColor.includes('rgba')) {
        solidColor = solidColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, 'rgb($1)');
      }
      colorBox.style.backgroundColor = solidColor || defaultColors[index % defaultColors.length];
      const label = document.createElement('span');
      label.className = 'legend-item-label';
      label.textContent = item.label || `Dataset ${index + 1}`;
      itemDiv.addEventListener('click', () => {
        if (chartRef.current) {
          const chart = chartRef.current;
          if (isPieChart) {
            try {
              const meta = chart.getDatasetMeta(0);
              if (meta && meta.data && meta.data[index]) {
                meta.data[index].hidden = !meta.data[index].hidden;
                chart.update();
              }
            } catch (e) { console.error('Error toggling pie chart segment:', e); }
          } else {
            try {
              const datasetMeta = chart.getDatasetMeta(index);
              if (datasetMeta) {
                datasetMeta.hidden = !datasetMeta.hidden;
                chart.update();
              }
            } catch (e) { console.error('Error toggling dataset visibility:', e); }
          }
          try {
            if ((isPieChart && chart.getDatasetMeta(0).data[index].hidden) ||
                (!isPieChart && chart.getDatasetMeta(index).hidden)) {
              itemDiv.classList.add('hidden');
            } else {
              itemDiv.classList.remove('hidden');
            }
          } catch (e) { console.error('Error updating legend item CSS:', e); }
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
        handleResponsiveLegend();
        setLegendCreated(true);
      }, 100);
    }
  };

  useEffect(() => {
    if (chartInstance && (isMultiSeries || isPieChart) && !legendCreated) {
      const timer = setTimeout(() => { createCustomLegend(); }, 100);
      return () => clearTimeout(timer);
    }
  }, [chartInstance, isMultiSeries, legendCreated, isPieChart, chartDataProcessed]);

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
      if ((isMultiSeries || isPieChart) && legendCreated) {
        handleResponsiveLegend();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMultiSeries, legendCreated, isPieChart]);

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

  // useEffect to apply zoom when zoomRange changes (from slider) or chart is ready
  useEffect(() => {
    if (chartRef.current && isTimeSeries && enableZoom && chartDataProcessed && chartDataProcessed.datasets && chartDataProcessed.datasets[0]?.data) {
      const chart = chartRef.current;
      const datasetXValues = chartDataProcessed.datasets[0].data.map(d => d.x);
      const xData = (datasetXValues.length > 0 && datasetXValues[0] !== undefined) 
                    ? datasetXValues 
                    : chartDataProcessed.labels;
      const dataLength = xData.length;

      if (dataLength > 1) {
        const minPercentFromState = zoomRange.min;
        const maxPercentFromState = zoomRange.max;

        const newMinIndex = Math.max(0, Math.floor(dataLength * (minPercentFromState / 100)));
        let newMaxIndex = Math.min(dataLength - 1, Math.floor(dataLength * (maxPercentFromState / 100)));
        if (maxPercentFromState === 100) { // Ensure last point is included if max is 100%
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
            // Chart.js internal scale min/max for time are timestamps
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
          chart.update(); // Use default update mode to notify plugins
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

  let chartComponentType = actualChartType;
  if (isHorizontal) chartComponentType = 'bar';

  if (chartComponentType === 'map') {
    return (
      <div className="chart-container no-legend" ref={containerRef} style={containerStyle}>
        <WorldMapChart data={data} isDarkMode={isDarkMode} />
      </div>
    );
  }

  if (!chartDataProcessed || !chartDataProcessed.datasets || chartDataProcessed.datasets.length === 0) {
    return (
      <div className="chart-container" ref={containerRef} style={containerStyle}>
        <div className="no-data-message">No data available for chart</div>
      </div>
    );
  }

  let ChartComponentToRender;
  if (chartComponentType === 'line') ChartComponentToRender = Line;
  else if (chartComponentType === 'bar') ChartComponentToRender = Bar;
  else if (chartComponentType === 'pie') ChartComponentToRender = Pie;
  else ChartComponentToRender = Line;

  const chartOptions = getChartOptions(); 

  return (
    <div
      className={`chart-container ${(isMultiSeries || isPieChart) && chartDataProcessed && chartDataProcessed.datasets && chartDataProcessed.datasets.length > 0 ? 'has-legend' : 'no-legend'}`}
      ref={containerRef}
      style={{ ...containerStyle, position: 'relative' }} // Add position: relative
      data-theme={isDarkMode ? 'dark' : 'light'}
      data-type={chartComponentType}
    >
      <ChartComponentToRender
        ref={getChartRef}
        data={chartDataProcessed}
        options={chartOptions}
        key={`${metricId}-${isDarkMode}`}
      />
      
      {/* In-frame zoom slider */}
      {enableZoom && isTimeSeries && chartInstance && chartDataProcessed.datasets[0]?.data?.length > 1 && (
        <InFrameZoomSlider
          min={0}
          max={100}
          currentMin={zoomRange.min}
          currentMax={zoomRange.max}
          onChange={handleZoomChange}
          isDarkMode={isDarkMode}
          chartRef={chartRef}
        />
      )}
    </div>
  );
};

export default Chart;