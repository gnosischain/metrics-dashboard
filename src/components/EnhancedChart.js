import React, { useEffect, useState, useCallback, useRef } from 'react';
import Chart from './Chart'; // EnhancedChart uses the main Chart component
import { generateColorPalette, hexToRgba } from '../utils/colors';

/**
 * Enhanced Chart component for filtered, stacked charts.
 */
const EnhancedChart = ({
  data,
  selectedLabel,
  title,
  type,
  labelField,
  subLabelField,
  valueField = 'value',
  enableFiltering = true,
  isDarkMode = false,
  isTimeSeries = false, // Added prop
  enableZoom = false,   // Added prop
  metricId, // Added prop
  ...otherProps
}) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null); // Keep for potential direct DOM manipulations if needed
  const watermarkRef = useRef(null);


  const transformData = useCallback(() => {
    console.log(`EnhancedChart[${title}]: transformData called. Received selectedLabel: '${selectedLabel}'`);
    setError(null);
    setIsLoading(true);

    if (!Array.isArray(data)) {
        console.error(`EnhancedChart[${title}]: Received non-array data. Data:`, data);
        setError("Invalid data format received.");
        setChartData({ labels: [], datasets: [] });
        setIsLoading(false);
        return;
    }
    if (data.length === 0) {
        console.log(`EnhancedChart[${title}]: Received empty raw data array.`);
        setChartData({ labels: [], datasets: [] });
        setIsLoading(false);
        return;
    }

    try {
        console.log(`EnhancedChart[${title}]: Starting transformation. Raw data count: ${data.length}`);
        const filteredData = selectedLabel
            ? data.filter(item => item[labelField] === selectedLabel)
            : data;
        console.log(`EnhancedChart[${title}]: Filtered data count for '${selectedLabel}': ${filteredData.length}`);

        if (filteredData.length === 0) {
            console.log(`EnhancedChart[${title}]: No data after filtering for '${selectedLabel}'.`);
            setChartData({ labels: [], datasets: [] });
            setIsLoading(false);
            return;
        }

        const groupedByDate = {};
        const allSubLabels = new Set();
        let dateField = 'date';
        const firstItemKeys = Object.keys(filteredData[0]);
        const potentialDateFields = ['date', 'hour', 'timestamp', 'time', 'day'];
        const foundDateField = potentialDateFields.find(field => firstItemKeys.includes(field));

        if (foundDateField) {
            dateField = foundDateField;
        } else {
            console.warn(`EnhancedChart[${title}]: Date field detection failed. Using '${dateField}'.`);
        }

        filteredData.forEach(item => {
            const dateValue = item[dateField];
            const subLabelValue = item[subLabelField];
            const valueNum = parseFloat(item[valueField]);
            if (dateValue === undefined || subLabelValue === undefined || isNaN(valueNum)) return;
            const dateKey = typeof dateValue === 'string' && dateValue.includes(' ') ? dateValue.split(' ')[0] : String(dateValue);
            const subLabelKey = String(subLabelValue);
            if (!groupedByDate[dateKey]) { groupedByDate[dateKey] = {}; }
            groupedByDate[dateKey][subLabelKey] = (groupedByDate[dateKey][subLabelKey] || 0) + valueNum;
            allSubLabels.add(subLabelKey);
        });

        const sortedDates = Object.keys(groupedByDate).sort();
        const sortedSubLabels = Array.from(allSubLabels).sort();
        console.log(`EnhancedChart[${title}]: Unique SubLabels (versions) for '${selectedLabel}':`, sortedSubLabels);

        const colors = generateColorPalette(sortedSubLabels.length, isDarkMode);
        const datasets = sortedSubLabels.map((subLabel, index) => {
            const color = colors[index % colors.length];
            return {
                label: subLabel,
                data: sortedDates.map(date => groupedByDate[date][subLabel] || 0),
                backgroundColor: hexToRgba(color, 0.6),
                borderColor: hexToRgba(color, 0.9),
                hoverBackgroundColor: hexToRgba(color, 0.8),
                borderWidth: 1,
            };
        });

        // For EnhancedChart acting as a time series, data needs to be {x: date, y: value}
        // The current transformation above creates datasets suitable for stacking by subLabel (e.g., client versions)
        // If EnhancedChart itself IS the time series (e.g. type='line' and isTimeSeries=true)
        // then the structure for 'datasets.data' should be [{x: date, y: value}, ...] for each dataset.
        // The `sortedDates` are already the x-values.
        if (isTimeSeries && (type === 'line' || type === 'area')) {
            datasets.forEach(dataset => {
                dataset.data = sortedDates.map(date => ({
                    x: date, // Date string/timestamp for TimeScale
                    y: groupedByDate[date][dataset.label] || 0 // Value
                }));
            });
        }


        const finalChartData = { labels: sortedDates, datasets: datasets };
        console.log(`EnhancedChart[${title}]: Final chartData structure updated for '${selectedLabel}'. Datasets count: ${datasets.length}`);
        setChartData(finalChartData);

    } catch (transformError) {
        console.error(`EnhancedChart[${title}]: Error during transformation for '${selectedLabel}':`, transformError);
        setError("Failed to process chart data.");
        setChartData({ labels: [], datasets: [] });
    } finally {
        setIsLoading(false);
    }
  }, [data, selectedLabel, labelField, subLabelField, valueField, title, isDarkMode, isTimeSeries, type]);


  useEffect(() => {
    transformData();
  }, [transformData]);

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


  if (error) {
    return <div className="error-message" style={{ padding: '20px', textAlign: 'center' }}>{error}</div>;
  }

  // EnhancedChart now also uses the main Chart component internally for rendering.
  // It passes through the isTimeSeries and enableZoom props.
  return (
    <div className="enhanced-chart-container no-controls-padding" ref={containerRef} style={{height: '100%'}}>
       {isLoading ? (
           <div className="loading-indicator">Loading chart data...</div>
       ) : (
           <Chart
               key={`enhanced-chart-${metricId}-${selectedLabel}-${isDarkMode ? 'dark' : 'light'}`}
               data={chartData}
               title="" // Title handled by Card
               type={type}
               isDarkMode={isDarkMode}
               isTimeSeries={isTimeSeries} // Pass down
               enableZoom={enableZoom}     // Pass down
               metricId={metricId} // Pass down for unique Chart instance
               {...otherProps}
           />
       )}
    </div>
  );
};

export default EnhancedChart;