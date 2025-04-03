import React from 'react';
import Header from './Header';
import MetricWidget from './MetricWidget';
import metricsService from '../services/metrics';

/**
 * Main Dashboard component
 * @returns {JSX.Element} Dashboard component
 */
const Dashboard = () => {
  // Get all metrics configurations
  const metrics = metricsService.getAllMetricsConfig();
  
  return (
    <div className="dashboard">
      <Header />
      
      <div className="dashboard-content">
        <div className="metrics-grid">
          {metrics.map(metric => (
            <MetricWidget 
              key={metric.id}
              metricId={metric.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;