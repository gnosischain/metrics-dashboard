const metric = {
    id: 'last_day_el_client_version_distribution',
    name: 'EL Client Distribution by Version',
    description: 'Last day % distribution',
    chartType: 'sunburst',
    format: 'formatNumber',
    
    parentField: 'client',
    childField: 'version', 
    valueField: 'value',
    
    radius: ['0%', '90%'],
    sort: 'desc',
    enableZoom: true,

    query: `
      SELECT 
        client,
        version,
        value
      FROM execution_blocks_clients_version_daily
      WHERE date = today() - INTERVAL 9 DAY 
        AND client != 'Unknown'
      ORDER BY value DESC
    `
};

export default metric;