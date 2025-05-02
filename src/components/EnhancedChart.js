import React, { useEffect, useState, useCallback } from 'react';
import Chart from './Chart';
import { generateColorPalette, hexToRgba } from '../utils/colors';

/**
 * Enhanced Chart component for filtered, stacked charts.
 * Receives raw data and the selected filter label as props.
 * Transforms data based on props for display.
 */
const EnhancedChart = ({
  data, // Expecting raw data array
  selectedLabel, // Receives the selected primary label from parent (MetricWidget)
  title,
  type,
  labelField,
  subLabelField,
  valueField = 'value',
  enableFiltering = true, // Keep prop for consistency, though logic relies on parent state now
  isDarkMode = false,
  ...otherProps // Includes height, format, etc.
}) => {
  // State only for the transformed data ready for Chart.js
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Transformation Logic ---
  const transformData = useCallback(() => {
    // selectedLabel is now a prop
    console.log(`EnhancedChart[${title}]: transformData called. Received selectedLabel: '${selectedLabel}'`);
    setError(null); // Clear previous errors
    setIsLoading(true);

    // --- Pre-checks ---
    if (!Array.isArray(data)) {
        console.error(`EnhancedChart[${title}]: Received non-array data. Cannot transform. Data:`, data);
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

    // --- Start Transformation ---
    try {
        console.log(`EnhancedChart[${title}]: Starting transformation. Raw data count: ${data.length}`);

        // 1. Filter Raw Data (selectedLabel comes from props)
        // If selectedLabel is empty or null (shouldn't happen if parent sets a default), show nothing or error?
        // Assuming parent (MetricWidget) ensures selectedLabel is valid when data exists.
        const filteredData = selectedLabel
            ? data.filter(item => item[labelField] === selectedLabel)
            : data; // If no label selected somehow, show all (or handle differently)

        console.log(`EnhancedChart[${title}]: Filtered data count for '${selectedLabel}': ${filteredData.length}`);

        if (filteredData.length === 0) {
            console.log(`EnhancedChart[${title}]: No data after filtering for '${selectedLabel}'.`);
            setChartData({ labels: [], datasets: [] }); // Render empty chart
            setIsLoading(false);
            return;
        }

        // --- (Steps 3-7 are identical to previous version's transformData) ---

        // 3. Group data by Date and SubLabel
        const groupedByDate = {};
        const allSubLabels = new Set();
        let dateField = 'date'; // Default assumption
        const firstItemKeys = Object.keys(filteredData[0]);
        const potentialDateFields = ['date', 'hour', 'timestamp', 'time', 'day'];
        const foundDateField = potentialDateFields.find(field => firstItemKeys.includes(field));
        if (foundDateField) { dateField = foundDateField; }
        else { console.warn(`EnhancedChart[${title}]: Date field detection failed. Using '${dateField}'.`); }

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

        // 4. Prepare data for Chart.js
        const sortedDates = Object.keys(groupedByDate).sort();
        const sortedSubLabels = Array.from(allSubLabels).sort();
        console.log(`EnhancedChart[${title}]: Unique SubLabels (versions) for '${selectedLabel}':`, sortedSubLabels);

        // 5. Generate Colors for SubLabels with isDarkMode parameter
        const colors = generateColorPalette(sortedSubLabels.length, isDarkMode);

        // 6. Create Chart.js Datasets
        const datasets = sortedSubLabels.map((subLabel, index) => {
            const color = colors[index % colors.length];
            return {
                label: subLabel,
                data: sortedDates.map(date => groupedByDate[date][subLabel] || 0),
                backgroundColor: hexToRgba(color, 0.6),
                borderColor: hexToRgba(color, 0.9),
                hoverBackgroundColor: hexToRgba(color, 0.8),
                borderWidth: 1,
                // stack: 'stack1' // Assign stack group if needed
            };
        });
       
        // 7. Set final Chart.js data structure
        const finalChartData = { labels: sortedDates, datasets: datasets };
        console.log(`EnhancedChart[${title}]: Final chartData structure updated for '${selectedLabel}'.`);
        setChartData(finalChartData);

    } catch (transformError) {
        console.error(`EnhancedChart[${title}]: Error during transformation for '${selectedLabel}':`, transformError);
        setError("Failed to process chart data.");
        setChartData({ labels: [], datasets: [] }); // Reset on error
    } finally {
        setIsLoading(false);
    }
  }, [data, selectedLabel, labelField, subLabelField, valueField, title, isDarkMode]); // Added isDarkMode to dependencies


  // --- Effects ---
  useEffect(() => {
    // Re-run transformation when raw data or the selected label prop changes
    transformData();
  }, [transformData]); // transformData has dependencies including selectedLabel and isDarkMode


  // --- Render Logic ---
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Render the Chart component
  // No LabelSelector rendered here anymore
  return (
    <div className="enhanced-chart-container no-controls-padding"> {/* Remove class if needed */}
       {isLoading ? (
           <div className="loading-indicator">Loading chart data...</div>
       ) : (
           <Chart
               // Key ensures Chart.js re-initializes fully when the filter changes
               key={`enhanced-${selectedLabel}-${isDarkMode ? 'dark' : 'light'}`} // Include theme in key for re-render on theme change
               data={chartData}
               // Title is now managed by MetricWidget potentially, or keep simple here
               title="" // Title is handled by Card header
               type={type}
               isDarkMode={isDarkMode} // Pass isDarkMode to Chart
               {...otherProps} // Pass height, format etc.
           />
       )}
    </div>
  );
};

export default EnhancedChart;