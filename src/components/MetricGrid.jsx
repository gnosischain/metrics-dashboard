import React from 'react';
import MetricWidget from './MetricWidget.jsx';

/**
 * Enhanced MetricGrid component with proper fixed row heights
 * @param {Object} props - Component props
 * @param {Array} props.metrics - Array of metric configurations
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @returns {JSX.Element} Grid component
 */
const MetricGrid = ({ metrics, isDarkMode = false }) => {
  // Process metrics to determine grid structure and row heights
  const processGridStructure = (metrics) => {
    let maxRow = 1;
    let rowHeights = {};

    // First pass: determine max row and collect height information
    metrics.forEach(metric => {
      if (metric.gridRow) {
        const rowInfo = metric.gridRow.toString();
        let rowStart, rowSpan;
        
        if (rowInfo.includes('span')) {
          const parts = rowInfo.split('/');
          rowStart = parseInt(parts[0].trim());
          rowSpan = parseInt(parts[1].trim().split('span')[1].trim());
        } else {
          rowStart = parseInt(rowInfo.trim());
          rowSpan = 1;
        }
        
        const rowEnd = rowStart + rowSpan - 1;
        maxRow = Math.max(maxRow, rowEnd);
        
        // If this is a single row item, record its height
        if (rowSpan === 1 && metric.minHeight) {
          rowHeights[rowStart] = metric.minHeight;
        }
      }
    });

    // Generate template rows with explicit heights where available
    const templateRows = [];
    for (let i = 1; i <= maxRow; i++) {
      templateRows.push(rowHeights[i] || 'auto');
    }

    return {
      maxRow,
      templateRows
    };
  };

  const { templateRows } = processGridStructure(metrics);

  const gridStyle = {
  gridTemplateRows: templateRows.join(' ')
  };

  return (
    <div className="metrics-grid-container">
      <div className="metrics-grid-positioned" style={gridStyle}>
        {metrics.map(metric => {
          // Create inline style for grid positioning
          const metricStyle = {};
          
          // Apply explicit grid positioning if available
          if (metric.gridRow) {
            metricStyle.gridRow = metric.gridRow;
          }
          
          if (metric.gridColumn) {
            metricStyle.gridColumn = metric.gridColumn;
          }
          
          // For multi-row spans, apply height directly to the element
          if (metric.gridRow && metric.gridRow.toString().includes('span') && metric.minHeight) {
            metricStyle.height = metric.minHeight;
          }
          
          return (
            <div 
              key={metric.id} 
              className="grid-item"
              style={metricStyle}
            >
              <MetricWidget 
                metricId={metric.id} 
                isDarkMode={isDarkMode}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricGrid;