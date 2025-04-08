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
 * Convert vertical size to CSS class
 * @param {string} vSize - Vertical size value (small, medium, large, xl)
 * @returns {string} CSS class
 */
const vSizeToClass = (vSize) => {
  switch (vSize?.toLowerCase()) {
    case 'small':
      return 'grid-item-v-small';
    case 'medium':
      return 'grid-item-v-medium';
    case 'large':
      return 'grid-item-v-large';
    case 'xl':
      return 'grid-item-v-xl';
    default:
      return 'grid-item-v-medium'; // Default vertical size
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
 // const optimizedMetrics = optimizeGridLayout(metrics);
  const sortedMetrics = [...metrics].sort((a, b) => a.id.localeCompare(b.id));
  return (
    <div className="metrics-grid">
      {sortedMetrics.map(metric => (
        <div 
          key={metric.id} 
          className={`grid-item ${sizeToClass(metric.size)} ${vSizeToClass(metric.vSize)}`}
          style={{ 
            // Enforce grid item height explicitly via inline style also
            height: metric.vSize === 'small' ? '300px' : 
                   metric.vSize === 'medium' ? '400px' : 
                   metric.vSize === 'large' ? '500px' : 
                   metric.vSize === 'xl' ? '600px' : '400px'
          }}
        >
          <MetricWidget metricId={metric.id} />
        </div>
      ))}
    </div>
  );
};

export default MetricGrid;