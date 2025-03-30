/**
 * Client Distribution Metric Definition
 */
const dataSize = {
  id: 'dataSize',
  name: 'Client Distribution',
  description: 'Distribution of client implementations across the network',
  format: 'formatNumber',
  chartType: 'stackedBar', // Options: 'line', 'bar', 'stackedBar'
  color: [
    '#4285F4', // Lighthouse - Blue
    '#34A853', // Teku - Green
    '#FBBC05', // Lodestar - Yellow
    '#EA4335', // Nimbus - Red
    '#8AB4F8', // Erigon - Light Blue
    '#A0A0A0'  // Unknown - Gray
  ],
  query: `
      SELECT
        day
        ,SUM(if(splitByChar('/', agent_version)[1] ='Lighthouse',1,0)) AS Lighthouse
        ,SUM(if(splitByChar('/', agent_version)[1] ='teku',1,0)) AS Teku
        ,SUM(if(splitByChar('/', agent_version)[1] ='lodestar',1,0)) AS Lodestar
        ,SUM(if(splitByChar('/', agent_version)[1] ='nimbus',1,0)) AS Nimbus
        ,SUM(if(splitByChar('/', agent_version)[1] ='erigon',1,0)) AS Erigon
        ,SUM(if(splitByChar('/', agent_version)[1] ='',1,0)) AS Unknown
      FROM (
        SELECT 
          toStartOfDay(visit_ended_at) AS day
          ,peer_id
          ,any_value(agent_version) AS agent_version
        FROM    
          nebula.visits 
        WHERE
          peer_properties.next_fork_version LIKE '%064'
        GROUP BY 1, 2
      )
        GROUP BY 1
        ORDER BY 1
  `
};

export default dataSize;