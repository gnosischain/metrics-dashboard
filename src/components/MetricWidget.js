import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from './Card';
import Chart from './Chart';
import EnhancedChart from './EnhancedChart';
import StackedAreaChart from './StackedAreaChart';
import TextWidget from './TextWidget';
import LabelSelector from './LabelSelector';
import metricsService from '../services/metrics';

/**
 * MetricWidget component for displaying a single metric.
 * Manages filter state if the metric is configured for EnhancedChart filtering.
 * @param {Object} props - Component props
 * @param {string} props.metricId - ID of the metric to display
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @returns {JSX.Element} - Rendered component
 */
const MetricWidget = ({ metricId, isDarkMode = false }) => {
  const [rawData, setRawData] = useState(null);
  const [chartDisplayData, setChartDisplayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const [uniquePrimaryLabels, setUniquePrimaryLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('');

  const metricConfig = metricsService.getMetricConfig(metricId);
  const {
      enableFiltering,
      labelField,
      subLabelField,
      chartType,
      name: title,
      description: subtitle,
      content,
      valueField = 'value',
      stackedArea = false,
      stacked = false,
      fill = false,
      isTimeSeries = false,
      enableZoom = false
  } = metricConfig;

  const isStackedAreaChart = chartType === 'area' && (stackedArea === true || stacked === true);
  const requiresEnhancedFiltering = enableFiltering && labelField && subLabelField;
  const isExpandable = chartType !== 'numberDisplay' && chartType !== 'text';

  // NEW: Determine which component should handle zoom for stacked area charts
  const shouldUseStackedAreaChartWithZoom = isStackedAreaChart && !requiresEnhancedFiltering && (enableZoom || isTimeSeries);

  useEffect(() => {
    console.log(`MetricWidget[${metricId}]: Configuration:`, {
      chartType,
      isStackedAreaChart,
      requiresEnhancedFiltering,
      labelField,
      stackedArea,
      stacked,
      isExpandable,
      isTimeSeries,
      enableZoom,
      shouldUseStackedAreaChartWithZoom // Log the new decision
    });
  }, [metricId, chartType, isStackedAreaChart, requiresEnhancedFiltering, labelField, stackedArea, stacked, isExpandable, isTimeSeries, enableZoom, shouldUseStackedAreaChartWithZoom]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (chartType === 'text') {
      if (isMounted.current) setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setRawData(null);
      setChartDisplayData(null);
      console.log(`MetricWidget[${metricId}]: Fetching data...`);
      const fetchedData = await metricsService.fetchMetricData(metricId);
      if (!isMounted.current) return;

      if (fetchedData) {
        console.log(`MetricWidget[${metricId}]: Data structure:`,
          Array.isArray(fetchedData)
            ? `Array with ${fetchedData.length} items`
            : (fetchedData.datasets ? `Chart.js format with ${fetchedData.datasets.length} datasets` : 'Other format'));
      }

      if (fetchedData && Array.isArray(fetchedData)) {
          console.log(`MetricWidget[${metricId}]: Received data count: ${fetchedData.length}. Requires Filtering: ${requiresEnhancedFiltering}`);
          setRawData(fetchedData);

          if (!requiresEnhancedFiltering) {
              setChartDisplayData(fetchedData);
              console.log(`MetricWidget[${metricId}]: Setting display data directly (standard chart).`);
          } else {
              if (fetchedData.length > 0) {
                  const labels = [...new Set(fetchedData.map(item => item[labelField]))].filter(Boolean).sort();
                  setUniquePrimaryLabels(labels);
                  console.log(`MetricWidget[${metricId}]: Extracted unique labels:`, labels);
                  if (labels.length > 0 && !labels.includes(selectedLabel)) {
                      setSelectedLabel(labels[0]);
                      console.log(`MetricWidget[${metricId}]: Setting default selected label to: '${labels[0]}'`);
                  } else if (labels.length === 0) {
                      setSelectedLabel('');
                  }
                  setChartDisplayData(fetchedData);
              } else {
                  setUniquePrimaryLabels([]);
                  setSelectedLabel('');
                  setChartDisplayData([]);
                  console.log(`MetricWidget[${metricId}]: No raw data found for enhanced filtering.`);
              }
          }
          setError(null);
      } else if (fetchedData && typeof fetchedData === 'object' && fetchedData.labels && fetchedData.datasets) {
           console.log(`MetricWidget[${metricId}]: Received pre-formatted Chart.js data object.`);
           setRawData(null);
           setChartDisplayData(fetchedData);
           setUniquePrimaryLabels([]);
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
  }, [metricId, title, chartType, requiresEnhancedFiltering, labelField, selectedLabel]);

  useEffect(() => {
    fetchData();
  }, [fetchData, metricId]);

  const getChartHeight = () => {
      const configuredHeight = metricConfig.minHeight;
      if (configuredHeight) return configuredHeight;
      switch (metricConfig.vSize?.toLowerCase()) {
          case 'small': return '300px';
          case 'medium': return '400px';
          case 'large': return '500px';
          case 'xl': return '600px';
          default: return '400px';
      }
  };

  if (chartType === 'text') {
    return <TextWidget title={title} subtitle={subtitle} content={content} />;
  }

  const createHeaderControls = () => {
    if (requiresEnhancedFiltering && uniquePrimaryLabels.length > 0) {
      return (
        <LabelSelector
          idPrefix={metricId}
          labels={uniquePrimaryLabels}
          selectedLabel={selectedLabel}
          onSelectLabel={setSelectedLabel}
          labelField={labelField}
        />
      );
    }
    return null;
  };

  const headerControls = createHeaderControls();

  return (
    <Card
      title={title}
      subtitle={subtitle}
      headerControls={headerControls}
      expandable={isExpandable}
      isDarkMode={isDarkMode}
      chartType={chartType}
    >
      {loading ? (
        <div className="loading-indicator">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {(chartDisplayData && (Array.isArray(chartDisplayData) || (chartDisplayData.labels && chartDisplayData.datasets))) ? (
            requiresEnhancedFiltering ? (
              <EnhancedChart
                key={`enhanced-${metricId}-${selectedLabel}-${isDarkMode ? 'dark' : 'light'}`}
                data={rawData} // EnhancedChart receives rawData
                selectedLabel={selectedLabel}
                title={title}
                type={chartType}
                labelField={labelField}
                subLabelField={subLabelField}
                valueField={valueField}
                enableFiltering={true}
                height={getChartHeight()}
                format={metricConfig.format}
                pointRadius={metricConfig.pointRadius}
                showPoints={metricConfig.showPoints}
                fill={metricConfig.fill}
                isDarkMode={isDarkMode}
                isTimeSeries={isTimeSeries}
                enableZoom={enableZoom}
                metricId={metricId}
              />
            ) : shouldUseStackedAreaChartWithZoom ? (
              // NEW: Use StackedAreaChart for stacked area charts with zoom support
              <StackedAreaChart
                key={`stacked-area-${metricId}-${isDarkMode ? 'dark' : 'light'}`}
                data={chartDisplayData}
                title={title}
                height={getChartHeight()}
                format={metricConfig.format}
                isDarkMode={isDarkMode}
                isTimeSeries={isTimeSeries} // Pass the new props
                enableZoom={enableZoom}     // Pass the new props
                metricId={metricId}         // Pass metricId for keying
              />
            ) : isStackedAreaChart && chartDisplayData.labels && chartDisplayData.datasets ? (
              // Legacy StackedAreaChart without zoom
              <StackedAreaChart
                key={`stacked-area-${metricId}-${isDarkMode ? 'dark' : 'light'}`}
                data={chartDisplayData}
                title={title}
                height={getChartHeight()}
                format={metricConfig.format}
                isDarkMode={isDarkMode}
                // Note: isTimeSeries and enableZoom are not passed here for legacy behavior
              />
            ) : (
              <Chart
                key={`chart-${metricId}-${isDarkMode ? 'dark' : 'light'}`}
                data={chartDisplayData}
                title={title}
                type={chartType}
                height={getChartHeight()}
                color={metricConfig.color}
                format={metricConfig.format}
                pointRadius={metricConfig.pointRadius}
                showPoints={metricConfig.showPoints}
                fill={metricConfig.fill}
                stacked={metricConfig.stacked}
                stackedArea={metricConfig.stackedArea}
                isDarkMode={isDarkMode}
                isTimeSeries={isTimeSeries}
                enableZoom={enableZoom}
                metricId={metricId}
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