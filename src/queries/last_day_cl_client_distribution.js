const metric = {
  id: 'last_day_cl_client_distribution',
  name: 'CL Client Distribution',
  description: 'Last day % distribution',
  format: 'formatNumber',
  chartType: 'pie',
  
  nameField: 'category',
  valueField: 'value',
  
  query: `
    SELECT 
      client AS category
      ,ROUND(value/(SUM(value) OVER ()) * 100,2) AS value 
    FROM 
        dbt.p2p_peers_clients_daily 
    WHERE date = (SELECT MAX(date) FROM dbt.p2p_peers_clients_daily)
  `,
};

export default metric;