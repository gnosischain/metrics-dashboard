import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from './Card';
import Chart from './Chart';
import TextWidget from './TextWidget';
import metricsService from '../services/metrics';

/**
 * MetricWidget component for displaying a single metric
 * @param {Object} props - Component props
 * @param {string} props.metricId - ID of the metric to display
 * @returns {JSX.Element} - Rendered component
 */
const MetricWidget = ({ metricId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  
  // Get metric configuration
  const metricConfig = metricsService.getMetricConfig(metricId);
  
  // Cleanup function for component unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Fetch metric data
  const fetchData = useCallback(async () => {
    // If this is a text widget, no need to fetch data
    if (metricConfig.chartType === 'text') {
      if (isMounted.current) {
        setLoading(false);
      }
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Fetching data for ${metricId}`);
      
      const metricData = await metricsService.fetchMetricData(metricId);
      
      // Make sure component is still mounted before updating state
      if (!isMounted.current) return;
      
      // Check if we have valid data
      const isValidData = 
        (Array.isArray(metricData) && metricData.length > 0) || 
        (typeof metricData === 'object' && metricData.labels && metricData.datasets);
      
      if (isValidData) {
        setData(metricData);
        setError(null);
      } else {
        console.warn(`Received invalid data for ${metricId}:`, metricData);
        setData([]);
        setError(`No valid data available for ${metricConfig.name}`);
      }
    } catch (err) {
      if (!isMounted.current) return;
      console.error(`Error fetching ${metricId} data:`, err);
      setError(`Failed to load ${metricConfig.name} data`);
      setData([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [metricId, metricConfig.name, metricConfig.chartType]);
  
  // Fetch data on mount and when metricId changes
  useEffect(() => {
    fetchData();
    
    // Setup refresh interval if specified in the metric config
    const refreshInterval = metricConfig.refreshInterval || 0;
    let intervalId = null;
    
    if (refreshInterval > 0 && metricConfig.chartType !== 'text') {
      intervalId = setInterval(fetchData, refreshInterval * 1000);
    }
    
    // Cleanup interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchData, metricId, metricConfig.refreshInterval, metricConfig.chartType]);
  
  // Check if we have multi-series data
  const isMultiSeries = data && typeof data === 'object' && !Array.isArray(data) && data.labels && data.datasets;
  
  // Determine chart height based on the metric's vertical size
  const getChartHeight = () => {
    // Set fixed heights based on vSize (these need to be explicit pixel values)
    switch(metricConfig.vSize) {
      case 'small':
        return '250px';
      case 'medium':
        return '350px';
      case 'large':
        return '450px';
      case 'xl':
        return '550px';
      default:
        // If vSize is missing, default to medium
        return '350px';
    }
  };

  // If this is a text widget, render the TextWidget component
  if (metricConfig.chartType === 'text') {
    return (
      <TextWidget 
        title={metricConfig.name}
        subtitle={metricConfig.description}
        content={metricConfig.content}
      />
    );
  }

  return (
    <Card 
      title={metricConfig.name}
      subtitle={metricConfig.description}
    >
      {loading ? (
        <div className="loading-indicator">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {(Array.isArray(data) && data.length > 0) || 
           (isMultiSeries && data.labels && data.labels.length > 0) ? (
            <Chart 
              key={`chart-${metricId}`}
              data={data}
              title={metricConfig.name}
              type={metricConfig.chartType}
              color={metricConfig.color}
              format={metricConfig.format}
              height={getChartHeight()} // Explicit height based on vSize
              // Add support for the new chart properties
              pointRadius={metricConfig.pointRadius || 3}
              showPoints={metricConfig.showPoints !== false} // Default to true if not specified
              fill={metricConfig.fill || false} // Default to false if not specified
            />
          ) : (
            <div className="no-data-message">No data available</div>
          )}
        </>
      )}
    </Card>
  );
};

export default MetricWidget;