import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import Chart from './Chart';
import metricsService from '../services/metrics';
import * as formatters from '../utils/formatter';

/**
 * MetricWidget component for displaying a single metric
 * @param {Object} props - Component props
 * @param {string} props.metricId - ID of the metric to display
 * @param {string} props.dateRange - Current date range
 * @returns {JSX.Element} MetricWidget component
 */
const MetricWidget = ({ metricId, dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get metric configuration
  const metricConfig = metricsService.getMetricConfig(metricId);
  
  // Fetch metric data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const metricData = await metricsService.fetchMetricData(metricId, dateRange);
      
      // Make sure metricData is an array and has valid elements
      if (Array.isArray(metricData) && metricData.length > 0) {
        setData(metricData);
      } else {
        console.warn(`Received invalid data for ${metricId}:`, metricData);
        setData([]);
        setError(`No valid data available for ${metricConfig.name}`);
      }
    } catch (err) {
      console.error(`Error fetching ${metricId} data:`, err);
      setError(`Failed to load ${metricConfig.name} data`);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [metricId, dateRange, metricConfig.name]);
  
  // Fetch data on mount and when date range changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Calculate summary values
  const getLatestValue = () => {
    if (!Array.isArray(data) || data.length === 0) return 0;
    const lastItem = data[data.length - 1];
    return lastItem && typeof lastItem.value !== 'undefined' ? lastItem.value : 0;
  };
  
  const getAverageValue = () => {
    if (!Array.isArray(data) || data.length === 0) return 0;
    
    const validValues = data
      .filter(item => item && typeof item.value !== 'undefined')
      .map(item => item.value);
      
    if (validValues.length === 0) return 0;
    
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return sum / validValues.length;
  };
  
  // Get formatter function for this metric
  const formatter = formatters[metricConfig.format];
  
  // Format values using the appropriate formatter
  const formatValue = (value) => {
    return formatter ? formatter(value) : value;
  };
  
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
          <div className="metric-summary">
            <div className="metric-value">
              <span className="label">Latest:</span>
              <span className="value">{formatValue(getLatestValue())}</span>
            </div>
            <div className="metric-value">
              <span className="label">Average:</span>
              <span className="value">{formatValue(getAverageValue())}</span>
            </div>
          </div>
          
          {Array.isArray(data) && data.length > 0 ? (
            <Chart 
              data={data}
              title={metricConfig.name}
              type={metricConfig.chartType}
              color={metricConfig.color}
            />
          ) : (
            <div className="no-data-message">No data available for the selected period</div>
          )}
        </>
      )}
    </Card>
  );
};

export default MetricWidget;