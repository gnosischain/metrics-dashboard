/**
 * Data Size Metric Definition
 * 
 * This metric measures the amount of data processed by queries in bytes.
 */

const dataSize = {
    id: 'dataSize',
    name: 'Data Processed',
    description: 'Amount of data processed by queries',
    format: 'formatBytes',
    chartType: 'line',
    color: '#34A853',
    query: `
      SELECT 
      toStartOfHour(t2.created_at) AS hour
      ,SUM(if(splitByChar('/', t1.agent_version)[1] ='Lighthouse',1,0)) AS Lighthouse
      ,SUM(if(splitByChar('/', t1.agent_version)[1] ='teku',1,0)) AS Teku
      ,SUM(if(splitByChar('/', t1.agent_version)[1] ='lodestar',1,0)) AS Lodestar
      ,SUM(if(splitByChar('/', t1.agent_version)[1] ='nimbus',1,0)) AS Nimbus
      ,SUM(if(splitByChar('/', t1.agent_version)[1] ='erigon',1,0)) AS Erigon
      ,SUM(if(splitByChar('/', t1.agent_version)[1] ='',1,0)) AS Unknown
    FROM    
      nebula.visits t1
    INNER JOIN
      nebula.crawls t2
      ON t2.id = t1.crawl_id
    WHERE
        peer_properties.next_fork_version LIKE '%064'
    GROUP BY 1
    `
  };
  
  export default dataSize;