const textWidget = {
    id: 'network_overview_text',
    name: 'Network Overview',
    description: 'Information about the network',
    chartType: 'text',
    
    // Size properties (determines grid placement)
    size: 'medium',
    vSize: 'medium',
    
    // Markdown content to display
    content: `
  # Network Overview
  
  This dashboard provides real-time metrics for the ClickHouse cluster performance.
  
  ## Key metrics to monitor:
  
  * **Peer Count**: Total number of connected peers in the network
  * **Client Distribution**: Breakdown of client implementations
  * **Geographic Distribution**: Global distribution of nodes
  
  ## Recent Updates
  
  > The network has seen a 15% increase in node count over the past month, with Lighthouse and Teku clients showing the strongest growth.
  
  ### Performance Notes
  
  Node performance remains stable with average query times under 0.8 seconds.
  
  | Metric | Target | Current |
  |--------|--------|---------|
  | Uptime | >99.9% | 99.95%  |
  | Query Time | <1s | 0.8s   |
  | Error Rate | <0.1% | 0.05% |

  `
  };
  
  export default textWidget;