import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

/**
 * D3.js Sankey Diagram Component
 * Supports flow visualizations with customizable styling
 */
const SankeyChart = ({
  data,
  width: containerWidth = '100%',
  height: containerHeight = '100%',
  isDarkMode = false,
  config = {},
  format,
  colors = []
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.links) {
      console.warn('SankeyChart: Invalid data format. Expected {nodes: [], links: []}');
      return;
    }

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    
    // Clear previous render
    svg.selectAll('*').remove();
    
    // Get container dimensions
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    // Set up margins
    const margin = { top: 20, right: 30, bottom: 20, left: 30 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Configure sankey generator
    const sankeyGenerator = sankey()
      .nodeWidth(config.nodeWidth || 15)
      .nodePadding(config.nodePadding || 10)
      .extent([[1, 1], [chartWidth - 1, chartHeight - 5]]);

    // Process data
    const { nodes, links } = sankeyGenerator(data);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(nodes.map(d => d.id || d.name))
      .range(colors.length > 0 ? colors : d3.schemeCategory10);

    // Theme colors
    const textColor = isDarkMode ? '#ffffff' : '#333333';
    const linkOpacity = isDarkMode ? 0.6 : 0.5;
    const nodeStrokeColor = isDarkMode ? '#555555' : '#000000';

    // Create main group
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => colorScale(d.source.id || d.source.name))
      .attr('stroke-opacity', linkOpacity)
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill', 'none');

    // Add nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => colorScale(d.id || d.name))
      .attr('stroke', nodeStrokeColor)
      .attr('stroke-width', 1);

    // Add node labels
    g.append('g')
      .attr('class', 'node-labels')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', d => d.x0 < chartWidth / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < chartWidth / 2 ? 'start' : 'end')
      .attr('font-size', '12px')
      .attr('fill', textColor)
      .text(d => d.name);

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'sankey-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', isDarkMode ? '#333333' : '#ffffff')
      .style('color', textColor)
      .style('border', `1px solid ${isDarkMode ? '#555555' : '#cccccc'}`)
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '10000');

    // Add hover effects for links
    link
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke-opacity', linkOpacity + 0.3)
          .attr('stroke-width', Math.max(2, d.width + 1));
        
        const value = format && format.startsWith('format') 
          ? formatters[format](d.value)
          : d.value.toLocaleString();
        
        tooltip
          .style('visibility', 'visible')
          .html(`${d.source.name} → ${d.target.name}<br/>Value: ${value}`);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .attr('stroke-opacity', linkOpacity)
          .attr('stroke-width', Math.max(1, d.width));
        
        tooltip.style('visibility', 'hidden');
      });

    // Add hover effects for nodes
    node
      .on('mouseover', function(event, d) {
        const totalValue = d.sourceLinks.reduce((sum, link) => sum + link.value, 0) ||
                          d.targetLinks.reduce((sum, link) => sum + link.value, 0);
        
        const value = format && format.startsWith('format')
          ? formatters[format](totalValue)
          : totalValue.toLocaleString();
        
        tooltip
          .style('visibility', 'visible')
          .html(`${d.name}<br/>Total: ${value}`);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('visibility', 'hidden');
      });

    // Cleanup function
    return () => {
      tooltip.remove();
    };

  }, [data, isDarkMode, config, format, colors]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default SankeyChart;