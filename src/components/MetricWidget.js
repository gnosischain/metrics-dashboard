import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import Chart from './Chart';
import metricsService from '../services/metrics';
import * as formatters from '../utils/formatter';

/**
 * MetricWidget component for displaying a single metric
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
      console.log(`Fetching data for ${metricId} with range ${dateRange}`);
      
      const metricData = await metricsService.fetchMetricData(metricId, dateRange);
      
      // Log what we received to help with debugging
      console.log(`Data received for ${metricId}:`, metricData);
      
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
  
  // Check if we have multi-series data
  const isMultiSeries = data && typeof data === 'object' && !Array.isArray(data) && data.labels && data.datasets;
  
  // Calculate summary values
  const getLatestValue = () => {
    if (isMultiSeries) {
      // For multi-series, show total of the last point across all series
      if (data.datasets && data.datasets.length > 0 && data.datasets[0].data.length > 0) {
        const lastIndex = data.datasets[0].data.length - 1;
        return data.datasets.reduce((total, dataset) => {
          return total + (parseFloat(dataset.data[lastIndex]) || 0);
        }, 0);
      }
      return 0;
    } else if (Array.isArray(data) && data.length > 0) {
      const lastItem = data[data.length - 1];
      return lastItem && typeof lastItem.value !== 'undefined' ? parseFloat(lastItem.value) : 0;
    }
    return 0;
  };
  
  const getAverageValue = () => {
    if (isMultiSeries) {
      // For multi-series, calculate average across all series and points
      if (data.datasets && data.datasets.length > 0) {
        let totalSum = 0;
        let totalPoints = 0;
        
        data.datasets.forEach(dataset => {
          const validValues = dataset.data.filter(val => val !== null && val !== undefined)
            .map(val => parseFloat(val));
          totalSum += validValues.reduce((sum, val) => sum + val, 0);
          totalPoints += validValues.length;
        });
        
        return totalPoints > 0 ? totalSum / totalPoints : 0;
      }
      return 0;
    } else if (Array.isArray(data) && data.length > 0) {
      const validValues = data
        .filter(item => item && item.value !== null && item.value !== undefined)
        .map(item => parseFloat(item.value));
        
      if (validValues.length === 0) return 0;
      
      const sum = validValues.reduce((acc, val) => acc + val, 0);
      return sum / validValues.length;
    }
    return 0;
  };
  
  // Get formatter function for this metric
  const formatter = formatters[metricConfig.format] || formatters.formatNumber;
  
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
          
          {(Array.isArray(data) && data.length > 0) || 
           (isMultiSeries && data.labels && data.labels.length > 0) ? (
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