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