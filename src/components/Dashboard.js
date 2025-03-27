import React, { useState, useEffect } from 'react';
import Header from './Header';
import MetricWidget from './MetricWidget';
import metricsService from '../services/metrics';
import config from '../utils/config';

/**
 * Main Dashboard component
 * @returns {JSX.Element} Dashboard component
 */
const Dashboard = () => {
  // State
  const [dateRange, setDateRange] = useState(config.dateRanges.default);
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Get all metrics configurations
  const metrics = metricsService.getAllMetricsConfig();
  
  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };
  
  // Set up automatic refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, config.dashboard.refreshInterval);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="dashboard">
      <Header 
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onRefresh={handleRefresh}
      />
      
      <div className="dashboard-content">
        <div className="metrics-grid">
          {metrics.map(metric => (
            <MetricWidget 
              key={`${metric.id}-${refreshCounter}`}
              metricId={metric.id}
              dateRange={dateRange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;