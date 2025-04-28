import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from './Card';
import Chart from './Chart';
import EnhancedChart from './EnhancedChart';
import TextWidget from './TextWidget';
import LabelSelector from './LabelSelector';
import metricsService from '../services/metrics';

/**
 * MetricWidget component for displaying a single metric.
 * Manages filter state if the metric is configured for EnhancedChart filtering.
 * @param {Object} props - Component props
 * @param {string} props.metricId - ID of the metric to display
 * @returns {JSX.Element} - Rendered component
 */
const MetricWidget = ({ metricId }) => {
  const [rawData, setRawData] = useState(null); // Store raw API response
  const [chartDisplayData, setChartDisplayData] = useState(null); // Data formatted for Chart/EnhancedChart
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  // State for filtering (managed here now)
  const [uniquePrimaryLabels, setUniquePrimaryLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('');

  // Get metric configuration
  const metricConfig = metricsService.getMetricConfig(metricId);
  const {
      enableFiltering,
      labelField,
      subLabelField,
      chartType,
      name: title,
      description: subtitle,
      content, // For text widgets
      valueField = 'value' // Default value field
  } = metricConfig;

  // Determine if EnhancedChart filtering logic applies
  const requiresEnhancedFiltering = enableFiltering && labelField && subLabelField;

  // Cleanup function for component unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch metric data
  const fetchData = useCallback(async () => {
    if (chartType === 'text') {
      if (isMounted.current) setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRawData(null); // Reset raw data
      setChartDisplayData(null); // Reset display data
      console.log(`MetricWidget[${metricId}]: Fetching data...`);

      // Fetch raw data - metricsService now returns raw data if requiresEnhancedFiltering is true
      const fetchedData = await metricsService.fetchMetricData(metricId);

      if (!isMounted.current) return;

      // --- Process fetched data ---
      if (fetchedData && Array.isArray(fetchedData)) {
          console.log(`MetricWidget[${metricId}]: Received data count: ${fetchedData.length}. Requires Filtering: ${requiresEnhancedFiltering}`);
          setRawData(fetchedData); // Store the raw/pre-transformed data

          if (!requiresEnhancedFiltering) {
              // If standard chart, the fetchedData is already transformed by metricsService
              setChartDisplayData(fetchedData);
              console.log(`MetricWidget[${metricId}]: Setting display data directly (standard chart).`);
          } else {
              // If enhanced filtering, EnhancedChart will transform rawData,
              // but we need to extract labels here for the selector.
              if (fetchedData.length > 0) {
                  const labels = [...new Set(fetchedData.map(item => item[labelField]))].filter(Boolean).sort();
                  setUniquePrimaryLabels(labels);
                  console.log(`MetricWidget[${metricId}]: Extracted unique labels:`, labels);
                  // Set default selected label (first one) if not already set or if previous selection is gone
                  if (labels.length > 0 && !labels.includes(selectedLabel)) {
                      setSelectedLabel(labels[0]);
                      console.log(`MetricWidget[${metricId}]: Setting default selected label to: '${labels[0]}'`);
                  } else if (labels.length === 0) {
                      setSelectedLabel(''); // Reset if no labels found
                  }
                  // Let EnhancedChart handle the display transformation based on rawData and selectedLabel prop
                  setChartDisplayData(fetchedData); // Pass raw data to EnhancedChart
              } else {
                  // Handle empty raw data for filtering case
                  setUniquePrimaryLabels([]);
                  setSelectedLabel('');
                  setChartDisplayData([]); // Pass empty array
                  console.log(`MetricWidget[${metricId}]: No raw data found for enhanced filtering.`);
              }
          }
          setError(null);
      } else if (fetchedData && typeof fetchedData === 'object' && fetchedData.labels && fetchedData.datasets) {
          // Handle cases where metricsService returns Chart.js object directly (e.g., multi-line)
           console.log(`MetricWidget[${metricId}]: Received pre-formatted Chart.js data object.`);
           setRawData(null); // No raw data equivalent here
           setChartDisplayData(fetchedData);
           setUniquePrimaryLabels([]); // No filtering possible
           setSelectedLabel('');
      } else {
          console.warn(`MetricWidget[${metricId}]: Received invalid data:`, fetchedData);
          setError(`No valid data available for ${title}`);
          setRawData(null);
          setChartDisplayData([]);
          setUniquePrimaryLabels([]);
          setSelectedLabel('');
      }
    } catch (err) {
      if (!isMounted.current) return;
      console.error(`MetricWidget[${metricId}]: Error fetching data:`, err);
      setError(`Failed to load data for ${title}`);
      setRawData(null);
      setChartDisplayData([]);
      setUniquePrimaryLabels([]);
      setSelectedLabel('');
    } finally {
      if (isMounted.current) {
        setLoading(false);
        console.log(`MetricWidget[${metricId}]: Fetching complete. Loading: false.`);
      }
    }
  }, [metricId, title, chartType, requiresEnhancedFiltering, labelField, selectedLabel]); // Include selectedLabel dependency? Maybe not for fetch, but for processing.

  // Fetch data on mount and when metricId changes
  useEffect(() => {
    fetchData();
    // Add logic for refresh interval if needed
  }, [fetchData, metricId]); // Removed metricConfig from deps as its values are destructured


  // --- Render Logic ---

  // Determine chart height based on config (ensure this calculation is reasonable)
  const getChartHeight = () => {
      // Check config from dashboard.yml first, then metric default
      const configuredHeight = metricConfig.minHeight; // From dashboard.yml
      if (configuredHeight) return configuredHeight;

      // Fallback to vSize mapping - ensure these pixel values are sufficient
      switch (metricConfig.vSize?.toLowerCase()) {
          case 'small': return '300px'; // Increased default
          case 'medium': return '400px'; // Increased default
          case 'large': return '500px'; // Increased default
          case 'xl': return '600px'; // Increased default
          default: return '400px'; // Default height
      }
  };

  // Handle Text Widget
  if (chartType === 'text') {
    return (
      <TextWidget
        title={title}
        subtitle={subtitle}
        content={content}
      />
    );
  }

  // Prepare Header Controls (Dropdown)
  const headerControls = requiresEnhancedFiltering && uniquePrimaryLabels.length > 0 ? (
      <LabelSelector
          idPrefix={metricId} // Pass metricId for unique IDs
          labels={uniquePrimaryLabels}
          selectedLabel={selectedLabel}
          onSelectLabel={setSelectedLabel}
          labelField={labelField}
      />
  ) : null;


  return (
    <Card
      title={title}
      subtitle={subtitle}
      headerControls={headerControls} // Pass controls to Card
    >
      {loading ? (
        <div className="loading-indicator">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {/* Render Chart or EnhancedChart based on data and config */}
          {(chartDisplayData && (Array.isArray(chartDisplayData) || (chartDisplayData.labels && chartDisplayData.datasets))) ? (
            requiresEnhancedFiltering ? (
              <EnhancedChart
                key={`enhanced-${metricId}-${selectedLabel}`} // Key includes selectedLabel
                data={rawData} // Pass RAW data
                selectedLabel={selectedLabel} // Pass selected label state
                title={title} // Base title
                type={chartType}
                labelField={labelField}
                subLabelField={subLabelField}
                valueField={valueField}
                enableFiltering={true}
                // Pass other relevant props from metricConfig
                height={getChartHeight()}
                format={metricConfig.format}
                pointRadius={metricConfig.pointRadius}
                showPoints={metricConfig.showPoints}
                fill={metricConfig.fill}
              />
            ) : (
              <Chart
                key={`chart-${metricId}`}
                data={chartDisplayData} // Pass potentially pre-transformed data
                title={title}
                type={chartType}
                // Pass other relevant props
                height={getChartHeight()}
                color={metricConfig.color}
                format={metricConfig.format}
                pointRadius={metricConfig.pointRadius}
                showPoints={metricConfig.showPoints}
                fill={metricConfig.fill}
              />
            )
          ) : (
            <div className="no-data-message">No data available</div>
          )}
        </>
      )}
    </Card>
  );
};

export default MetricWidget;