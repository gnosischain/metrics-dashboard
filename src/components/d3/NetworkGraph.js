import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * D3.js Network Graph Component
 * Force-directed graph with drag, zoom, and clustering support
 */
const NetworkGraph = ({
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
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.links) {
      console.warn('NetworkGraph: Invalid data format. Expected {nodes: [], links: []}');
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

    // Configuration defaults
    const cfg = {
      nodeRadius: config.nodeRadius || 8,
      linkDistance: config.linkDistance || 50,
      linkStrength: config.linkStrength || 0.1,
      chargeStrength: config.chargeStrength || -300,
      centerStrength: config.centerStrength || 0.1,
      enableDrag: config.enableDrag !== false,
      enableZoom: config.enableZoom !== false,
      showLabels: config.showLabels !== false,
      clusterByGroup: config.clusterByGroup || false,
      ...config
    };

    // Theme colors
    const linkColor = isDarkMode ? '#666666' : '#999999';
    const textColor = isDarkMode ? '#ffffff' : '#333333';
    const backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';

    // Color scale for nodes
    const colorScale = d3.scaleOrdinal()
      .domain([...new Set(data.nodes.map(d => d.group || 'default'))])
      .range(colors.length > 0 ? colors : d3.schemeCategory10);

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    // Apply zoom if enabled
    if (cfg.enableZoom) {
      svg.call(zoom);
    }

    // Create main group
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g');

    // Create force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links)
        .id(d => d.id)
        .distance(cfg.linkDistance)
        .strength(cfg.linkStrength))
      .force('charge', d3.forceManyBody().strength(cfg.chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(cfg.centerStrength));

    // Add clustering force if enabled
    if (cfg.clusterByGroup) {
      const groupCenters = {};
      const groups = [...new Set(data.nodes.map(d => d.group || 'default'))];
      
      groups.forEach((group, i) => {
        const angle = (i / groups.length) * 2 * Math.PI;
        const radius = Math.min(width, height) * 0.3;
        groupCenters[group] = {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius
        };
      });

      simulation.force('cluster', d3.forceX()
        .x(d => groupCenters[d.group || 'default'].x)
        .strength(0.1))
        .force('clusterY', d3.forceY()
        .y(d => groupCenters[d.group || 'default'].y)
        .strength(0.1));
    }

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', linkColor)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value || 1));

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', d => d.size || cfg.nodeRadius)
      .attr('fill', d => colorScale(d.group || 'default'))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Create labels if enabled
    let labels = null;
    if (cfg.showLabels) {
      labels = g.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(data.nodes)
        .join('text')
        .text(d => d.name || d.id)
        .attr('font-size', '10px')
        .attr('fill', textColor)
        .attr('text-anchor', 'middle')
        .attr('dy', d => (d.size || cfg.nodeRadius) + 12);
    }

    // Add drag behavior if enabled
    if (cfg.enableDrag) {
      const drag = d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });

      node.call(drag);
    }

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'network-tooltip')
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

    // Add hover effects
    node
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 3)
          .attr('stroke', '#ffff00');
        
        // Highlight connected links
        link
          .attr('stroke-opacity', l => 
            (l.source === d || l.target === d) ? 1 : 0.1)
          .attr('stroke-width', l => 
            (l.source === d || l.target === d) ? Math.sqrt(l.value || 1) + 1 : Math.sqrt(l.value || 1));
        
        // Show tooltip
        const connections = data.links.filter(l => l.source === d || l.target === d).length;
        const value = d.value && format && format.startsWith('format')
          ? formatters[format](d.value)
          : d.value || 'N/A';
        
        tooltip
          .style('visibility', 'visible')
          .html(`
            <strong>${d.name || d.id}</strong><br/>
            ${d.group ? `Group: ${d.group}<br/>` : ''}
            ${d.value ? `Value: ${value}<br/>` : ''}
            Connections: ${connections}
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 1.5)
          .attr('stroke', '#fff');
        
        // Reset link highlighting
        link
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', d => Math.sqrt(d.value || 1));
        
        tooltip.style('visibility', 'hidden');
      })
      .on('click', function(event, d) {
        setSelectedNode(d);
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      if (labels) {
        labels
          .attr('x', d => d.x)
          .attr('y', d => d.y);
      }
    });

    // Cleanup function
    return () => {
      tooltip.remove();
      simulation.stop();
    };

  }, [data, isDarkMode, config, format, colors]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff'
      }}
    >
      <svg ref={svgRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
      
      {/* Control panel */}
      <div 
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: isDarkMode ? '#333333' : '#ffffff',
          border: `1px solid ${isDarkMode ? '#555555' : '#cccccc'}`,
          borderRadius: '4px',
          padding: '8px',
          fontSize: '12px',
          color: isDarkMode ? '#ffffff' : '#333333'
        }}
      >
        <div>Nodes: {data.nodes.length}</div>
        <div>Links: {data.links.length}</div>
        {selectedNode && (
          <div>
            <hr style={{ margin: '4px 0', borderColor: isDarkMode ? '#555555' : '#cccccc' }} />
            <div><strong>Selected:</strong></div>
            <div>{selectedNode.name || selectedNode.id}</div>
            {selectedNode.group && <div>Group: {selectedNode.group}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkGraph;