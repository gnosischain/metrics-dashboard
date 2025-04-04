import React from 'react';
import MetricWidget from './MetricWidget';
import { optimizeGridLayout } from '../utils/gridLayoutManager';

/**
 * Convert metric size to CSS class
 * @param {string} size - Size value (small, medium, large, full)
 * @returns {string} CSS class
 */
const sizeToClass = (size) => {
  switch (size?.toLowerCase()) {
    case 'small':
      return 'grid-item-small';
    case 'medium':
      return 'grid-item-medium';
    case 'large':
      return 'grid-item-large';
    case 'full':
      return 'grid-item-full';
    default:
      return 'grid-item-medium'; // Default size
  }
};

/**
 * MetricGrid component for displaying metrics in a responsive grid layout
 * @param {Object} props - Component props
 * @param {Array} props.metrics - Array of metric configurations
 * @returns {JSX.Element} Grid component
 */
const MetricGrid = ({ metrics }) => {
  // Optimize the layout of metrics for better grid organization
  const optimizedMetrics = optimizeGridLayout(metrics);
  
  return (
    <div className="metrics-grid">
      {optimizedMetrics.map(metric => (
        <div 
          key={metric.id} 
          className={`grid-item ${sizeToClass(metric.size)}`}
        >
          <MetricWidget metricId={metric.id} />
        </div>
      ))}
    </div>
  );
};

export default MetricGrid;